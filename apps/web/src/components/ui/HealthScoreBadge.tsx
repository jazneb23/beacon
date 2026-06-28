import type { HealthScore } from "@beacon/shared";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import {
  clampScore,
  getHealthScoreBand,
  getHealthScoreColor,
} from "./healthScoreBand";

export type HealthScoreBadgeSize = "sm" | "md" | "lg";

export type HealthScoreBadgeProps = {
  score: number;
  trend: HealthScore["trend"];
  size?: HealthScoreBadgeSize;
  className?: string;
};

type SizeStyles = {
  gap: string;
  iconSize: number;
  score: CSSProperties;
};

const SIZE_STYLES: Record<HealthScoreBadgeSize, SizeStyles> = {
  sm: {
    gap: "var(--space-1)",
    iconSize: 14,
    score: {
      fontSize: "var(--text-base)",
      fontWeight: "var(--font-bold)",
      lineHeight: "var(--leading-base)",
    },
  },
  md: {
    gap: "var(--space-2)",
    iconSize: 20,
    score: {
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-bold)",
      lineHeight: "var(--leading-2xl)",
    },
  },
  lg: {
    gap: "var(--space-3)",
    iconSize: 28,
    score: {
      fontSize: "var(--text-score-display-size)",
      fontWeight: "var(--text-score-display-weight)",
      lineHeight: "var(--text-score-display-line-height)",
    },
  },
};

const TREND_LABELS: Record<HealthScore["trend"], string> = {
  up: "trending up",
  down: "trending down",
  flat: "unchanged",
};

/** Render a health score with band color and trend indicator. */
export function HealthScoreBadge({
  score,
  trend,
  size = "md",
  className,
}: HealthScoreBadgeProps): ReactElement {
  const displayScore = clampScore(score);
  const band = getHealthScoreBand(displayScore);
  const color = getHealthScoreColor(band);
  const { gap, iconSize, score: scoreStyle } = SIZE_STYLES[size];
  const TrendIcon = getTrendIcon(trend);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        color,
      }}
      aria-label={`Health score ${displayScore}, ${TREND_LABELS[trend]}`}
    >
      <span style={scoreStyle}>{displayScore}</span>
      <TrendIcon
        aria-hidden
        size={iconSize}
        strokeWidth={size === "lg" ? 2.5 : 2}
      />
    </span>
  );
}

/** Pick the lucide icon for a score trend direction. */
function getTrendIcon(trend: HealthScore["trend"]) {
  switch (trend) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    case "flat":
      return Minus;
  }
}
