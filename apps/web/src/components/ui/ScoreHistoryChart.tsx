"use client";

import type { ReactElement } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getHealthScoreBand, getHealthScoreColor } from "./healthScoreBand";
import styles from "./ScoreHistoryChart.module.css";

type ScoreHistoryChartProps = {
  scores: number[];
  height?: number;
};

const AT_RISK_THRESHOLD = 40;

/** Interactive score history line chart with axes, tooltip, and risk line. */
export function ScoreHistoryChart({
  scores,
  height = 240,
}: ScoreHistoryChartProps): ReactElement {
  const latestScore = scores[scores.length - 1] ?? 0;
  const stroke = getHealthScoreColor(getHealthScoreBand(latestScore));
  const data = scores.map((score, index) => ({ point: index + 1, score }));

  return (
    <figure className={styles.figure} data-testid="score-history-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="point"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            stroke="var(--color-border)"
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            stroke="var(--color-border)"
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-overlay)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-text-muted)" }}
            labelFormatter={(label) => `Reading ${label}`}
            formatter={(value) => [value as number, "Score"]}
          />
          <ReferenceLine
            y={AT_RISK_THRESHOLD}
            stroke="var(--color-health-red)"
            strokeDasharray="4 4"
            label={{
              value: "At risk",
              position: "insideBottomRight",
              fill: "var(--color-health-red)",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
