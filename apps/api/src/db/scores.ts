import type { HealthScore } from "@beacon/shared";
import type { Pool } from "pg";
import { toHealthScore } from "./accounts.js";

type HealthScoreRow = {
  account_id: string;
  score: number;
  trend: HealthScore["trend"];
  drivers: HealthScore["drivers"];
  updated_at: Date;
};

/** Persist a computed health score snapshot. */
export async function insertHealthScore(
  pool: Pool,
  score: HealthScore,
): Promise<HealthScore> {
  const result = await pool.query<HealthScoreRow>(
    `INSERT INTO health_scores (account_id, score, trend, drivers, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING account_id, score, trend, drivers, updated_at`,
    [
      score.accountId,
      score.score,
      score.trend,
      JSON.stringify(score.drivers),
      score.updatedAt,
    ],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to insert health score");
  }
  return toHealthScore(row);
}

/** Return the latest health score for every account. */
export async function listLatestHealthScores(pool: Pool): Promise<HealthScore[]> {
  const result = await pool.query<HealthScoreRow>(
    `SELECT DISTINCT ON (account_id)
       account_id, score, trend, drivers, updated_at
     FROM health_scores
     ORDER BY account_id, updated_at DESC`,
  );
  return result.rows.map(toHealthScore);
}
