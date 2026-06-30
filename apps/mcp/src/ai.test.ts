import { afterEach, describe, expect, it, vi } from "vitest";
import { createAiClient } from "./ai.js";

describe("createAiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drafts outreach via the AI next-action endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toBe("http://localhost:3002/next-action");
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({ accountId: "acct-test" });

        return {
          ok: true,
          json: async () => ({
            data: {
              action: "Schedule a check-in call",
              message: "Hi team, we noticed a dip in usage and wanted to help.",
            },
          }),
        };
      }),
    );

    const client = createAiClient("http://localhost:3002");
    const draft = await client.draftNextAction("acct-test");

    expect(draft.action).toContain("check-in");
    expect(draft.message.length).toBeGreaterThan(0);
  });

  it("throws when the AI service returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ error: "Account not found" }),
      })),
    );

    const client = createAiClient("http://localhost:3002");
    await expect(client.draftNextAction("missing")).rejects.toThrow("Account not found");
  });
});
