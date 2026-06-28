import type { HealthScore, SignalEvent } from "@beacon/shared";
import type { Pool } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

vi.mock("./db/accounts.js", () => ({
  listAccountsWithLatestScore: vi.fn(),
  getAccountWithHistory: vi.fn(),
  accountExists: vi.fn(),
}));

vi.mock("./db/signals.js", () => ({
  insertSignalEvent: vi.fn(),
  listSignalEventsForAccount: vi.fn(),
}));

vi.mock("./db/scores.js", () => ({
  insertHealthScore: vi.fn(),
  listLatestHealthScores: vi.fn(),
}));

import {
  accountExists,
  getAccountWithHistory,
  listAccountsWithLatestScore,
} from "./db/accounts.js";
import { insertSignalEvent, listSignalEventsForAccount } from "./db/signals.js";
import { insertHealthScore, listLatestHealthScores } from "./db/scores.js";

const pool = {} as Pool;
const app = createApp(pool);

const sampleScore: HealthScore = {
  accountId: "acct-test",
  score: 72,
  trend: "up",
  drivers: [
    { label: "Product usage", weight: 0.35, direction: "positive" },
    { label: "Login activity", weight: 0.25, direction: "positive" },
    { label: "Billing health", weight: 0.25, direction: "positive" },
    { label: "Support volume", weight: 0.15, direction: "negative" },
  ],
  updatedAt: "2026-06-26T10:00:00Z",
};

describe("routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /healthz", () => {
    it("returns ok status", async () => {
      const response = await request(app).get("/healthz");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: { status: "ok" } });
    });
  });

  describe("GET /accounts", () => {
    it("returns accounts with latest scores", async () => {
      vi.mocked(listAccountsWithLatestScore).mockResolvedValue([
        {
          id: "acct-test",
          name: "Test Co",
          plan: "pro",
          latestScore: sampleScore,
        },
      ]);

      const response = await request(app).get("/accounts");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].latestScore.score).toBe(72);
    });
  });

  describe("GET /accounts/:id", () => {
    it("returns account detail with score history", async () => {
      vi.mocked(getAccountWithHistory).mockResolvedValue({
        account: { id: "acct-test", name: "Test Co", plan: "pro" },
        scoreHistory: [sampleScore],
        drivers: sampleScore.drivers,
      });

      const response = await request(app).get("/accounts/acct-test");

      expect(response.status).toBe(200);
      expect(response.body.data.account.id).toBe("acct-test");
      expect(response.body.data.scoreHistory).toHaveLength(1);
      expect(response.body.data.drivers).toHaveLength(4);
    });

    it("returns 404 when account is missing", async () => {
      vi.mocked(getAccountWithHistory).mockResolvedValue(null);

      const response = await request(app).get("/accounts/missing");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Account not found" });
    });
  });

  describe("POST /signals", () => {
    const payload: SignalEvent = {
      accountId: "acct-test",
      type: "usage",
      value: 80,
      at: "2026-06-27T12:00:00Z",
    };

    it("stores a signal and returns the recomputed score", async () => {
      vi.mocked(accountExists).mockResolvedValue(true);
      vi.mocked(insertSignalEvent).mockResolvedValue(payload);
      vi.mocked(listSignalEventsForAccount).mockResolvedValue([payload]);
      vi.mocked(insertHealthScore).mockResolvedValue(sampleScore);

      const response = await request(app).post("/signals").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.event.accountId).toBe("acct-test");
      expect(response.body.data.score.score).toBe(72);
      expect(insertHealthScore).toHaveBeenCalledOnce();
    });

    it("rejects invalid payloads", async () => {
      const response = await request(app).post("/signals").send({ accountId: "acct-test" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid signal event payload" });
    });

    it("returns 404 for unknown accounts", async () => {
      vi.mocked(accountExists).mockResolvedValue(false);

      const response = await request(app).post("/signals").send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Account not found" });
    });
  });

  describe("GET /scores", () => {
    it("returns latest health scores", async () => {
      vi.mocked(listLatestHealthScores).mockResolvedValue([sampleScore]);

      const response = await request(app).get("/scores");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].accountId).toBe("acct-test");
    });
  });
});
