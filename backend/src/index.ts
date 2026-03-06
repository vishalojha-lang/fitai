import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
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

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { error: 'AI rate limit exceeded, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', apiLimiter, authenticate, profileRoutes);
app.use('/api/food', apiLimiter, authenticate, foodRoutes);
app.use('/api/workouts', apiLimiter, authenticate, workoutRoutes);
app.use('/api/progress', apiLimiter, authenticate, progressRoutes);
app.use('/api/habits', apiLimiter, authenticate, habitRoutes);
app.use('/api/ai', aiLimiter, authenticate, aiRoutes);
app.use('/api/dashboard', apiLimiter, authenticate, dashboardRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
