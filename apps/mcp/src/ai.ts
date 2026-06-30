import type { NextAction } from "@beacon/shared";

type ApiData<T> = { data: T };
type ApiError = { error: string };

export type AiClient = {
  draftNextAction(accountId: string): Promise<NextAction>;
};

/** POST JSON to the AI service and unwrap the `{ data }` envelope. */
async function postAiData<T>(aiUrl: string, path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${aiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as ApiData<T> | ApiError;

  if (!response.ok) {
    const message = "error" in payload ? payload.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!("data" in payload)) {
    throw new Error("Invalid AI response");
  }

  return payload.data;
}

/** Create a client for the Beacon AI `/next-action` endpoint. */
export function createAiClient(aiUrl: string): AiClient {
  return {
    async draftNextAction(accountId: string): Promise<NextAction> {
      return postAiData<NextAction>(aiUrl, "/next-action", { accountId });
    },
  };
}
