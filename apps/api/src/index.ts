import "dotenv/config";
import { createApp } from "./app.js";
import { closePool, getPool } from "./db/pool.js";

const port = Number(process.env.PORT ?? 3001);
const pool = getPool();
const app = createApp(pool);

const server = app.listen(port, () => {
  console.log(`@beacon/api listening on http://localhost:${port}`);
});

/** Gracefully release database connections on shutdown. */
async function shutdown(): Promise<void> {
  server.close();
  await closePool();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
