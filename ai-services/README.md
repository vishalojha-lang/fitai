# AI Services

This directory contains AI integration utilities for FitAI.

The AI fitness coach is implemented in the backend at `backend/src/routes/ai.ts` using OpenAI's GPT model.

## Features

- **AI Fitness Coach**: Powered by OpenAI GPT-4o-mini
  - Personalized responses based on user profile (age, weight, fitness goal, diet preference)
  - Context-aware workout and nutrition recommendations
  - Chat history stored per user in the database

## System Prompt

The AI coach uses the user's profile data to generate personalized responses:
- Name, age, gender
- Current weight and height
- Fitness goal (fat loss, muscle gain, strength training, bodybuilding, beginner fitness)
- Activity level and diet preference
- Daily calorie and macro targets

## Configuration

Set the `OPENAI_API_KEY` environment variable in `backend/.env`.

## Usage

The AI coach endpoint is at `POST /api/ai/chat`. Send a message and receive a personalized response from the AI fitness coach.

```json
{
  "message": "What workout should I do today?"
}
```

Response:
```json
{
  "reply": "Based on your muscle gain goal and today being Monday...",
  "chatHistory": [...]
}
```
