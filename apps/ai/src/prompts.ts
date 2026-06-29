import type { AccountContext } from "./api.js";

/** Format account context as structured text for LLM prompts. */
function formatAccountContext(context: AccountContext): string {
  const { account, score, drivers, recentSignals } = context;
  const scoreLine = score
    ? `Health score: ${score.score}/100 (trend: ${score.trend}, updated ${score.updatedAt})`
    : "Health score: unavailable";

  const driverLines = drivers
    .map(
      (driver) =>
        `- ${driver.label}: weight ${driver.weight}, ${driver.direction === "positive" ? "higher is better" : "lower is better"}`,
    )
    .join("\n");

  const signalLines =
    recentSignals.length === 0
      ? "No recent signals recorded."
      : recentSignals
          .map(
            (signal) =>
              `- ${signal.type}: value ${signal.value} at ${signal.at}`,
          )
          .join("\n");

  return [
    `Account: ${account.name} (${account.id})`,
    `Plan: ${account.plan}`,
    scoreLine,
    "Score drivers:",
    driverLines,
    "Recent signals:",
    signalLines,
  ].join("\n");
}

export const SUMMARY_SYSTEM_PROMPT =
  "You are a customer success analyst for a SaaS product. Write concise, plain-English account health summaries for internal teams. Focus on what matters for retention and expansion. Do not use bullet points or markdown.";

/** Build the user prompt for a health summary. */
export function buildSummaryUserPrompt(context: AccountContext): string {
  return [
    "Using the account data below, write a 3-4 sentence plain-English health summary.",
    "Mention the overall score, notable trends, and any risk or opportunity signals.",
    "",
    formatAccountContext(context),
  ].join("\n");
}

export const NEXT_ACTION_SYSTEM_PROMPT =
  "You are a customer success strategist. Propose the single best next step for an account team and draft a short outreach message. Respond with valid JSON only, no markdown fences, using this shape: {\"action\":\"...\",\"message\":\"...\"}. The action is one sentence describing what to do. The message is 2-3 sentences the CSM can send to the customer.";

/** Build the user prompt for next-best-action and outreach draft. */
export function buildNextActionUserPrompt(context: AccountContext): string {
  return [
    "Review the account data below and return JSON with the single best next action and a draft outreach message.",
    "",
    formatAccountContext(context),
  ].join("\n");
}
