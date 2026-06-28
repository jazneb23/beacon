import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAccounts, fetchAccountDetail, fetchRecentSignals, fetchScores, getApiUrl } from "./api";

const originalEnv = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalEnv === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
  } else {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  }
});

describe("getApiUrl", () => {
  it("defaults to localhost when env is unset", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiUrl()).toBe("http://localhost:3001");
  });

  it("reads NEXT_PUBLIC_API_URL from env", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://api.test";
    expect(getApiUrl()).toBe("http://api.test");
  });
});

describe("fetchAccounts", () => {
  it("returns accounts from the API data envelope", async () => {
    const accounts = [
      {
        id: "acct-1",
        name: "Acme",
        plan: "pro" as const,
        latestScore: null,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: accounts }),
      }),
    );

    await expect(fetchAccounts()).resolves.toEqual(accounts);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/accounts");
  });
});

describe("fetchScores", () => {
  it("throws when the API returns an error payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Service unavailable" }),
      }),
    );

    await expect(fetchScores()).rejects.toThrow("Service unavailable");
  });
});

describe("fetchRecentSignals", () => {
  it("returns recent signal feed items from the API", async () => {
    const items = [
      {
        id: 7,
        accountId: "acct-1",
        accountName: "Acme",
        type: "login" as const,
        value: 72,
        at: "2026-06-28T12:00:00.000Z",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: items }),
      }),
    );

    await expect(fetchRecentSignals(25)).resolves.toEqual(items);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/signals/recent?limit=25");
  });
});

describe("fetchAccountDetail", () => {
  it("returns account detail from the API data envelope", async () => {
    const detail = {
      account: {
        id: "acct-1",
        name: "Acme",
        plan: "pro" as const,
      },
      scoreHistory: [],
      drivers: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: detail }),
      }),
    );

    await expect(fetchAccountDetail("acct-1")).resolves.toEqual(detail);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/accounts/acct-1");
  });
});
