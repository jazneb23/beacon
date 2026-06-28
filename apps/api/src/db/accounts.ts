import type { Account, HealthScore, ScoreDriver } from "@beacon/shared";
import type { Pool } from "pg";

type AccountRow = {
  id: string;
  name: string;
  plan: Account["plan"];
};

type HealthScoreRow = {
  account_id: string;
  score: number;
  trend: HealthScore["trend"];
  drivers: ScoreDriver[];
  updated_at: Date;
};

/** Map a database row to the shared Account type. */
function toAccount(row: AccountRow): Account {
  return { id: row.id, name: row.name, plan: row.plan };
}

/** Map a database row to the shared HealthScore type. */
function toHealthScore(row: HealthScoreRow): HealthScore {
  return {
    accountId: row.account_id,
    score: row.score,
    trend: row.trend,
    drivers: row.drivers,
    updatedAt: row.updated_at.toISOString(),
  };
}

/** List every account with its most recent health score. */
export async function listAccountsWithLatestScore(
  pool: Pool,
): Promise<Array<Account & { latestScore: HealthScore | null }>> {
  const result = await pool.query<AccountRow & HealthScoreRow>(
    `SELECT a.id, a.name, a.plan,
            hs.account_id, hs.score, hs.trend, hs.drivers, hs.updated_at
     FROM accounts a
     LEFT JOIN LATERAL (
       SELECT account_id, score, trend, drivers, updated_at
       FROM health_scores
       WHERE account_id = a.id
       ORDER BY updated_at DESC
       LIMIT 1
     ) hs ON true
     ORDER BY a.name`,
  );

  return result.rows.map((row) => ({
    ...toAccount(row),
    latestScore: row.account_id ? toHealthScore(row) : null,
  }));
}

/** Fetch one account with score history and latest drivers. */
export async function getAccountWithHistory(
  pool: Pool,
  accountId: string,
): Promise<{
  account: Account;
  scoreHistory: HealthScore[];
  drivers: ScoreDriver[];
} | null> {
  const accountResult = await pool.query<AccountRow>(
    "SELECT id, name, plan FROM accounts WHERE id = $1",
    [accountId],
  );
  const accountRow = accountResult.rows[0];
  if (!accountRow) {
    return null;
  }

  const scoresResult = await pool.query<HealthScoreRow>(
    `SELECT account_id, score, trend, drivers, updated_at
     FROM health_scores
     WHERE account_id = $1
     ORDER BY updated_at DESC`,
    [accountId],
  );

  const scoreHistory = scoresResult.rows.map(toHealthScore);
  const latest = scoreHistory[0];

  return {
    account: toAccount(accountRow),
    scoreHistory,
    drivers: latest?.drivers ?? [],
  };
}

/** Return true when an account exists. */
export async function accountExists(pool: Pool, accountId: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1) AS exists",
    [accountId],
  );
  return result.rows[0]?.exists ?? false;
}

export { toHealthScore };
