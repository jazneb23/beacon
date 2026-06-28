import type { HealthScore } from "@beacon/shared";

/** Sort score snapshots oldest-to-newest for chart rendering. */
export function chronologicalScores(history: HealthScore[]): number[] {
  return [...history]
    .sort(
      (left, right) =>
        new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime(),
    )
    .map((entry) => entry.score);
}
