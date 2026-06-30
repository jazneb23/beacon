import { describe, expect, it } from "vitest";
import type { HealthScore } from "@beacon/shared";
import { listAtRiskAccounts } from "./atRisk.js";
import { getTopNegativeDrivers } from "./drivers.js";
import type { AccountWithScore } from "./api.js";

const negativeDrivers: HealthScore["drivers"] = [
  { label: "Support volume", weight: 0.15, direction: "negative" },
  { label: "Billing health", weight: 0.25, direction: "positive" },
];

const sampleScore = (score: number): HealthScore => ({
  accountId: "acct-test",
  score,
  trend: "down",
  drivers: negativeDrivers,
  updatedAt: "2026-06-26T10:00:00Z",
});

describe("getTopNegativeDrivers", () => {
  it("returns negative drivers sorted by weight descending", () => {
    const drivers = getTopNegativeDrivers(negativeDrivers);

    expect(drivers).toHaveLength(1);
    expect(drivers[0]?.label).toBe("Support volume");
  });
});

describe("listAtRiskAccounts", () => {
  const accounts: AccountWithScore[] = [
    {
      id: "healthy",
      name: "Healthy Co",
      plan: "enterprise",
      latestScore: sampleScore(80),
    },
    {
      id: "at-risk",
      name: "At Risk Co",
      plan: "pro",
      latestScore: sampleScore(32),
    },
    {
      id: "no-score",
      name: "Unknown Co",
      plan: "free",
      latestScore: null,
    },
  ];

  it("filters accounts below the threshold and includes negative drivers", () => {
    const atRisk = listAtRiskAccounts(accounts, 40);

    expect(atRisk).toHaveLength(1);
    expect(atRisk[0]?.id).toBe("at-risk");
    expect(atRisk[0]?.topNegativeDrivers[0]?.label).toBe("Support volume");
  });

  it("sorts results by lowest score first", () => {
    const mixed: AccountWithScore[] = [
      { id: "b", name: "B", plan: "pro", latestScore: sampleScore(38) },
      { id: "a", name: "A", plan: "pro", latestScore: sampleScore(25) },
    ];

    const atRisk = listAtRiskAccounts(mixed, 40);

    expect(atRisk.map((account) => account.id)).toEqual(["a", "b"]);
  });
});
