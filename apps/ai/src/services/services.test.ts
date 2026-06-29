import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountContext } from "../api.js";
import { generateNextAction } from "./nextAction.js";
import { generateSummary } from "./summary.js";

const sampleContext: AccountContext = {
  account: { id: "acct-test", name: "Test Co", plan: "pro" },
  score: {
    accountId: "acct-test",
    score: 72,
    trend: "up",
    drivers: [],
    updatedAt: "2026-06-26T10:00:00Z",
  },
  drivers: [],
  recentSignals: [],
};

describe("services", () => {
  const api = {
    fetchAccountContext: vi.fn(),
  };
  const llm = {
    complete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateSummary", () => {
    it("returns null when the account is missing", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(null);

      const result = await generateSummary(api, llm, "missing");

      expect(result).toBeNull();
      expect(llm.complete).not.toHaveBeenCalled();
    });

    it("returns the LLM summary for a valid account", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue("Account health is stable.");

      const result = await generateSummary(api, llm, "acct-test");

      expect(result).toEqual({ summary: "Account health is stable." });
      expect(llm.complete).toHaveBeenCalledOnce();
    });
  });

  describe("generateNextAction", () => {
    it("parses JSON from the LLM response", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue(
        JSON.stringify({
          action: "Schedule a check-in call.",
          message: "Hi team, wanted to see how things are going.",
        }),
      );

      const result = await generateNextAction(api, llm, "acct-test");

      expect(result).toEqual({
        action: "Schedule a check-in call.",
        message: "Hi team, wanted to see how things are going.",
      });
    });

    it("throws when the LLM returns invalid JSON", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue("not json");

      await expect(generateNextAction(api, llm, "acct-test")).rejects.toThrow(
        "LLM returned invalid JSON for next action",
      );
    });
  });
});
