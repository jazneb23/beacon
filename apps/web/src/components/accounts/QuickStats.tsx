import type { HealthScore } from "@beacon/shared";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactElement } from "react";

import styles from "./QuickStats.module.css";

type QuickStatsProps = {
  signalsThisWeek: number;
  signalsTrend: HealthScore["trend"];
  openTickets: number;
  daysSinceLogin: number;
};

/** Three at-a-glance stat boxes for the account detail right column. */
export function QuickStats({
  signalsThisWeek,
  signalsTrend,
  openTickets,
  daysSinceLogin,
}: QuickStatsProps): ReactElement {
  const TrendIcon =
    signalsTrend === "up" ? TrendingUp : signalsTrend === "down" ? TrendingDown : Minus;

  return (
    <div className={styles.grid}>
      <div className={styles.stat}>
        <span className={styles.label}>Signals this week</span>
        <span className={styles.value}>
          {signalsThisWeek}
          <TrendIcon size={16} aria-hidden className={styles.trendIcon} />
        </span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>Open tickets</span>
        <span
          className={styles.value}
          style={openTickets > 2 ? { color: "var(--color-health-red)" } : undefined}
        >
          {openTickets}
        </span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>Days since login</span>
        <span
          className={styles.value}
          style={daysSinceLogin > 7 ? { color: "var(--color-health-amber)" } : undefined}
        >
          {daysSinceLogin}
        </span>
      </div>
    </div>
  );
}
