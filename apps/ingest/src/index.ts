import "dotenv/config";
import type { Account } from "@beacon/shared";
import { fetchAccounts, postSignal } from "./api.js";
import { loadConfig } from "./config.js";
import { SignalGenerator } from "./generator.js";

/** Brief one-line log for each ingested signal. */
function logEvent(event: { accountId: string; type: string; value: number }, accounts: Account[]): void {
  const name = accounts.find((a) => a.id === event.accountId)?.name ?? event.accountId;
  console.log(`[ingest] ${name} ${event.type}=${event.value}`);
}

/** Run the ingest loop until the process is interrupted. */
async function run(): Promise<void> {
  const config = loadConfig();
  const accounts = await fetchAccounts(config.apiUrl);
  const generator = new SignalGenerator(accounts, config.seed);

  console.log(
    `[ingest] starting — ${accounts.length} accounts, seed=${config.seed}, interval=${config.intervalMs}ms`,
  );

  const tick = async (): Promise<void> => {
    const event = generator.next();
    await postSignal(config.apiUrl, event);
    logEvent(event, accounts);
  };

  await tick();
  setInterval(() => {
    void tick().catch((error: unknown) => {
      console.error("[ingest] tick failed:", error);
    });
  }, config.intervalMs);
}

run().catch((error: unknown) => {
  console.error("[ingest] fatal:", error);
  process.exit(1);
});
