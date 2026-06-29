import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchAccountSummary,
  fetchNextAction,
  formatNextAction,
  getAiUrl,
} from "./ai";

const originalEnv = process.env.NEXT_PUBLIC_AI_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalEnv === undefined) {
    delete process.env.NEXT_PUBLIC_AI_URL;
  } else {
    process.env.NEXT_PUBLIC_AI_URL = originalEnv;
  }
});

describe("getAiUrl", () => {
  it("defaults to localhost when env is unset", () => {
    delete process.env.NEXT_PUBLIC_AI_URL;
    expect(getAiUrl()).toBe("http://localhost:3002");
  });

  it("reads NEXT_PUBLIC_AI_URL from env", () => {
    process.env.NEXT_PUBLIC_AI_URL = "http://ai.test";
    expect(getAiUrl()).toBe("http://ai.test");
  });
});

describe("formatNextAction", () => {
  it("joins action and message with a blank line", () => {
    expect(
      formatNextAction({
        action: "Schedule a check-in call",
        message: "Hi team — wanted to follow up on billing.",
      }),
    ).toBe("Schedule a check-in call\n\nHi team — wanted to follow up on billing.");
  });
});

describe("fetchAccountSummary", () => {
  it("posts accountId and returns the summary text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { summary: "Usage is steady." } }),
      }),
    );

    await expect(fetchAccountSummary("acct-1")).resolves.toBe("Usage is steady.");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3002/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acct-1" }),
    });
  });
});

describe("fetchNextAction", () => {
  it("throws when the AI service returns an error payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Account not found" }),
      }),
    );

    await expect(fetchNextAction("missing")).rejects.toThrow("Account not found");
  });

  it("returns formatted action and message text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            action: "Send a usage recap",
            message: "Hi — here is a quick snapshot of your recent activity.",
          },
        }),
      }),
    );

    await expect(fetchNextAction("acct-1")).resolves.toBe(
      "Send a usage recap\n\nHi — here is a quick snapshot of your recent activity.",
    );
    expect(fetch).toHaveBeenCalledWith("http://localhost:3002/next-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acct-1" }),
    });
  });
});
