import type { ScoreDriver } from "@beacon/shared";

/** Return negative drivers sorted by weight, highest first. */
export function getTopNegativeDrivers(drivers: ScoreDriver[]): ScoreDriver[] {
  return drivers
    .filter((driver) => driver.direction === "negative")
    .sort((a, b) => b.weight - a.weight);
}
