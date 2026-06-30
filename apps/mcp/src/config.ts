/** Runtime configuration loaded from environment variables. */
export type Config = {
  apiUrl: string;
  aiUrl: string;
};

/** Read required API_URL and optional AI_URL from the environment. */
export function loadConfig(): Config {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is required");
  }

  return {
    apiUrl,
    aiUrl: process.env.AI_URL ?? "http://localhost:3002",
  };
}
