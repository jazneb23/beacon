import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

/** Mask credentials in a Postgres connection string for safe logging. */
function maskConnectionString(connectionString: string): string {
  return connectionString.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

/** Return pool options; relax SSL verification for Supabase hosted databases. */
export function buildPoolConfig(connectionString: string): PoolConfig {
  const config: PoolConfig = { connectionString };
  console.log("[buildPoolConfig] connectionString:", maskConnectionString(connectionString));
  console.log(
    "[buildPoolConfig] connectionString.includes('supabase.com'):",
    connectionString.includes("supabase.com"),
  );
  if (connectionString.includes("supabase.com")) {
    config.ssl = { rejectUnauthorized: false };
  }
  console.log("[buildPoolConfig] final config.ssl:", config.ssl);
  return config;
}

/** Return a singleton Postgres pool using DATABASE_URL. */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    pool = new Pool(buildPoolConfig(connectionString));
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
