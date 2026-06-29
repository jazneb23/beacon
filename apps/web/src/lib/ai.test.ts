import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchAccountSummary,
  fetchNextAction,
  formatNextActionText,
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

describe("formatNextActionText", () => {
  it("joins action and message with a blank line", () => {
    expect(
      formatNextActionText({
        action: "Offer a product walkthrough.",
        message: "Hi there — noticed strong usage lately.",
      }),
    ).toBe("Offer a product walkthrough.\n\nHi there — noticed strong usage lately.");
  });
});

describe("fetchAccountSummary", () => {
  it("returns summary text from the AI service", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { summary: "Account health is stable." } }),
      }),
    );

    await expect(fetchAccountSummary("acct-1")).resolves.toBe("Account health is stable.");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3002/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acct-1" }),
    });
  });

  it("throws when the AI service returns an error payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Account not found" }),
      }),
    );

    await expect(fetchAccountSummary("missing")).rejects.toThrow("Account not found");
  });
});

describe("fetchNextAction", () => {
  it("returns formatted action text from the AI service", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            action: "Schedule a check-in.",
            message: "Hi — wanted to follow up on your recent usage.",
          },
        }),
      }),
    );

    await expect(fetchNextAction("acct-1")).resolves.toBe(
      "Schedule a check-in.\n\nHi — wanted to follow up on your recent usage.",
    );
    expect(fetch).toHaveBeenCalledWith("http://localhost:3002/next-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acct-1" }),
    });
  });
});
