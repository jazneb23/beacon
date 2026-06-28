import { Router } from "express";
import type { Pool } from "pg";
import { listLatestHealthScores } from "../db/scores.js";
import { asyncHandler, sendData } from "../http.js";

/** Latest health score listing route. */
export function createScoresRouter(pool: Pool): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const scores = await listLatestHealthScores(pool);
      sendData(res, scores);
    }),
  );

  return router;
}
