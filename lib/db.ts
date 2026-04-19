import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Add it to .env.local (see .env.local.example).');
}

// DATABASE_URL should be a standard Postgres connection string, e.g.:
//   postgres://user:password@host:5432/database
//
// For Supabase hosted Postgres use the "direct connection" URL from
// Project Settings → Database → Connection string (URI format), which
// does NOT go through PostgREST — it is plain TCP Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep a small pool; admin login is low-traffic.
  max: 5,
  idleTimeoutMillis: 30_000,
});

export default pool;
