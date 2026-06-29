import { afterEach, describe, expect, it, vi } from "vitest";
import { createBeaconApiClient } from "./api.js";

describe("createBeaconApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads account context from the Beacon API", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/accounts/acct-test")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              account: { id: "acct-test", name: "Test Co", plan: "pro" },
              scoreHistory: [
                {
                  accountId: "acct-test",
                  score: 72,
                  trend: "up",
                  drivers: [],
                  updatedAt: "2026-06-26T10:00:00Z",
                },
              ],
              drivers: [],
            },
          }),
        };
      }

      if (url.includes("/signals/recent")) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: 1,
                accountId: "acct-test",
                accountName: "Test Co",
                type: "usage",
                value: 80,
                at: "2026-06-27T12:00:00Z",
              },
              {
                id: 2,
                accountId: "acct-other",
                accountName: "Other Co",
                type: "login",
                value: 50,
                at: "2026-06-27T12:00:00Z",
              },
            ],
          }),
        };
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const client = createBeaconApiClient("http://localhost:3001");
    const context = await client.fetchAccountContext("acct-test");

    expect(context?.account.name).toBe("Test Co");
    expect(context?.score?.score).toBe(72);
    expect(context?.recentSignals).toHaveLength(1);
    expect(context?.recentSignals[0]?.accountId).toBe("acct-test");
  });

  it("returns null when the account is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ error: "Account not found" }),
      })),
    );

    const client = createBeaconApiClient("http://localhost:3001");
    const context = await client.fetchAccountContext("missing");

    expect(context).toBeNull();
  });
});
