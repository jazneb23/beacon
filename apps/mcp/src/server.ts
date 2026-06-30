import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listAtRiskAccounts } from "./atRisk.js";
import type { AiClient } from "./ai.js";
import type { BeaconApiClient } from "./api.js";

const DEFAULT_THRESHOLD = 40;

/** Format tool output as pretty-printed JSON text content. */
function jsonResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

/** Register Beacon MCP tools backed by the API and AI services. */
export function createMcpServer(api: BeaconApiClient, ai: AiClient): McpServer {
  const server = new McpServer({ name: "beacon", version: "0.0.1" });

  server.registerTool(
    "list_at_risk_accounts",
    {
      description:
        "List accounts with health scores below a threshold, including their top negative drivers.",
      inputSchema: {
        threshold: z
          .number()
          .optional()
          .describe(`Score cutoff; accounts below this value are at risk (default ${DEFAULT_THRESHOLD})`),
      },
    },
    async ({ threshold }) => {
      const accounts = await api.listAccounts();
      const atRisk = listAtRiskAccounts(accounts, threshold ?? DEFAULT_THRESHOLD);
      return jsonResult({ threshold: threshold ?? DEFAULT_THRESHOLD, accounts: atRisk });
    },
  );

  server.registerTool(
    "get_account_health",
    {
      description: "Get the full health score, drivers, and history for one account.",
      inputSchema: {
        accountId: z.string().min(1).describe("Beacon account ID"),
      },
    },
    async ({ accountId }) => {
      const detail = await api.getAccountDetail(accountId);
      if (!detail) {
        return jsonResult({ error: "Account not found" });
      }

      return jsonResult({
        account: detail.account,
        score: detail.scoreHistory[0] ?? null,
        drivers: detail.drivers,
        scoreHistory: detail.scoreHistory,
      });
    },
  );

  server.registerTool(
    "draft_outreach",
    {
      description:
        "Draft a customer outreach message for an account using Beacon AI next-action recommendations.",
      inputSchema: {
        accountId: z.string().min(1).describe("Beacon account ID"),
      },
    },
    async ({ accountId }) => {
      try {
        const draft = await ai.draftNextAction(accountId);
        return jsonResult(draft);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to draft outreach";
        return jsonResult({ error: message });
      }
    },
  );

  return server;
}
