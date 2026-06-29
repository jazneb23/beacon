import { describe, expect, it } from "vitest";
import type { AccountContext } from "./api.js";
import { buildNextActionUserPrompt, buildSummaryUserPrompt } from "./prompts.js";

const sampleContext: AccountContext = {
  account: { id: "acct-test", name: "Test Co", plan: "pro" },
  score: {
    accountId: "acct-test",
    score: 72,
    trend: "up",
    drivers: [],
    updatedAt: "2026-06-26T10:00:00Z",
  },
  drivers: [
    { label: "Product usage", weight: 0.35, direction: "positive" },
    { label: "Support volume", weight: 0.15, direction: "negative" },
  ],
  recentSignals: [
    {
      id: 1,
      accountId: "acct-test",
      accountName: "Test Co",
      type: "usage",
      value: 80,
      at: "2026-06-27T12:00:00Z",
    },
  ],
};

describe("prompts", () => {
  it("includes account details in the summary prompt", () => {
    const prompt = buildSummaryUserPrompt(sampleContext);

    expect(prompt).toContain("Test Co");
    expect(prompt).toContain("Health score: 72/100");
    expect(prompt).toContain("Product usage");
    expect(prompt).toContain("usage: value 80");
  });

  it("includes account details in the next-action prompt", () => {
    const prompt = buildNextActionUserPrompt(sampleContext);

    expect(prompt).toContain("Test Co");
    expect(prompt).toContain("Plan: pro");
    expect(prompt).toContain("Recent signals");
  });
});
