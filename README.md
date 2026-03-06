# FitAI – AI Fitness Companion

A full-stack AI-powered fitness application that helps users manage their fitness journey with workout planning, nutrition tracking, calorie monitoring, workout tracking, progress analytics, and AI fitness coaching.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Authentication | Firebase Authentication (Google login + email/password) + JWT |
| AI Coach | OpenAI GPT-4o-mini integration |
| Charts | Recharts |

## Repository Structure

```
fitai/
├── frontend/          # Next.js + Tailwind CSS frontend
├── backend/           # Node.js + Express.js backend API
├── ai-services/       # AI integration documentation
├── database/          # PostgreSQL schema and migrations
├── docs/              # Documentation
└── README.md          # This file
```

## Phase 1 Features

- **Authentication** – Email/password + Google OAuth via Firebase, JWT fallback
- **User Profile & Onboarding** – Collect age, gender, height, weight, fitness goal, activity level, diet preference; auto-calculate BMR, TDEE, and daily macro targets using Mifflin-St Jeor formula
- **Dashboard** – Daily metrics (calories, protein, water, workout status), quick actions, today's workout preview
- **Food Tracking** – Manual food entry + search from a 60+ item nutrition database, meal breakdown (breakfast/lunch/dinner/snacks), macro pie chart
- **AI Workout Planner** – Generate weekly workout schedules for 5 fitness goals (fat loss, muscle gain, strength training, bodybuilding, beginner fitness)
- **Workout Logger** – Log exercises with sets, reps, weight; view workout history
- **Progress Tracking** – Log body measurements, weight trends chart, workout frequency chart
- **AI Fitness Coach** – Chat interface powered by OpenAI with personalized responses based on user profile
- **Bottom Navigation** – Mobile-first with bottom nav; sidebar on desktop

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Firebase project (for Google OAuth)
- OpenAI API key (for AI coach)

### 1. Clone the Repository

```bash
git clone https://github.com/vishalojha-lang/fitai.git
cd fitai
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run db:generate
npm run db:migrate

# Seed the database with food data
npm run db:seed

# Start the development server
npm run dev
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Start the development server
npm run dev
```

The frontend runs on `http://localhost:3000`.

### 4. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE fitai;"

# Or apply schema directly
psql -U postgres -d fitai -f database/schema.sql
```

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitai
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
OPENAI_API_KEY=sk-...
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/firebase` | Login/register with Firebase token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/onboarding` | Complete onboarding |
| GET | `/api/food/logs` | Get food logs for date |
| POST | `/api/food/logs` | Add food log |
| DELETE | `/api/food/logs/:id` | Delete food log |
| GET | `/api/food/search` | Search food database |
| GET | `/api/food/summary` | Get daily nutrition summary |
| GET | `/api/workouts/plan` | Get workout plan |
| POST | `/api/workouts/plan/generate` | Generate workout plan |
| GET | `/api/workouts/logs` | Get workout logs |
| POST | `/api/workouts/logs` | Log a workout |
| GET | `/api/workouts/history` | Get workout history |
| GET | `/api/progress` | Get progress entries |
| POST | `/api/progress` | Add progress entry |
| GET | `/api/progress/charts` | Get chart data |
| GET | `/api/habits` | Get habit log |
| POST | `/api/habits` | Log habits |
| PUT | `/api/habits/:id` | Update habit log |
| POST | `/api/ai/chat` | Send message to AI coach |
| GET | `/api/ai/chat/history` | Get chat history |
| GET | `/api/dashboard` | Get dashboard summary |

## Future Roadmap

### Phase 2
- Barcode scanning for food logging
- Integration with fitness wearables (Apple Health, Google Fit)
- Custom workout builder
- Social features (friend challenges, leaderboards)
- Meal planning calendar
- Recipe suggestions based on nutrition targets

### Phase 3
- Mobile apps (React Native)
- Advanced AI features (form analysis via camera)
- Supplement tracking
- Sleep tracking integration
- Personalized AI workout adjustments based on progress
- Premium subscription features
