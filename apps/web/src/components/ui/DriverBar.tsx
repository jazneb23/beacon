import type { ScoreDriver } from "@beacon/shared";
import type { ReactElement } from "react";

import styles from "./DriverBar.module.css";

export type DriverBarProps = {
  label: string;
  weight: number;
  direction: ScoreDriver["direction"];
  className?: string;
};

/** Clamp driver weight into the 0–1 range used for bar width. */
function clampWeight(weight: number): number {
  return Math.min(1, Math.max(0, weight));
}

/** Render one labeled score driver as a compact horizontal bar. */
export function DriverBar({
  label,
  weight,
  direction,
  className,
}: DriverBarProps): ReactElement {
  const clampedWeight = clampWeight(weight);
  const percent = Math.round(clampedWeight * 100);
  const fillClass =
    direction === "positive" ? styles.fillPositive : styles.fillNegative;

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <span className={styles.label}>{label}</span>
      <div
        className={styles.track}
        role="meter"
        aria-label={`${label}, ${direction} driver, ${percent}% weight`}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${styles.fill} ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
