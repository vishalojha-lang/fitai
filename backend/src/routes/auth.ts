import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import admin from '../config/firebase';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { email, password, name } = parsed.data;
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, passwordHash, name }).returning();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { email, password } = parsed.data;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

router.post('/firebase', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    const existing = await db.select().from(users).where(eq(users.firebaseUid, decoded.uid)).limit(1);
    let user = existing[0];
    if (!user) {
      const [newUser] = await db.insert(users).values({
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || null,
        avatarUrl: decoded.picture || null,
      }).returning();
      user = newUser;
    }
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

export default router;
