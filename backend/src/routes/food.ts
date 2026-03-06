import { Router } from 'express';
import { db } from '../db';
import { foodLogs, foodDatabase } from '../db/schema';
import { eq, and, ilike, sum } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const foodLogSchema = z.object({
  foodName: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  portionSize: z.string().optional(),
  mealType: z.string().min(1),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const date = req.query.date as string | undefined;
    const userId = req.user!.id;
    const logs = date
      ? await db.select().from(foodLogs).where(and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, date)))
      : await db.select().from(foodLogs).where(eq(foodLogs.userId, userId));
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logs', async (req: AuthRequest, res) => {
  try {
    const parsed = foodLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [log] = await db.insert(foodLogs).values({ ...parsed.data, userId }).returning();
    return res.status(201).json({ log });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/logs/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params['id']);
    const userId = req.user!.id;
    await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)));
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', async (req: AuthRequest, res) => {
  try {
    const q = req.query.q as string | undefined;
    if (!q || q.trim().length === 0) {
      return res.json({ foods: [] });
    }
    const foods = await db.select().from(foodDatabase).where(ilike(foodDatabase.name, `%${q}%`)).limit(20);
    return res.json({ foods });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/summary', async (req: AuthRequest, res) => {
  try {
    const date = req.query.date as string | undefined;
    const userId = req.user!.id;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter required' });
    }
    const [totals] = await db
      .select({
        totalCalories: sum(foodLogs.calories),
        totalProtein: sum(foodLogs.protein),
        totalCarbs: sum(foodLogs.carbs),
        totalFat: sum(foodLogs.fat),
      })
      .from(foodLogs)
      .where(and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, date)));

    const user = req.user!;
    return res.json({
      date,
      totals: {
        calories: parseFloat(totals?.totalCalories ?? '0'),
        protein: parseFloat(totals?.totalProtein ?? '0'),
        carbs: parseFloat(totals?.totalCarbs ?? '0'),
        fat: parseFloat(totals?.totalFat ?? '0'),
      },
      targets: {
        calories: user.dailyCalories,
        protein: user.dailyProtein,
        carbs: user.dailyCarbs,
        fat: user.dailyFat,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
