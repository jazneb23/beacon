import express from "express";
import type { BeaconApiClient } from "./api.js";
import { corsMiddleware } from "./cors.js";
import { sendData } from "./http.js";
import type { LlmClient } from "./llm.js";
import { createInsightsRouter } from "./routes/insights.js";

export type AppDeps = {
  api: BeaconApiClient;
  llm: LlmClient;
};

/** Build the Express application with injected API and LLM clients. */
export function createApp(deps: AppDeps) {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.get("/healthz", (_req, res) => {
    sendData(res, { status: "ok" });
  });
  app.use(createInsightsRouter(deps.api, deps.llm));

  return app;
}
