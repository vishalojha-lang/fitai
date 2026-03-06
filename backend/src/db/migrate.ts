import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as dotenv from 'dotenv';
dotenv.config();

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

migrate(db, { migrationsFolder: './drizzle' })
  .then(() => { console.log('Migrations complete'); process.exit(0); })
  .catch((err) => { console.error('Migration failed', err); process.exit(1); });
