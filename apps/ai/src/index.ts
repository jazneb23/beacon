import "dotenv/config";
import { createBeaconApiClient } from "./api.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createLlmClient } from "./llm.js";

const config = loadConfig();
const api = createBeaconApiClient(config.apiUrl);
const llm = createLlmClient(config.anthropicApiKey);
const app = createApp({ api, llm });

const server = app.listen(config.port, () => {
  console.log(`@beacon/ai listening on http://localhost:${config.port}`);
});

/** Gracefully stop the HTTP server on shutdown. */
function shutdown(): void {
  server.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
