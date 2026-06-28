import { computeScore, type SignalEvent } from "@beacon/shared";
import { Router } from "express";
import type { Pool } from "pg";
import { accountExists } from "../db/accounts.js";
import {
  insertSignalEvent,
  listRecentSignalEvents,
  listSignalEventsForAccount,
} from "../db/signals.js";
import { insertHealthScore } from "../db/scores.js";
import { asyncHandler, sendData, sendError } from "../http.js";

const SIGNAL_TYPES = new Set<SignalEvent["type"]>([
  "usage",
  "support",
  "billing",
  "login",
]);

/** Validate an incoming signal event body. */
function parseSignalEvent(body: unknown): SignalEvent | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const accountId = record.accountId;
  const type = record.type;
  const value = record.value;
  const at = record.at;

  if (typeof accountId !== "string" || accountId.length === 0) {
    return null;
  }
  if (typeof type !== "string" || !SIGNAL_TYPES.has(type as SignalEvent["type"])) {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) {
    return null;
  }

  return {
    accountId,
    type: type as SignalEvent["type"],
    value,
    at,
  };
}

const DEFAULT_FEED_LIMIT = 50;
const MAX_FEED_LIMIT = 100;

/** Parse an optional positive integer limit from a query string. */
function parseFeedLimit(raw: unknown): number {
  if (typeof raw !== "string" || raw.length === 0) {
    return DEFAULT_FEED_LIMIT;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_FEED_LIMIT;
  }

  return Math.min(parsed, MAX_FEED_LIMIT);
}

/** Ingest signal events and recompute account health scores. */
export function createSignalsRouter(pool: Pool): Router {
  const router = Router();

  router.get(
    "/recent",
    asyncHandler(async (req, res) => {
      const limit = parseFeedLimit(req.query.limit);
      const events = await listRecentSignalEvents(pool, limit);
      sendData(res, events);
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const event = parseSignalEvent(req.body);
      if (!event) {
        sendError(res, "Invalid signal event payload");
        return;
      }

      const exists = await accountExists(pool, event.accountId);
      if (!exists) {
        sendError(res, "Account not found", 404);
        return;
      }

      const savedEvent = await insertSignalEvent(pool, event);
      const events = await listSignalEventsForAccount(pool, event.accountId);
      const score = computeScore(events);
      const savedScore = await insertHealthScore(pool, score);

      sendData(res, { event: savedEvent, score: savedScore }, 201);
    }),
  );

  return router;
}
