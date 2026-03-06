import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros } from '../utils/calculations';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  fitnessGoal: z.string().optional(),
  activityLevel: z.string().optional(),
  dietPreference: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const onboardingSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().positive(),
  gender: z.string(),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  fitnessGoal: z.string(),
  activityLevel: z.string(),
  dietPreference: z.string().optional(),
});

router.get('/', (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

router.put('/', async (req: AuthRequest, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [updated] = await db.update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return res.json({ user: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/onboarding', async (req: AuthRequest, res) => {
  try {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { age, gender, heightCm, weightKg, fitnessGoal, activityLevel, dietPreference, name } = parsed.data;
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const dailyCalories = calculateDailyCalories(tdee, fitnessGoal);
    const macros = calculateMacros(dailyCalories, fitnessGoal);
    const userId = req.user!.id;
    const [updated] = await db.update(users)
      .set({
        name,
        age,
        gender,
        heightCm,
        weightKg,
        fitnessGoal,
        activityLevel,
        dietPreference,
        bmr,
        dailyCalories,
        dailyProtein: macros.protein,
        dailyCarbs: macros.carbs,
        dailyFat: macros.fat,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return res.json({ user: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
