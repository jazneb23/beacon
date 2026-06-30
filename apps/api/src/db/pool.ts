import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

/** Remove sslmode from the URL so explicit PoolConfig.ssl is not overridden by pg. */
function stripSslmodeFromConnectionString(connectionString: string): string {
  const url = new URL(connectionString);
  if (!url.searchParams.has("sslmode")) {
    return connectionString;
  }
  url.searchParams.delete("sslmode");
  return url.toString();
}

/** Return pool options; relax SSL verification for Supabase hosted databases. */
export function buildPoolConfig(connectionString: string): PoolConfig {
  const sanitizedConnectionString = stripSslmodeFromConnectionString(connectionString);
  const config: PoolConfig = { connectionString: sanitizedConnectionString };
  if (connectionString.includes("supabase.com")) {
    config.ssl = { rejectUnauthorized: false };
  }
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
