import type { SignalEvent } from "@beacon/shared";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Format an ISO timestamp as a compact relative time (e.g. "2s ago"). */
export function formatRelativeTime(at: string, now: Date = new Date()): string {
  const then = new Date(at).getTime();
  const diffMs = Math.max(0, now.getTime() - then);

  const seconds = Math.floor(diffMs / SECOND_MS);
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(diffMs / HOUR_MS);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(diffMs / DAY_MS);
  return `${days}d ago`;
}

/** Short human label for a signal event type. */
export function getSignalDescription(type: SignalEvent["type"]): string {
  switch (type) {
    case "usage":
      return "Usage drop";
    case "support":
      return "Support ticket";
    case "billing":
      return "Billing issue";
    case "login":
      return "Login activity";
  }
}
