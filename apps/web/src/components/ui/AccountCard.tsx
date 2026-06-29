"use client";

import type { Account, HealthScore } from "@beacon/shared";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";

import { formatRelativeTime } from "./signalRowUtils";
import styles from "./AccountCard.module.css";
import { getTopDriver } from "./accountCardUtils";
import { getHealthScoreBand, getHealthScoreColor } from "./healthScoreBand";
import { HealthScoreBadge, type HealthScoreBadgeSize } from "./HealthScoreBadge";
import { ScoreSparkline } from "./ScoreSparkline";

export type AccountCardProps = {
  account: Account;
  score: HealthScore;
  scoreHistory?: number[];
  scoreSize?: HealthScoreBadgeSize;
  signalsThisWeek?: number;
  index?: number;
  refreshTick?: number;
  animateCount?: boolean;
};

const PLAN_BADGE_CLASS: Record<Account["plan"], string> = {
  free: styles.planFree,
  pro: styles.planPro,
  enterprise: styles.planEnterprise,
};

const FLASH_MS = 700;

/** Compact, information-dense card for the health board grid. */
export function AccountCard({
  account,
  score,
  scoreHistory,
  scoreSize = "lg",
  signalsThisWeek,
  index = 0,
  refreshTick,
  animateCount = false,
}: AccountCardProps): ReactElement {
  const history = scoreHistory ?? Array<number>(6).fill(score.score);
  const topDriver = getTopDriver(score.drivers);
  const band = getHealthScoreBand(score.score);
  const accentColor = getHealthScoreColor(band);

  const previousScore = useRef(score.score);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (score.score !== previousScore.current) {
      setFlash(score.score > previousScore.current ? "up" : "down");
      previousScore.current = score.score;
      const id = window.setTimeout(() => setFlash(null), FLASH_MS);
      return () => window.clearTimeout(id);
    }
  }, [score.score]);

  const lastSignal = formatRelativeTime(
    score.updatedAt,
    refreshTick !== undefined ? new Date() : undefined,
  );

  const cardStyle: CSSProperties = {
    borderLeftColor: accentColor,
    animationDelay: `${index * 50}ms`,
  };

  const flashStyle: CSSProperties | undefined =
    flash === null
      ? undefined
      : { color: flash === "up" ? "var(--color-health-green)" : "var(--color-health-red)" };

  return (
    <Link
      href={`/accounts/${account.id}`}
      className={styles.card}
      style={cardStyle}
      aria-label={`View ${account.name} account details`}
    >
      <div className={styles.header}>
        <h2 className={styles.accountName}>{account.name}</h2>
        <span className={`${styles.planBadge} ${PLAN_BADGE_CLASS[account.plan]}`}>
          {account.plan}
        </span>
        <span className={styles.lastSignal}>last signal {lastSignal}</span>
      </div>

      <div className={styles.scoreRow}>
        <span className={flash ? styles.scoreFlash : undefined} style={flashStyle}>
          <HealthScoreBadge
            score={score.score}
            trend={score.trend}
            size={scoreSize}
            animateCount={animateCount}
          />
        </span>
        <ScoreSparkline scores={history} />
      </div>

      <div className={styles.footer}>
        {topDriver ? (
          <span
            className={styles.driver}
            style={{
              color:
                topDriver.direction === "negative"
                  ? "var(--color-health-red)"
                  : "var(--color-health-green)",
            }}
          >
            {topDriver.label}
          </span>
        ) : (
          <span className={styles.driver}>No active drivers</span>
        )}
        {signalsThisWeek !== undefined ? (
          <span className={styles.signalCount}>
            {signalsThisWeek} signal{signalsThisWeek === 1 ? "" : "s"} this week
          </span>
        ) : null}
      </div>
    </Link>
  );
}
