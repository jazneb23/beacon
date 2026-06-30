import type { Account, AccountDetail, HealthScore } from "@beacon/shared";

type ApiData<T> = { data: T };
type ApiError = { error: string };

/** Account row with its most recent health score snapshot. */
export type AccountWithScore = Account & { latestScore: HealthScore | null };

export type BeaconApiClient = {
  listAccounts(): Promise<AccountWithScore[]>;
  getAccountDetail(accountId: string): Promise<AccountDetail | null>;
};

/** Fetch JSON from the Beacon API `{ data }` envelope. */
async function fetchApiData<T>(apiUrl: string, path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`);
  const body = (await response.json()) as ApiData<T> | ApiError;

  if (!response.ok) {
    const message = "error" in body ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!("data" in body)) {
    throw new Error("Invalid API response");
  }

  return body.data;
}

/** Create a client for the Beacon REST API. */
export function createBeaconApiClient(apiUrl: string): BeaconApiClient {
  return {
    async listAccounts(): Promise<AccountWithScore[]> {
      return fetchApiData<AccountWithScore[]>(apiUrl, "/accounts");
    },

    async getAccountDetail(accountId: string): Promise<AccountDetail | null> {
      try {
        return await fetchApiData<AccountDetail>(apiUrl, `/accounts/${accountId}`);
      } catch (error) {
        if (error instanceof Error && error.message === "Account not found") {
          return null;
        }
        throw error;
      }
    },
  };
}
