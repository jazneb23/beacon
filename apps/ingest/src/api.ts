import type { Account, SignalEvent } from "@beacon/shared";

type ApiData<T> = { data: T };
type ApiError = { error: string };

/** Fetch all seeded accounts from the API. */
export async function fetchAccounts(apiUrl: string): Promise<Account[]> {
  const response = await fetch(`${apiUrl}/accounts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch accounts: ${response.status}`);
  }

  const body = (await response.json()) as ApiData<Account[]> | ApiError;
  if ("error" in body) {
    throw new Error(`Failed to fetch accounts: ${body.error}`);
  }

  return body.data;
}

/** POST a signal event to the API. */
export async function postSignal(apiUrl: string, event: SignalEvent): Promise<void> {
  const response = await fetch(`${apiUrl}/signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(`Failed to post signal: ${body.error ?? response.status}`);
  }
}
