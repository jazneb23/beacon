import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import type { AccountContext } from "./api.js";

const sampleContext: AccountContext = {
  account: { id: "acct-test", name: "Test Co", plan: "pro" },
  score: {
    accountId: "acct-test",
    score: 72,
    trend: "up",
    drivers: [
      { label: "Product usage", weight: 0.35, direction: "positive" },
    ],
    updatedAt: "2026-06-26T10:00:00Z",
  },
  drivers: [{ label: "Product usage", weight: 0.35, direction: "positive" }],
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

describe("routes", () => {
  const api = {
    fetchAccountContext: vi.fn(),
  };
  const llm = {
    complete: vi.fn(),
  };
  const app = createApp({ api, llm });

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

  describe("CORS", () => {
    it("allows preflight requests from the web app origin", async () => {
      const response = await request(app)
        .options("/summary")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST");

      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000",
      );
    });

    it("adds CORS headers to POST responses for allowed origins", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue("Summary text.");

      const response = await request(app)
        .post("/summary")
        .set("Origin", "http://localhost:3000")
        .send({ accountId: "acct-test" });

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000",
      );
    });
  });

  describe("POST /summary", () => {
    it("returns a health summary from the LLM", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue(
        "Test Co is healthy with improving usage trends.",
      );

      const response = await request(app)
        .post("/summary")
        .send({ accountId: "acct-test" });

      expect(response.status).toBe(200);
      expect(response.body.data.summary).toBe(
        "Test Co is healthy with improving usage trends.",
      );
      expect(llm.complete).toHaveBeenCalledOnce();
    });

    it("returns 404 when the account is missing", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(null);

      const response = await request(app)
        .post("/summary")
        .send({ accountId: "missing" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Account not found" });
    });

    it("rejects requests without accountId", async () => {
      const response = await request(app).post("/summary").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "accountId is required" });
    });
  });

  describe("POST /next-action", () => {
    it("returns the next action and outreach message", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(sampleContext);
      vi.mocked(llm.complete).mockResolvedValue(
        JSON.stringify({
          action: "Offer a product walkthrough.",
          message: "Hi there — noticed strong usage lately.",
        }),
      );

      const response = await request(app)
        .post("/next-action")
        .send({ accountId: "acct-test" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        action: "Offer a product walkthrough.",
        message: "Hi there — noticed strong usage lately.",
      });
    });

    it("returns 404 when the account is missing", async () => {
      vi.mocked(api.fetchAccountContext).mockResolvedValue(null);

      const response = await request(app)
        .post("/next-action")
        .send({ accountId: "missing" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Account not found" });
    });

    it("rejects requests without accountId", async () => {
      const response = await request(app).post("/next-action").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "accountId is required" });
    });
  });
});
