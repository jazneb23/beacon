import { describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";

import { corsMiddleware } from "./cors.js";

function createTestApp() {
  const app = express();
  app.use(corsMiddleware);
  app.get("/ping", (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}

describe("corsMiddleware", () => {
  it("allows preflight requests from the web app origin", async () => {
    const app = createTestApp();

    const response = await request(app)
      .options("/ping")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
  });

  it("adds CORS headers to GET responses for allowed origins", async () => {
    const app = createTestApp();

    const response = await request(app)
      .get("/ping")
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
  });
});
