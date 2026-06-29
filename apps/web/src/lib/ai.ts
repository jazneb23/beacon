import type { AccountSummary, NextAction } from "@beacon/shared";

const DEFAULT_AI_URL = "http://localhost:3002";

type ApiDataResponse<T> = { data: T };
type ApiErrorResponse = { error: string };

/** Resolve the public AI service base URL from env with a local dev default. */
export function getAiUrl(): string {
  return process.env.NEXT_PUBLIC_AI_URL ?? DEFAULT_AI_URL;
}

/** POST JSON to the AI service and unwrap the `{ data }` envelope. */
async function postAiData<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${getAiUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as ApiDataResponse<T> | ApiErrorResponse;

  if (!response.ok) {
    const message =
      "error" in payload ? payload.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!("data" in payload)) {
    throw new Error("Invalid AI response");
  }

  return payload.data;
}

/** Generate a plain-English account health summary. */
export async function fetchAccountSummary(accountId: string): Promise<string> {
  const { summary } = await postAiData<AccountSummary>("/summary", { accountId });
  return summary;
}

/** Format next-action fields into readable display text. */
export function formatNextAction({ action, message }: NextAction): string {
  return `${action}\n\n${message}`;
}

/** Propose the best next step and draft outreach for an account. */
export async function fetchNextAction(accountId: string): Promise<string> {
  const result = await postAiData<NextAction>("/next-action", { accountId });
  return formatNextAction(result);
}
