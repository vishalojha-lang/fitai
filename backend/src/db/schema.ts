import { pgTable, uuid, text, integer, real, timestamp, boolean, jsonb, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  age: integer('age'),
  gender: text('gender'),
  heightCm: real('height_cm'),
  weightKg: real('weight_kg'),
  fitnessGoal: text('fitness_goal'),
  activityLevel: text('activity_level'),
  dietPreference: text('diet_preference'),
  bmr: real('bmr'),
  dailyCalories: real('daily_calories'),
  dailyProtein: real('daily_protein'),
  dailyCarbs: real('daily_carbs'),
  dailyFat: real('daily_fat'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const foodLogs = pgTable('food_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodName: text('food_name').notNull(),
  calories: real('calories').notNull(),
  protein: real('protein').default(0),
  carbs: real('carbs').default(0),
  fat: real('fat').default(0),
  portionSize: text('portion_size'),
  mealType: text('meal_type').notNull(),
  logDate: date('log_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const foodDatabase = pgTable('food_database', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  calories: real('calories').notNull(),
  protein: real('protein').default(0),
  carbs: real('carbs').default(0),
  fat: real('fat').default(0),
  servingSize: text('serving_size'),
  category: text('category'),
});

export const workoutPlans = pgTable('workout_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  muscleGroup: text('muscle_group'),
  exercises: jsonb('exercises').$type<Array<{ name: string; sets: number; reps: string; restTime: string }>>(),
  fitnessGoal: text('fitness_goal'),
  isRestDay: boolean('is_rest_day').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseName: text('exercise_name').notNull(),
  sets: jsonb('sets').$type<Array<{ setNumber: number; weight: number; reps: number }>>(),
  workoutDate: date('workout_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const progressEntries = pgTable('progress_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bodyWeight: real('body_weight'),
  chest: real('chest'),
  waist: real('waist'),
  arms: real('arms'),
  thighs: real('thighs'),
  logDate: date('log_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  waterIntakeMl: integer('water_intake_ml').default(0),
  sleepHours: real('sleep_hours'),
  stepCount: integer('step_count'),
  gymAttended: boolean('gym_attended').default(false),
  logDate: date('log_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
