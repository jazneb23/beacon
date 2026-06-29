import { defineConfig, devices } from "@playwright/test";

const WEB_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";
const isCI = Boolean(process.env.CI);

// Desktop-only Beacon E2E suite. Seeds the DB in global setup, then boots the
// API + web dev servers before running the specs in e2e/.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: WEB_URL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @beacon/api dev",
      url: `${API_URL}/healthz`,
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @beacon/web dev",
      url: WEB_URL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
