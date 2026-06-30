import { afterEach, describe, expect, it, vi } from "vitest";
import { createBeaconApiClient } from "./api.js";

describe("createBeaconApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists accounts from the Beacon API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "acct-test",
              name: "Test Co",
              plan: "pro",
              latestScore: {
                accountId: "acct-test",
                score: 35,
                trend: "down",
                drivers: [],
                updatedAt: "2026-06-26T10:00:00Z",
              },
            },
          ],
        }),
      })),
    );

    const client = createBeaconApiClient("http://localhost:3001");
    const accounts = await client.listAccounts();

    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.latestScore?.score).toBe(35);
  });

  it("loads account detail from the Beacon API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
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
      })),
    );

    const client = createBeaconApiClient("http://localhost:3001");
    const detail = await client.getAccountDetail("acct-test");

    expect(detail?.account.name).toBe("Test Co");
    expect(detail?.scoreHistory).toHaveLength(1);
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
    const detail = await client.getAccountDetail("missing");

    expect(detail).toBeNull();
  });
});
