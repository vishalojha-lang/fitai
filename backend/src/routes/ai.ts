import { Router } from 'express';
import { db } from '../db';
import { chatMessages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatSchema = z.object({
  message: z.string().min(1),
});

router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { message } = parsed.data;
    const userId = req.user!.id;
    const user = req.user!;

    await db.insert(chatMessages).values({ userId, role: 'user', content: message });

    const history = await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);
    history.reverse();

    const systemPrompt = `You are FitAI, a personal fitness and nutrition AI assistant. 
User profile:
- Name: ${user.name || 'Unknown'}
- Fitness Goal: ${user.fitnessGoal || 'Not set'}
- Daily Calories Target: ${user.dailyCalories || 'Not set'}
- Daily Protein: ${user.dailyProtein || 'Not set'}g
- Daily Carbs: ${user.dailyCarbs || 'Not set'}g
- Daily Fat: ${user.dailyFat || 'Not set'}g
- Weight: ${user.weightKg || 'Not set'} kg
- Height: ${user.heightCm || 'Not set'} cm
- Activity Level: ${user.activityLevel || 'Not set'}
- Diet Preference: ${user.dietPreference || 'Not set'}
Provide personalized, accurate fitness and nutrition advice based on the user's profile.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    const assistantContent = completion.choices[0]?.message?.content || '';

    await db.insert(chatMessages).values({ userId, role: 'assistant', content: assistantContent });

    return res.json({ message: assistantContent });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chat/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
