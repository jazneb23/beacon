/** Runtime configuration loaded from environment variables. */
export type AiConfig = {
  anthropicApiKey: string;
  apiUrl: string;
  port: number;
};

/** Parse and validate AI service configuration. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const anthropicApiKey = env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey || anthropicApiKey.length === 0) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  const apiUrl = env.API_URL ?? "http://localhost:3001";
  const port = Number(env.PORT ?? "3002");

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return { anthropicApiKey, apiUrl, port };
}
