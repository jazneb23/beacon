/** Runtime configuration loaded from environment variables. */
export type IngestConfig = {
  apiUrl: string;
  seed: number;
  intervalMs: number;
};

/** Parse and validate ingest worker configuration. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): IngestConfig {
  const apiUrl = env.API_URL ?? "http://localhost:3001";
  const seed = Number(env.SEED ?? "42");
  const intervalMs = Number(env.INTERVAL_MS ?? "3000");

  if (Number.isNaN(seed)) {
    throw new Error("SEED must be a number");
  }
  if (Number.isNaN(intervalMs) || intervalMs <= 0) {
    throw new Error("INTERVAL_MS must be a positive number");
  }

  return { apiUrl, seed, intervalMs };
}
