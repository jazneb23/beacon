import type { BeaconApiClient } from "../api.js";
import type { LlmClient } from "../llm.js";
import { NEXT_ACTION_SYSTEM_PROMPT, buildNextActionUserPrompt } from "../prompts.js";

export type NextActionResult = {
  action: string;
  message: string;
};

type LlmNextActionPayload = {
  action: string;
  message: string;
};

/** Parse and validate the LLM JSON payload for next-action responses. */
function parseNextActionResponse(raw: string): NextActionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LLM returned invalid JSON for next action");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("LLM returned invalid JSON for next action");
  }

  const record = parsed as Partial<LlmNextActionPayload>;
  if (typeof record.action !== "string" || record.action.length === 0) {
    throw new Error("LLM response missing action");
  }
  if (typeof record.message !== "string" || record.message.length === 0) {
    throw new Error("LLM response missing message");
  }

  return { action: record.action, message: record.message };
}

/** Propose the best next step and draft outreach for an account. */
export async function generateNextAction(
  api: BeaconApiClient,
  llm: LlmClient,
  accountId: string,
): Promise<NextActionResult | null> {
  const context = await api.fetchAccountContext(accountId);
  if (!context) {
    return null;
  }

  const raw = await llm.complete(
    NEXT_ACTION_SYSTEM_PROMPT,
    buildNextActionUserPrompt(context),
  );

  return parseNextActionResponse(raw);
}
