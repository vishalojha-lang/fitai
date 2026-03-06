import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: typeof users.$inferSelect;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Try Firebase first (only if Firebase is configured/initialized)
    if (admin.apps.length > 0) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        const user = await db.select().from(users).where(eq(users.firebaseUid, decoded.uid)).limit(1);
        if (user.length > 0) {
          req.user = user[0];
          next();
          return;
        }
      } catch {
        // Firebase verification failed, fall through to JWT
      }
    }

    // Try JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (user.length === 0) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      req.user = user[0];
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
