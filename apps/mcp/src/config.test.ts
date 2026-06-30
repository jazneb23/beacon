import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("requires API_URL", () => {
    delete process.env.API_URL;
    expect(() => loadConfig()).toThrow("API_URL is required");
  });

  it("loads API_URL and defaults AI_URL", () => {
    process.env.API_URL = "http://localhost:3001";
    delete process.env.AI_URL;

    expect(loadConfig()).toEqual({
      apiUrl: "http://localhost:3001",
      aiUrl: "http://localhost:3002",
    });
  });
});
