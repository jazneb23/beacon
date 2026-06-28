import { Router } from "express";
import type { Pool } from "pg";
import { getAccountWithHistory, listAccountsWithLatestScore } from "../db/accounts.js";
import { asyncHandler, sendData, sendError } from "../http.js";

/** Account listing and detail routes. */
export function createAccountsRouter(pool: Pool): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const accounts = await listAccountsWithLatestScore(pool);
      sendData(res, accounts);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const accountId = req.params.id;
      if (!accountId || Array.isArray(accountId)) {
        sendError(res, "Account not found", 404);
        return;
      }

      const account = await getAccountWithHistory(pool, accountId);
      if (!account) {
        sendError(res, "Account not found", 404);
        return;
      }
      sendData(res, account);
    }),
  );

  return router;
}
