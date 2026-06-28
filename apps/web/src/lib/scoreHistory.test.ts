import { describe, expect, it } from "vitest";

import { chronologicalScores } from "./scoreHistory";

describe("chronologicalScores", () => {
  it("sorts score snapshots oldest-to-newest", () => {
    const scores = chronologicalScores([
      {
        accountId: "acct-1",
        score: 80,
        trend: "up",
        drivers: [],
        updatedAt: "2026-06-28T12:00:00.000Z",
      },
      {
        accountId: "acct-1",
        score: 60,
        trend: "flat",
        drivers: [],
        updatedAt: "2026-06-26T12:00:00.000Z",
      },
      {
        accountId: "acct-1",
        score: 72,
        trend: "up",
        drivers: [],
        updatedAt: "2026-06-27T12:00:00.000Z",
      },
    ]);

    expect(scores).toEqual([60, 72, 80]);
  });
});
