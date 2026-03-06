import { Router } from 'express';
import { db } from '../db';
import { workoutPlans, workoutLogs } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const workoutLogSchema = z.object({
  exerciseName: z.string().min(1),
  sets: z.array(z.object({
    setNumber: z.number().int().positive(),
    weight: z.number().nonnegative(),
    reps: z.number().int().nonnegative(),
  })),
  workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

type Exercise = { name: string; sets: number; reps: string; restTime: string };
type DayPlan = {
  dayOfWeek: number;
  muscleGroup: string | null;
  exercises: Exercise[] | null;
  fitnessGoal: string;
  isRestDay: boolean;
};

function getWorkoutPlan(fitnessGoal: string): DayPlan[] {
  switch (fitnessGoal) {
    case 'fat_loss':
      return [
        { dayOfWeek: 0, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 1, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Jumping Jacks', sets: 3, reps: '30 reps', restTime: '30 sec' },
            { name: 'Burpees', sets: 3, reps: '10 reps', restTime: '60 sec' },
            { name: 'Mountain Climbers', sets: 3, reps: '20 reps', restTime: '30 sec' },
            { name: 'High Knees', sets: 3, reps: '30 reps', restTime: '30 sec' },
            { name: 'Squat Jumps', sets: 3, reps: '15 reps', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 2, muscleGroup: 'Upper Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', restTime: '90 sec' },
            { name: 'Dumbbell Rows', sets: 4, reps: '10', restTime: '60 sec' },
            { name: 'Shoulder Press', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Push-ups', sets: 3, reps: '15', restTime: '45 sec' },
            { name: 'Tricep Dips', sets: 3, reps: '12', restTime: '60 sec' },
          ],
        },
        { dayOfWeek: 3, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 4, muscleGroup: 'Lower Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Squats', sets: 4, reps: '10', restTime: '90 sec' },
            { name: 'Lunges', sets: 3, reps: '12 each', restTime: '60 sec' },
            { name: 'Deadlifts', sets: 4, reps: '8', restTime: '90 sec' },
            { name: 'Leg Press', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Calf Raises', sets: 3, reps: '15', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 5, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Box Jumps', sets: 4, reps: '10', restTime: '60 sec' },
            { name: 'Kettlebell Swings', sets: 3, reps: '15', restTime: '45 sec' },
            { name: 'Battle Ropes', sets: 3, reps: '30 sec', restTime: '60 sec' },
            { name: 'Rowing Machine', sets: 3, reps: '3 min', restTime: '90 sec' },
          ],
        },
        {
          dayOfWeek: 6, muscleGroup: 'Core', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Plank', sets: 3, reps: '60 sec hold', restTime: '45 sec' },
            { name: 'Crunches', sets: 3, reps: '20', restTime: '30 sec' },
            { name: 'Russian Twists', sets: 3, reps: '15 each', restTime: '30 sec' },
            { name: 'Leg Raises', sets: 3, reps: '15', restTime: '30 sec' },
            { name: 'Bicycle Crunches', sets: 3, reps: '20', restTime: '30 sec' },
          ],
        },
      ];

    case 'muscle_gain':
      return [
        { dayOfWeek: 0, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 1, muscleGroup: 'Chest, Triceps', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8', restTime: '120 sec' },
            { name: 'Incline Dumbbell Press', sets: 4, reps: '10', restTime: '90 sec' },
            { name: 'Cable Flyes', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Tricep Dips', sets: 4, reps: '10', restTime: '90 sec' },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12', restTime: '60 sec' },
          ],
        },
        {
          dayOfWeek: 2, muscleGroup: 'Back, Biceps', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Pull-ups', sets: 4, reps: '8', restTime: '120 sec' },
            { name: 'Barbell Rows', sets: 4, reps: '8', restTime: '90 sec' },
            { name: 'Lat Pulldowns', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Barbell Curls', sets: 4, reps: '10', restTime: '60 sec' },
            { name: 'Hammer Curls', sets: 3, reps: '12', restTime: '60 sec' },
          ],
        },
        {
          dayOfWeek: 3, muscleGroup: 'Legs', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Barbell Squats', sets: 5, reps: '5', restTime: '180 sec' },
            { name: 'Leg Press', sets: 4, reps: '10', restTime: '90 sec' },
            { name: 'Walking Lunges', sets: 3, reps: '12 each', restTime: '60 sec' },
            { name: 'Leg Curls', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Calf Raises', sets: 4, reps: '15', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 4, muscleGroup: 'Shoulders, Core', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Overhead Press', sets: 4, reps: '8', restTime: '120 sec' },
            { name: 'Lateral Raises', sets: 4, reps: '12', restTime: '60 sec' },
            { name: 'Front Raises', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Face Pulls', sets: 3, reps: '15', restTime: '60 sec' },
            { name: 'Planks', sets: 3, reps: '60 sec', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 5, muscleGroup: 'Arms', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Barbell Curls', sets: 4, reps: '10', restTime: '60 sec' },
            { name: 'Tricep Extensions', sets: 4, reps: '10', restTime: '60 sec' },
            { name: 'Concentration Curls', sets: 3, reps: '12', restTime: '45 sec' },
            { name: 'Skull Crushers', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Wrist Curls', sets: 3, reps: '15', restTime: '30 sec' },
          ],
        },
        {
          dayOfWeek: 6, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Clean and Press', sets: 4, reps: '6', restTime: '120 sec' },
            { name: 'Pull-ups', sets: 3, reps: '8', restTime: '90 sec' },
            { name: 'Dumbbell Lunges', sets: 3, reps: '10 each', restTime: '60 sec' },
            { name: 'Push-ups', sets: 3, reps: '15', restTime: '45 sec' },
          ],
        },
      ];

    case 'strength_training':
      return [
        { dayOfWeek: 0, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 1, muscleGroup: 'Legs', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Barbell Squats', sets: 5, reps: '5', restTime: '300 sec' },
            { name: 'Pause Squats', sets: 3, reps: '3', restTime: '180 sec' },
            { name: 'Leg Press', sets: 3, reps: '8', restTime: '120 sec' },
            { name: 'Leg Curls', sets: 3, reps: '10', restTime: '90 sec' },
          ],
        },
        {
          dayOfWeek: 2, muscleGroup: 'Chest', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Bench Press', sets: 5, reps: '5', restTime: '300 sec' },
            { name: 'Incline Press', sets: 3, reps: '6', restTime: '180 sec' },
            { name: 'Close Grip Bench', sets: 3, reps: '8', restTime: '120 sec' },
            { name: 'Dips', sets: 3, reps: '8', restTime: '90 sec' },
          ],
        },
        { dayOfWeek: 3, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 4, muscleGroup: 'Back', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Deadlifts', sets: 5, reps: '3', restTime: '300 sec' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '6', restTime: '180 sec' },
            { name: 'Rows', sets: 4, reps: '6', restTime: '120 sec' },
            { name: 'Pull-ups', sets: 3, reps: '6', restTime: '90 sec' },
          ],
        },
        {
          dayOfWeek: 5, muscleGroup: 'Shoulders', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Overhead Press', sets: 5, reps: '5', restTime: '300 sec' },
            { name: 'Push Press', sets: 3, reps: '5', restTime: '180 sec' },
            { name: 'Lateral Raises', sets: 3, reps: '10', restTime: '90 sec' },
            { name: 'Face Pulls', sets: 3, reps: '12', restTime: '60 sec' },
          ],
        },
        {
          dayOfWeek: 6, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Bicep Curls', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Tricep Extensions', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Calf Raises', sets: 3, reps: '15', restTime: '45 sec' },
            { name: 'Core Work', sets: 3, reps: '30 sec', restTime: '45 sec' },
          ],
        },
      ];

    case 'bodybuilding':
      return [
        { dayOfWeek: 0, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 1, muscleGroup: 'Chest', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Flat Bench Press', sets: 5, reps: '8-12', restTime: '90 sec' },
            { name: 'Incline Bench Press', sets: 4, reps: '10-12', restTime: '90 sec' },
            { name: 'Decline Bench Press', sets: 3, reps: '10-12', restTime: '60 sec' },
            { name: 'Cable Crossovers', sets: 3, reps: '12-15', restTime: '60 sec' },
            { name: 'Push-ups', sets: 3, reps: '15', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 2, muscleGroup: 'Back', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '6-8', restTime: '120 sec' },
            { name: 'Barbell Rows', sets: 4, reps: '8-12', restTime: '90 sec' },
            { name: 'Lat Pulldowns', sets: 4, reps: '10-12', restTime: '60 sec' },
            { name: 'Seated Cable Rows', sets: 3, reps: '12-15', restTime: '60 sec' },
            { name: 'Face Pulls', sets: 3, reps: '15', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 3, muscleGroup: 'Shoulders', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Military Press', sets: 4, reps: '8-12', restTime: '90 sec' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restTime: '60 sec' },
            { name: 'Front Raises', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Rear Delt Flyes', sets: 3, reps: '15', restTime: '45 sec' },
            { name: 'Upright Rows', sets: 3, reps: '12', restTime: '60 sec' },
          ],
        },
        {
          dayOfWeek: 4, muscleGroup: 'Arms', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Barbell Curls', sets: 4, reps: '10-12', restTime: '60 sec' },
            { name: 'Incline Dumbbell Curls', sets: 3, reps: '12', restTime: '60 sec' },
            { name: 'Hammer Curls', sets: 3, reps: '12', restTime: '45 sec' },
            { name: 'Close Grip Bench', sets: 4, reps: '10-12', restTime: '90 sec' },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', restTime: '60 sec' },
          ],
        },
        {
          dayOfWeek: 5, muscleGroup: 'Legs', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Squats', sets: 5, reps: '8-12', restTime: '120 sec' },
            { name: 'Leg Press', sets: 4, reps: '10-15', restTime: '90 sec' },
            { name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: '60 sec' },
            { name: 'Leg Curls', sets: 3, reps: '12-15', restTime: '60 sec' },
            { name: 'Calf Raises', sets: 4, reps: '15-20', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 6, muscleGroup: 'Core', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Plank Variations', sets: 3, reps: '60 sec', restTime: '45 sec' },
            { name: 'Crunches', sets: 3, reps: '20', restTime: '30 sec' },
            { name: 'Leg Raises', sets: 3, reps: '15', restTime: '30 sec' },
            { name: '20 Min Steady State Cardio', sets: 1, reps: '20 min', restTime: '0 sec' },
          ],
        },
      ];

    default:
      // beginner_fitness and any other goal
      return [
        { dayOfWeek: 0, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 1, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Squats', sets: 3, reps: '10', restTime: '90 sec' },
            { name: 'Push-ups', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10 each', restTime: '60 sec' },
            { name: 'Planks', sets: 3, reps: '30 sec', restTime: '45 sec' },
          ],
        },
        { dayOfWeek: 2, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 3, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Deadlifts', sets: 3, reps: '8', restTime: '90 sec' },
            { name: 'Overhead Press', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Lat Pulldowns', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Lunges', sets: 3, reps: '10 each', restTime: '60 sec' },
          ],
        },
        { dayOfWeek: 4, muscleGroup: null, exercises: null, fitnessGoal, isRestDay: true },
        {
          dayOfWeek: 5, muscleGroup: 'Full Body', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Squats', sets: 3, reps: '10', restTime: '90 sec' },
            { name: 'Push-ups', sets: 3, reps: '10', restTime: '60 sec' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10 each', restTime: '60 sec' },
            { name: 'Planks', sets: 3, reps: '30 sec', restTime: '45 sec' },
          ],
        },
        {
          dayOfWeek: 6, muscleGroup: 'Cardio', fitnessGoal, isRestDay: false,
          exercises: [
            { name: 'Walking', sets: 1, reps: '30 min', restTime: '0 sec' },
            { name: 'Stretching', sets: 1, reps: '10 min', restTime: '0 sec' },
          ],
        },
      ];
  }
}

router.get('/plan', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const plan = await db.select().from(workoutPlans).where(eq(workoutPlans.userId, userId));
    return res.json({ plan });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/plan/generate', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const fitnessGoal = req.user!.fitnessGoal || 'beginner_fitness';

    await db.delete(workoutPlans).where(eq(workoutPlans.userId, userId));

    const planDays = getWorkoutPlan(fitnessGoal);
    await db.insert(workoutPlans).values(
      planDays.map(day => ({ ...day, userId }))
    );

    const newPlan = await db.select().from(workoutPlans).where(eq(workoutPlans.userId, userId));
    return res.json({ plan: newPlan });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const date = req.query.date as string | undefined;
    const userId = req.user!.id;
    const logs = date
      ? await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.workoutDate, date)))
      : await db.select().from(workoutLogs).where(eq(workoutLogs.userId, userId));
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logs', async (req: AuthRequest, res) => {
  try {
    const parsed = workoutLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const userId = req.user!.id;
    const [log] = await db.insert(workoutLogs).values({ ...parsed.data, userId }).returning();
    return res.status(201).json({ log });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const logs = await db.select().from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.workoutDate));
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
