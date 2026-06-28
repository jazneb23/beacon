import "dotenv/config";
import { getPool } from "../src/db/pool.js";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise'))
);

CREATE TABLE IF NOT EXISTS signal_events (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('usage', 'support', 'billing', 'login')),
  value NUMERIC NOT NULL,
  at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS health_scores (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'flat')),
  drivers JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_signal_events_account_id
  ON signal_events (account_id);

CREATE INDEX IF NOT EXISTS idx_health_scores_account_updated
  ON health_scores (account_id, updated_at DESC);
`;

/** Apply database schema migrations. */
async function migrate(): Promise<void> {
  const pool = getPool();
  await pool.query(MIGRATION_SQL);
  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
