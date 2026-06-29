import type { BeaconApiClient } from "../api.js";
import type { LlmClient } from "../llm.js";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from "../prompts.js";

export type SummaryResult = {
  summary: string;
};

/** Generate a plain-English health summary for an account. */
export async function generateSummary(
  api: BeaconApiClient,
  llm: LlmClient,
  accountId: string,
): Promise<SummaryResult | null> {
  const context = await api.fetchAccountContext(accountId);
  if (!context) {
    return null;
  }

  const summary = await llm.complete(
    SUMMARY_SYSTEM_PROMPT,
    buildSummaryUserPrompt(context),
  );

  return { summary };
}
