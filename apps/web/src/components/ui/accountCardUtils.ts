import type { ScoreDriver } from "@beacon/shared";

const SPARKLINE_POINT_COUNT = 6;

/** Return the last six scores, padding earlier slots when history is short. */
export function takeSparklinePoints(
  scores: number[],
  pointCount = SPARKLINE_POINT_COUNT,
): number[] {
  if (scores.length === 0) {
    return Array<number>(pointCount).fill(0);
  }

  const recent = scores.slice(-pointCount);
  while (recent.length < pointCount) {
    recent.unshift(recent[0] ?? scores[0]);
  }

  return recent;
}

/** Pick the highest-weight negative driver for the card caption. */
export function getTopNegativeDriver(
  drivers: ScoreDriver[],
): ScoreDriver | null {
  const negative = drivers.filter((driver) => driver.direction === "negative");
  if (negative.length === 0) {
    return null;
  }

  return negative.reduce((top, driver) =>
    driver.weight > top.weight ? driver : top,
  );
}

/** Build an SVG path for a normalized 0–100 sparkline. */
export function buildSparklinePath(
  points: number[],
  width: number,
  height: number,
  padding = 2,
): string {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const step =
    points.length <= 1 ? 0 : innerWidth / (points.length - 1);

  return points
    .map((score, index) => {
      const clamped = Math.min(100, Math.max(0, score));
      const x = padding + index * step;
      const y = padding + innerHeight - (clamped / 100) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export { SPARKLINE_POINT_COUNT };
