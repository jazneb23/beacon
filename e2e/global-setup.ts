import { execSync } from "node:child_process";
import type { FullConfig } from "@playwright/test";

// Apply the schema and load deterministic demo data so specs can assert on
// known accounts (Northwind Analytics, Riverstone Labs, etc.). Runs once
// before the suite; safe to run even if the API server is already up since
// the API reads fresh data from Postgres on every request.
async function globalSetup(_config: FullConfig): Promise<void> {
  execSync("pnpm --filter @beacon/api migrate", { stdio: "inherit" });
  execSync("pnpm --filter @beacon/api seed", { stdio: "inherit" });
}

export default globalSetup;
