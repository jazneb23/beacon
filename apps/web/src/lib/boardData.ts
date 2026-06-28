import type { Account, HealthScore } from "@beacon/shared";

import type { AccountWithLatestScore } from "./api";
import { SPARKLINE_POINT_COUNT } from "../components/ui/accountCardUtils";

export type BoardRow = {
  account: Account;
  score: HealthScore;
  scoreHistory: number[];
};

/** Append new score readings while keeping a fixed sparkline window. */
export function appendScoreHistory(
  history: Record<string, number[]>,
  scores: HealthScore[],
  pointCount = SPARKLINE_POINT_COUNT,
): Record<string, number[]> {
  const next: Record<string, number[]> = { ...history };

  for (const score of scores) {
    const existing = next[score.accountId] ?? [];
    const last = existing[existing.length - 1];

    if (last === score.score && existing.length > 0) {
      continue;
    }

    next[score.accountId] = [...existing, score.score].slice(-pointCount);
  }

  return next;
}

/** Join account metadata with live scores and accumulated history. */
export function buildBoardRows(
  accounts: AccountWithLatestScore[],
  scores: HealthScore[],
  history: Record<string, number[]>,
): BoardRow[] {
  const scoresByAccount = new Map(
    scores.map((score) => [score.accountId, score]),
  );

  return accounts.flatMap((account) => {
    const score = scoresByAccount.get(account.id) ?? account.latestScore;
    if (!score) {
      return [];
    }

    const scoreHistory = history[account.id] ?? [score.score];

    return [
      {
        account: {
          id: account.id,
          name: account.name,
          plan: account.plan,
        },
        score,
        scoreHistory,
      },
    ];
  });
}
