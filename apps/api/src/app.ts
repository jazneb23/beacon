import express from "express";
import type { Pool } from "pg";
import { corsMiddleware } from "./cors.js";
import { createAccountsRouter } from "./routes/accounts.js";
import { healthRouter } from "./routes/health.js";
import { createScoresRouter } from "./routes/scores.js";
import { createSignalsRouter } from "./routes/signals.js";

/** Build the Express application with injected database access. */
export function createApp(pool: Pool) {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(healthRouter);
  app.use("/accounts", createAccountsRouter(pool));
  app.use("/signals", createSignalsRouter(pool));
  app.use("/scores", createScoresRouter(pool));

  return app;
}
