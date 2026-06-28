/** Health score color band thresholds from the design system. */
export type HealthScoreBand = "green" | "amber" | "red";

/** Map a 0–100 score to its green / amber / red band. */
export function getHealthScoreBand(score: number): HealthScoreBand {
  const clamped = clampScore(score);
  if (clamped >= 70) {
    return "green";
  }
  if (clamped >= 40) {
    return "amber";
  }
  return "red";
}

/** CSS custom property for a health score band color. */
export function getHealthScoreColor(band: HealthScoreBand): string {
  switch (band) {
    case "green":
      return "var(--color-health-green)";
    case "amber":
      return "var(--color-health-amber)";
    case "red":
      return "var(--color-health-red)";
  }
}

/** Clamp and round a score for display. */
export function clampScore(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}
