import type { Account, HealthScore, ScoreDriver } from "@beacon/shared";
import type { AccountWithScore } from "./api.js";
import { getTopNegativeDrivers } from "./drivers.js";

/** At-risk account summary for MCP tool responses. */
export type AtRiskAccount = {
  id: string;
  name: string;
  plan: Account["plan"];
  score: number;
  trend: HealthScore["trend"];
  topNegativeDrivers: ScoreDriver[];
};

/** Filter accounts below a score threshold and attach negative driver context. */
export function listAtRiskAccounts(
  accounts: AccountWithScore[],
  threshold: number,
): AtRiskAccount[] {
  return accounts
    .filter(
      (account): account is AccountWithScore & { latestScore: HealthScore } =>
        account.latestScore !== null && account.latestScore.score < threshold,
    )
    .map((account) => ({
      id: account.id,
      name: account.name,
      plan: account.plan,
      score: account.latestScore.score,
      trend: account.latestScore.trend,
      topNegativeDrivers: getTopNegativeDrivers(account.latestScore.drivers),
    }))
    .sort((a, b) => a.score - b.score);
}
