import type { HealthScore } from "@beacon/shared";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactElement } from "react";

import {
  clampScore,
  getHealthScoreBand,
  getHealthScoreColor,
} from "./healthScoreBand";

export type HealthScoreBadgeSize = "sm" | "md" | "lg" | "xl";

export type HealthScoreBadgeProps = {
  score: number;
  trend: HealthScore["trend"];
  size?: HealthScoreBadgeSize;
  className?: string;
  /** Animate the number counting up from 0 on first render. */
  animateCount?: boolean;
};

const COUNT_UP_MS = 300;

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
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--font-bold)",
      lineHeight: "var(--leading-4xl)",
    },
  },
  xl: {
    gap: "var(--space-3)",
    iconSize: 28,
    score: {
      fontSize: "var(--text-score-display-size)",
      fontWeight: "var(--text-score-display-weight)",
      lineHeight: "var(--text-score-display-line-height)",
    },
  },
};

/**
 * Animate a number up from 0 on first mount, then track the live target.
 *
 * During the initial animation we render an interpolated value; once finished
 * (or when animation is disabled) we render the target directly so live score
 * updates from polling are always reflected.
 */
function useCountUp(target: number, enabled: boolean): number {
  const [animating, setAnimating] = useState(enabled);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      setAnimatedValue(Math.round(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    });
    return () => cancelAnimationFrame(frame);
    // Run the count-up once on mount; live updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return animating ? animatedValue : target;
}

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
  animateCount = false,
}: HealthScoreBadgeProps): ReactElement {
  const displayScore = clampScore(score);
  const animatedScore = useCountUp(displayScore, animateCount);
  const band = getHealthScoreBand(displayScore);
  const color = getHealthScoreColor(band);
  const { gap, iconSize, score: scoreStyle } = SIZE_STYLES[size];
  const strokeWidth = size === "lg" || size === "xl" ? 2.5 : 2;

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
      <span style={scoreStyle}>{animatedScore}</span>
      {renderTrendIcon(trend, iconSize, strokeWidth)}
    </span>
  );
}

/** Render the lucide icon for a score trend direction. */
function renderTrendIcon(
  trend: HealthScore["trend"],
  size: number,
  strokeWidth: number,
): ReactElement {
  switch (trend) {
    case "up":
      return <TrendingUp aria-hidden size={size} strokeWidth={strokeWidth} />;
    case "down":
      return <TrendingDown aria-hidden size={size} strokeWidth={strokeWidth} />;
    case "flat":
      return <Minus aria-hidden size={size} strokeWidth={strokeWidth} />;
  }
}
