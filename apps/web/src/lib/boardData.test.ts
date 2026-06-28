import { describe, expect, it } from "vitest";

import { appendScoreHistory, buildBoardRows } from "./boardData";

const sampleScore = {
  accountId: "acct-1",
  score: 72,
  trend: "up" as const,
  drivers: [],
  updatedAt: "2026-06-27T12:00:00Z",
};

describe("appendScoreHistory", () => {
  it("adds new readings and keeps the last six points", () => {
    const history = appendScoreHistory({}, [sampleScore]);
    expect(history["acct-1"]).toEqual([72]);

    const extended = appendScoreHistory(history, [
      { ...sampleScore, score: 75 },
    ]);
    expect(extended["acct-1"]).toEqual([72, 75]);
  });

  it("skips duplicate consecutive scores", () => {
    const history = appendScoreHistory({ "acct-1": [70] }, [sampleScore]);
    expect(history["acct-1"]).toEqual([70, 72]);

    const unchanged = appendScoreHistory(history, [sampleScore]);
    expect(unchanged["acct-1"]).toEqual([70, 72]);
  });
});

describe("buildBoardRows", () => {
  it("merges accounts and scores with accumulated history", () => {
    const rows = buildBoardRows(
      [
        {
          id: "acct-1",
          name: "Acme",
          plan: "pro",
          latestScore: sampleScore,
        },
      ],
      [{ ...sampleScore, score: 80 }],
      { "acct-1": [70, 72, 80] },
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.account.name).toBe("Acme");
    expect(rows[0]?.score.score).toBe(80);
    expect(rows[0]?.scoreHistory).toEqual([70, 72, 80]);
  });

  it("omits accounts without any score", () => {
    const rows = buildBoardRows(
      [{ id: "acct-1", name: "Acme", plan: "free", latestScore: null }],
      [],
      {},
    );

    expect(rows).toEqual([]);
  });
});
