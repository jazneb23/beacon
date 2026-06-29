import { Router } from "express";
import type { BeaconApiClient } from "../api.js";
import { asyncHandler, sendData, sendError } from "../http.js";
import type { LlmClient } from "../llm.js";
import { generateNextAction } from "../services/nextAction.js";
import { generateSummary } from "../services/summary.js";

/** Parse `{ accountId }` from a JSON request body. */
function parseAccountId(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const accountId = (body as Record<string, unknown>).accountId;
  if (typeof accountId !== "string" || accountId.length === 0) {
    return null;
  }

  return accountId;
}

/** AI insight routes backed by the Beacon API and Anthropic. */
export function createInsightsRouter(
  api: BeaconApiClient,
  llm: LlmClient,
): Router {
  const router = Router();

  router.post(
    "/summary",
    asyncHandler(async (req, res) => {
      const accountId = parseAccountId(req.body);
      if (!accountId) {
        sendError(res, "accountId is required");
        return;
      }

      const result = await generateSummary(api, llm, accountId);
      if (!result) {
        sendError(res, "Account not found", 404);
        return;
      }

      sendData(res, result);
    }),
  );

  router.post(
    "/next-action",
    asyncHandler(async (req, res) => {
      const accountId = parseAccountId(req.body);
      if (!accountId) {
        sendError(res, "accountId is required");
        return;
      }

      const result = await generateNextAction(api, llm, accountId);
      if (!result) {
        sendError(res, "Account not found", 404);
        return;
      }

      sendData(res, result);
    }),
  );

  return router;
}
