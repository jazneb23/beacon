#!/usr/bin/env node
import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAiClient } from "./ai.js";
import { createBeaconApiClient } from "./api.js";
import { loadConfig } from "./config.js";
import { createMcpServer } from "./server.js";

/** Start the Beacon MCP server on stdio transport. */
async function main(): Promise<void> {
  const config = loadConfig();
  const api = createBeaconApiClient(config.apiUrl);
  const ai = createAiClient(config.aiUrl);
  const server = createMcpServer(api, ai);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
