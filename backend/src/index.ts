import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import foodRoutes from './routes/food';
import workoutRoutes from './routes/workouts';
import progressRoutes from './routes/progress';
import habitRoutes from './routes/habits';
import aiRoutes from './routes/ai';
import dashboardRoutes from './routes/dashboard';
import { authenticate } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', authenticate, profileRoutes);
app.use('/api/food', authenticate, foodRoutes);
app.use('/api/workouts', authenticate, workoutRoutes);
app.use('/api/progress', authenticate, progressRoutes);
app.use('/api/habits', authenticate, habitRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
