# FitAI Database

This directory contains the PostgreSQL database schema and migrations for FitAI.

## Files

- `schema.sql` – Full PostgreSQL schema with all tables and indexes
- `migrations/` – Drizzle ORM generated migration files (run from backend)

## Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE fitai;
```

2. Apply the schema:
```bash
psql -U postgres -d fitai -f schema.sql
```

Or using Drizzle migrations from the backend:
```bash
cd ../backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles with fitness metrics |
| `food_database` | Seeded nutrition database (60+ foods) |
| `food_logs` | User daily food tracking entries |
| `workout_plans` | AI-generated weekly workout plans |
| `workout_logs` | User exercise session logs |
| `progress_entries` | Body measurements over time |
| `habit_logs` | Daily habit tracking (water, sleep, steps) |
| `chat_messages` | AI coach conversation history |
