import type { SignalFeedItem } from "@beacon/shared";

const OWNERS = ["Sarah Kim", "Mike Torres", "Ava Chen", "Liam Patel", "Nina Russo"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Stable non-negative hash for deriving deterministic mock values from an id. */
function hashId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic account owner / CSM name for an account. */
export function getAccountOwner(id: string): string {
  return OWNERS[hashId(id) % OWNERS.length];
}

/** Deterministic "customer since" label (e.g. "Mar 2023"). */
export function getCustomerSince(id: string): string {
  const hash = hashId(id);
  const month = MONTHS[hash % 12];
  const year = 2021 + (hash % 4);
  return `${month} ${year}`;
}

/** Deterministic open support ticket count (0–4). */
export function getOpenTickets(id: string): number {
  return hashId(`${id}-tickets`) % 5;
}

/** Deterministic days since last login (1–14). */
export function getDaysSinceLogin(id: string): number {
  return (hashId(`${id}-login`) % 14) + 1;
}

/** Count signals belonging to an account from a recent feed window. */
export function getSignalsThisWeek(id: string, signals: SignalFeedItem[]): number {
  return signals.filter((signal) => signal.accountId === id).length;
}

/** Deterministic "signals this week" count (4–24) for card density. */
export function getWeeklySignalCount(id: string): number {
  return (hashId(`${id}-week`) % 21) + 4;
}
