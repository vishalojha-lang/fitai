import { Router } from 'express';
import { db } from '../db';
import { progressEntries } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const progressSchema = z.object({
  bodyWeight: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  arms: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const entries = await db.select().from(progressEntries)
      .where(eq(progressEntries.userId, userId))
      .orderBy(desc(progressEntries.logDate));
    return res.json({ entries });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const parsed = progressSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [entry] = await db.insert(progressEntries).values({ ...parsed.data, userId }).returning();
    return res.status(201).json({ entry });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/charts', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const entries = await db.select().from(progressEntries)
      .where(eq(progressEntries.userId, userId))
      .orderBy(progressEntries.logDate);
    const chartData = entries.map(e => ({
      date: e.logDate,
      bodyWeight: e.bodyWeight,
      chest: e.chest,
      waist: e.waist,
      arms: e.arms,
      thighs: e.thighs,
    }));
    return res.json({ chartData });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
