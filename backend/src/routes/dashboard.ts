import { Router } from 'express';
import { db } from '../db';
import { foodLogs, workoutLogs, habitLogs } from '../db/schema';
import { eq, and, sum } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = req.user!;
    const today = new Date().toISOString().split('T')[0];

    const [foodTotals] = await db
      .select({
        totalCalories: sum(foodLogs.calories),
        totalProtein: sum(foodLogs.protein),
        totalCarbs: sum(foodLogs.carbs),
        totalFat: sum(foodLogs.fat),
      })
      .from(foodLogs)
      .where(and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, today)));

    const todayWorkouts = await db.select().from(workoutLogs)
      .where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.workoutDate, today)));

    const [habitLog] = await db.select().from(habitLogs)
      .where(and(eq(habitLogs.userId, userId), eq(habitLogs.logDate, today)))
      .limit(1);

    return res.json({
      date: today,
      foodSummary: {
        calories: parseFloat(foodTotals?.totalCalories ?? '0'),
        protein: parseFloat(foodTotals?.totalProtein ?? '0'),
        carbs: parseFloat(foodTotals?.totalCarbs ?? '0'),
        fat: parseFloat(foodTotals?.totalFat ?? '0'),
      },
      targets: {
        calories: user.dailyCalories,
        protein: user.dailyProtein,
        carbs: user.dailyCarbs,
        fat: user.dailyFat,
      },
      workouts: todayWorkouts,
      habits: habitLog ?? null,
      profile: {
        name: user.name,
        fitnessGoal: user.fitnessGoal,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
