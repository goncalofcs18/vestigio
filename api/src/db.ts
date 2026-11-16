import pg from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgres://vestigio:vestigio@localhost:5432/vestigio';

export const pool = new pg.Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
