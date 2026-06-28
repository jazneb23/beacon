import type { ReactElement } from "react";

import {
  buildSparklinePath,
  takeSparklinePoints,
} from "./accountCardUtils";
import { getHealthScoreBand, getHealthScoreColor } from "./healthScoreBand";

type ScoreSparklineProps = {
  scores: number[];
  width?: number;
  height?: number;
};

/** Render a tiny score trend sparkline. */
export function ScoreSparkline({
  scores,
  width = 88,
  height = 28,
}: ScoreSparklineProps): ReactElement {
  const points = takeSparklinePoints(scores);
  const latestScore = points[points.length - 1] ?? 0;
  const stroke = getHealthScoreColor(getHealthScoreBand(latestScore));
  const path = buildSparklinePath(points, width, height);

  return (
    <svg
      aria-hidden
      data-testid="score-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
