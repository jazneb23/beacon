import { Pool } from "pg";

let pool: Pool | null = null;

/** Return a singleton Postgres pool using DATABASE_URL. */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

/** Replace the pool singleton (used in tests). */
export function setPool(nextPool: Pool): void {
  pool = nextPool;
}

/** Close and clear the pool singleton. */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
