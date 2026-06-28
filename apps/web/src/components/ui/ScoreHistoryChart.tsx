import type { ReactElement } from "react";

import { buildSparklinePath } from "./accountCardUtils";
import { getHealthScoreBand, getHealthScoreColor } from "./healthScoreBand";
import styles from "./ScoreHistoryChart.module.css";

type ScoreHistoryChartProps = {
  scores: number[];
  width?: number;
  height?: number;
};

const GRID_LINES = [0, 50, 100];

/** Render a larger score trend chart for the account detail page. */
export function ScoreHistoryChart({
  scores,
  width = 640,
  height = 180,
}: ScoreHistoryChartProps): ReactElement {
  const latestScore = scores[scores.length - 1] ?? 0;
  const stroke = getHealthScoreColor(getHealthScoreBand(latestScore));
  const path = buildSparklinePath(scores, width, height, 8);
  const areaPath = `${path} L ${width - 8} ${height - 8} L 8 ${height - 8} Z`;

  return (
    <figure className={styles.figure}>
      <svg
        aria-labelledby="score-history-title"
        data-testid="score-history-chart"
        className={styles.chart}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <title id="score-history-title">Health score history</title>
        {GRID_LINES.map((line) => {
          const y = 8 + (height - 16) - (line / 100) * (height - 16);
          return (
            <line
              key={line}
              x1={8}
              x2={width - 8}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
          );
        })}
        <path d={areaPath} className={styles.area} style={{ fill: stroke }} />
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </figure>
  );
}
