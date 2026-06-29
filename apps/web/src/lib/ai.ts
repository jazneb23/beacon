const DEFAULT_AI_URL = "http://localhost:3002";

type AiDataResponse<T> = { data: T };
type AiErrorResponse = { error: string };

type SummaryResult = {
  summary: string;
};

type NextActionResult = {
  action: string;
  message: string;
};

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
  const payload = (await response.json()) as AiDataResponse<T> | AiErrorResponse;

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

/** Request a plain-English health summary for an account. */
export async function fetchAccountSummary(accountId: string): Promise<string> {
  const result = await postAiData<SummaryResult>("/summary", { accountId });
  return result.summary;
}

/** Format the next-action payload as readable text for the insight card. */
export function formatNextActionText(result: NextActionResult): string {
  return `${result.action}\n\n${result.message}`;
}

/** Request a recommended next step and draft outreach for an account. */
export async function fetchNextAction(accountId: string): Promise<string> {
  const result = await postAiData<NextActionResult>("/next-action", { accountId });
  return formatNextActionText(result);
}
