import type { ScoreDriver } from "@beacon/shared";
import { describe, expect, it } from "vitest";

import type { BoardRow } from "./boardData";
import { buildWorklist, summarizeWorklist } from "./worklist";

function makeRow(
  id: string,
  score: number,
  options: { history?: number[]; drivers?: ScoreDriver[] } = {},
): BoardRow {
  return {
    account: { id, name: id, plan: "pro" },
    score: {
      accountId: id,
      score,
      trend: "flat",
      drivers: options.drivers ?? [],
      updatedAt: "2026-06-20T12:00:00Z",
    },
    scoreHistory: options.history ?? [score],
  };
}

describe("buildWorklist", () => {
  it("excludes healthy (green) accounts", () => {
    const items = buildWorklist([makeRow("green", 80), makeRow("amber", 55)]);
    expect(items).toHaveLength(1);
    expect(items[0].row.account.id).toBe("amber");
  });

  it("ranks red before amber, then by lowest score", () => {
    const items = buildWorklist([
      makeRow("amber-high", 55),
      makeRow("red-high", 30),
      makeRow("amber-low", 45),
      makeRow("red-low", 20),
    ]);
    expect(items.map((item) => item.row.account.id)).toEqual([
      "red-low",
      "red-high",
      "amber-low",
      "amber-high",
    ]);
  });

  it("flags a recent score drop in the reason", () => {
    const [item] = buildWorklist([makeRow("drop", 45, { history: [60, 45] })]);
    expect(item.reason).toBe("Score dropped 15 pts");
  });

  it("falls back to the top negative driver, then a low-score reason", () => {
    const withDriver = buildWorklist([
      makeRow("driver", 50, {
        drivers: [{ label: "Billing", weight: 0.5, direction: "negative" }],
      }),
    ]);
    expect(withDriver[0].reason).toBe("Billing declining");

    const plain = buildWorklist([makeRow("plain", 50)]);
    expect(plain[0].reason).toBe("Low health score");
  });

  it("recommends outreach for red and review for amber", () => {
    const [red] = buildWorklist([makeRow("red", 20)]);
    const [amber] = buildWorklist([makeRow("amber", 55)]);
    expect(red.action).toEqual({ label: "Draft outreach", tone: "primary" });
    expect(amber.action).toEqual({ label: "Review account", tone: "secondary" });
  });
});

describe("summarizeWorklist", () => {
  it("counts at-risk and warning items", () => {
    const items = buildWorklist([
      makeRow("red-1", 20),
      makeRow("red-2", 30),
      makeRow("amber-1", 55),
      makeRow("green", 90),
    ]);
    expect(summarizeWorklist(items)).toEqual({ total: 3, atRisk: 2, warning: 1 });
  });
});
