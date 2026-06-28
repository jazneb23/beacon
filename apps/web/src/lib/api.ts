import type {
  Account,
  AccountDetail,
  HealthScore,
  SignalFeedItem,
} from "@beacon/shared";

const DEFAULT_API_URL = "http://localhost:3001";

export type AccountWithLatestScore = Account & {
  latestScore: HealthScore | null;
};

type ApiDataResponse<T> = { data: T };
type ApiErrorResponse = { error: string };

/** Resolve the public API base URL from env with a local dev default. */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

/** Fetch JSON from the Beacon API `{ data }` envelope. */
async function fetchApiData<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`);
  const body = (await response.json()) as ApiDataResponse<T> | ApiErrorResponse;

  if (!response.ok) {
    const message =
      "error" in body ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!("data" in body)) {
    throw new Error("Invalid API response");
  }

  return body.data;
}

/** Load all accounts with their latest score snapshot. */
export function fetchAccounts(): Promise<AccountWithLatestScore[]> {
  return fetchApiData<AccountWithLatestScore[]>("/accounts");
}

/** Load the latest health score for every account. */
export function fetchScores(): Promise<HealthScore[]> {
  return fetchApiData<HealthScore[]>("/scores");
}

/** Load the most recent signal events for the live feed. */
export function fetchRecentSignals(limit = 50): Promise<SignalFeedItem[]> {
  return fetchApiData<SignalFeedItem[]>(`/signals/recent?limit=${limit}`);
}

/** Load one account with score history and weighted drivers. */
export function fetchAccountDetail(accountId: string): Promise<AccountDetail> {
  return fetchApiData<AccountDetail>(`/accounts/${accountId}`);
}
