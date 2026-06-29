import type {
  Account,
  AccountDetail,
  HealthScore,
  ScoreDriver,
  SignalFeedItem,
} from "@beacon/shared";

type ApiData<T> = { data: T };
type ApiError = { error: string };

/** Account health context gathered from the Beacon API. */
export type AccountContext = {
  account: Account;
  score: HealthScore | null;
  drivers: ScoreDriver[];
  recentSignals: SignalFeedItem[];
};

export type BeaconApiClient = {
  fetchAccountContext(accountId: string): Promise<AccountContext | null>;
};

const RECENT_SIGNALS_LIMIT = 50;

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

/** Create a client that loads account health data from the Beacon API. */
export function createBeaconApiClient(apiUrl: string): BeaconApiClient {
  return {
    async fetchAccountContext(accountId: string): Promise<AccountContext | null> {
      let detail: AccountDetail;
      try {
        detail = await fetchApiData<AccountDetail>(apiUrl, `/accounts/${accountId}`);
      } catch (error) {
        if (error instanceof Error && error.message === "Account not found") {
          return null;
        }
        throw error;
      }

      const allSignals = await fetchApiData<SignalFeedItem[]>(
        apiUrl,
        `/signals/recent?limit=${RECENT_SIGNALS_LIMIT}`,
      );
      const recentSignals = allSignals.filter((signal) => signal.accountId === accountId);

      return {
        account: detail.account,
        score: detail.scoreHistory[0] ?? null,
        drivers: detail.drivers,
        recentSignals,
      };
    },
  };
}
