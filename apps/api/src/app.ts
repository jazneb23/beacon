import express, { type NextFunction, type Request, type Response } from "express";
import type { Pool } from "pg";
import { corsMiddleware } from "./cors.js";
import { sendError } from "./http.js";
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

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (res.headersSent) {
      next(err);
      return;
    }
    sendError(res, "Internal server error", 500);
  });

  return app;
}
