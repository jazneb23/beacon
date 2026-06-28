import type { Account, HealthScore } from "@beacon/shared";
import Link from "next/link";
import type { ReactElement } from "react";

import styles from "./AccountCard.module.css";
import { getTopNegativeDriver } from "./accountCardUtils";
import {
  HealthScoreBadge,
  type HealthScoreBadgeSize,
} from "./HealthScoreBadge";
import { ScoreSparkline } from "./ScoreSparkline";

export type AccountCardProps = {
  account: Account;
  score: HealthScore;
  scoreHistory?: number[];
  scoreSize?: HealthScoreBadgeSize;
};

const PLAN_BADGE_CLASS: Record<Account["plan"], string> = {
  free: styles.planFree,
  pro: styles.planPro,
  enterprise: styles.planEnterprise,
};

/** Card for the health board grid linking to account detail. */
export function AccountCard({
  account,
  score,
  scoreHistory,
  scoreSize = "md",
}: AccountCardProps): ReactElement {
  const history = scoreHistory ?? Array<number>(6).fill(score.score);
  const topNegativeDriver = getTopNegativeDriver(score.drivers);

  return (
    <Link
      href={`/accounts/${account.id}`}
      className={styles.card}
      aria-label={`View ${account.name} account details`}
    >
      <div className={styles.header}>
        <h2 className={styles.accountName}>{account.name}</h2>
        <span className={`${styles.planBadge} ${PLAN_BADGE_CLASS[account.plan]}`}>
          {account.plan}
        </span>
      </div>

      <div className={styles.scoreRow}>
        <HealthScoreBadge score={score.score} trend={score.trend} size={scoreSize} />
        <ScoreSparkline scores={history} />
      </div>

      <p
        className={`${styles.caption} ${topNegativeDriver ? styles.captionRisk : ""}`}
      >
        {topNegativeDriver
          ? topNegativeDriver.label
          : "No active negative drivers"}
      </p>
    </Link>
  );
}
