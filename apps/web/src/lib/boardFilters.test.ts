import type { HealthScore } from "@beacon/shared";
import { describe, expect, it } from "vitest";

import type { BoardRow } from "./boardData";
import {
  countAtRisk,
  filterBoardRows,
  getSortLabel,
  sortBoardRows,
} from "./boardFilters";

function row(id: string, name: string, plan: BoardRow["account"]["plan"], score: number, updatedAt: string): BoardRow {
  const healthScore: HealthScore = {
    accountId: id,
    score,
    trend: "flat",
    drivers: [],
    updatedAt,
  };
  return { account: { id, name, plan }, score: healthScore, scoreHistory: [score] };
}

const rows: BoardRow[] = [
  row("a", "Alpha", "free", 30, "2026-06-01T00:00:00Z"),
  row("b", "Bravo", "pro", 55, "2026-06-03T00:00:00Z"),
  row("c", "Charlie", "enterprise", 88, "2026-06-02T00:00:00Z"),
];

describe("boardFilters", () => {
  it("filters by health band", () => {
    expect(filterBoardRows(rows, "all")).toHaveLength(3);
    expect(filterBoardRows(rows, "at-risk").map((r) => r.account.id)).toEqual(["a"]);
    expect(filterBoardRows(rows, "warning").map((r) => r.account.id)).toEqual(["b"]);
    expect(filterBoardRows(rows, "healthy").map((r) => r.account.id)).toEqual(["c"]);
  });

  it("sorts by score descending", () => {
    expect(sortBoardRows(rows, "score").map((r) => r.score.score)).toEqual([88, 55, 30]);
  });

  it("sorts by name, plan, and last updated", () => {
    expect(sortBoardRows(rows, "name").map((r) => r.account.name)).toEqual([
      "Alpha",
      "Bravo",
      "Charlie",
    ]);
    expect(sortBoardRows(rows, "plan").map((r) => r.account.plan)).toEqual([
      "enterprise",
      "pro",
      "free",
    ]);
    expect(sortBoardRows(rows, "updated").map((r) => r.account.id)).toEqual(["b", "c", "a"]);
  });

  it("counts at-risk rows", () => {
    expect(countAtRisk(rows)).toBe(1);
  });

  it("does not mutate the input array", () => {
    const original = [...rows];
    sortBoardRows(rows, "score");
    expect(rows).toEqual(original);
  });

  it("labels sort keys", () => {
    expect(getSortLabel("updated")).toBe("Last Updated");
  });
});
