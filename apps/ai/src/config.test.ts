import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("requires ANTHROPIC_API_KEY", () => {
    expect(() => loadConfig({})).toThrow("ANTHROPIC_API_KEY is required");
  });

  it("parses valid configuration without exposing the key", () => {
    const config = loadConfig({
      ANTHROPIC_API_KEY: "sk-test-key",
      API_URL: "http://localhost:3001",
      PORT: "3002",
    });

    expect(config.anthropicApiKey).toBe("sk-test-key");
    expect(config.apiUrl).toBe("http://localhost:3001");
    expect(config.port).toBe(3002);
  });

  it("rejects invalid PORT values", () => {
    expect(() =>
      loadConfig({ ANTHROPIC_API_KEY: "sk-test", PORT: "abc" }),
    ).toThrow("PORT must be a positive number");
  });
});
