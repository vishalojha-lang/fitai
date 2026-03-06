import { Router } from 'express';
import { db } from '../db';
import { habitLogs } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const habitSchema = z.object({
  waterIntakeMl: z.number().int().nonnegative().optional(),
  sleepHours: z.number().nonnegative().optional(),
  stepCount: z.number().int().nonnegative().optional(),
  gymAttended: z.boolean().optional(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const date = req.query.date as string | undefined;
    const userId = req.user!.id;
    if (date) {
      const [log] = await db.select().from(habitLogs)
        .where(and(eq(habitLogs.userId, userId), eq(habitLogs.logDate, date)))
        .limit(1);
      return res.json({ log: log ?? null });
    }
    const logs = await db.select().from(habitLogs).where(eq(habitLogs.userId, userId));
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const parsed = habitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [log] = await db.insert(habitLogs).values({ ...parsed.data, userId }).returning();
    return res.status(201).json({ log });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params['id']);
    const parsed = habitSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [updated] = await db.update(habitLogs)
      .set(parsed.data)
      .where(and(eq(habitLogs.id, id), eq(habitLogs.userId, userId)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Habit log not found' });
    }
    return res.json({ log: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
