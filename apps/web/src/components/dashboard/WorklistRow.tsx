"use client";

import Link from "next/link";
import { type CSSProperties, type ReactElement } from "react";

import type { WorklistItem } from "../../lib/worklist";
import { getHealthScoreColor } from "../ui/healthScoreBand";
import { HealthScoreBadge } from "../ui/HealthScoreBadge";
import styles from "./WorklistRow.module.css";

const PLAN_LABEL: Record<WorklistItem["row"]["account"]["plan"], string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

type WorklistRowProps = {
  item: WorklistItem;
  index?: number;
};

/** A single prioritized account in the focus worklist. */
export function WorklistRow({ item, index = 0 }: WorklistRowProps): ReactElement {
  const { row, band, reason, action } = item;
  const { account, score } = row;
  const accentColor = getHealthScoreColor(band);

  const rowStyle: CSSProperties = {
    borderLeftColor: accentColor,
    animationDelay: `${index * 50}ms`,
  };

  return (
    <Link
      href={`/accounts/${account.id}`}
      className={styles.row}
      style={rowStyle}
      aria-label={`Review ${account.name}`}
    >
      <div className={styles.main}>
        <div className={styles.topline}>
          <h2 className={styles.name}>{account.name}</h2>
          <span className={styles.plan}>{PLAN_LABEL[account.plan]}</span>
        </div>
        <span className={styles.reason} style={{ color: accentColor }}>
          {reason}
        </span>
      </div>

      <div className={styles.right}>
        <HealthScoreBadge score={score.score} trend={score.trend} size="md" />
        <span className={styles.action} data-tone={action.tone}>
          {action.label}
          <span aria-hidden> →</span>
        </span>
      </div>
    </Link>
  );
}
