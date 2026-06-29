export type ScoreDriver = {
  label: string;
  weight: number;
  direction: "positive" | "negative";
};

export type HealthScore = {
  accountId: string;
  score: number;
  trend: "up" | "down" | "flat";
  drivers: ScoreDriver[];
  updatedAt: string;
};

export type Account = {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
};

export type AccountDetail = {
  account: Account;
  scoreHistory: HealthScore[];
  drivers: ScoreDriver[];
};

export type SignalEvent = {
  accountId: string;
  type: "usage" | "support" | "billing" | "login";
  value: number;
  at: string;
};

export type SignalFeedItem = SignalEvent & {
  id: number;
  accountName: string;
};

export type AccountSummary = {
  summary: string;
};

export type NextAction = {
  action: string;
  message: string;
};

/** Maps each signal type to its scoring driver index. */
const SIGNAL_TYPE_INDEX: Record<SignalEvent["type"], number> = {
  usage: 0,
  login: 1,
  billing: 2,
  support: 3,
};

/** Driver weights must sum to 1.0; higher weight = more influence on final score. */
const SCORE_DRIVERS: ScoreDriver[] = [
  { label: "Product usage", weight: 0.35, direction: "positive" },
  { label: "Login activity", weight: 0.25, direction: "positive" },
  { label: "Billing health", weight: 0.25, direction: "positive" },
  // Support tickets hurt health — more volume lowers the score.
  { label: "Support volume", weight: 0.15, direction: "negative" },
];

/** Clamp a raw signal value (0–100 scale) to a 0–1 ratio. */
function normalize(value: number): number {
  return Math.min(Math.max(value / 100, 0), 1);
}

/** Average event values for a single signal type. */
function averageByType(
  events: SignalEvent[],
  type: SignalEvent["type"],
): number | null {
  const matching = events.filter((event) => event.type === type);
  if (matching.length === 0) {
    return null;
  }
  const total = matching.reduce((sum, event) => sum + event.value, 0);
  return total / matching.length;
}

/** Convert a driver's average signal into a 0–100 contribution. */
function driverContribution(avg: number, driver: ScoreDriver): number {
  const ratio = normalize(avg);
  return driver.direction === "positive" ? ratio * 100 : (1 - ratio) * 100;
}

/** Weighted sum of driver contributions, re-normalized when some types are missing. */
function scoreFromEvents(events: SignalEvent[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < SCORE_DRIVERS.length; i++) {
    const driver = SCORE_DRIVERS[i];
    const signalType = (Object.keys(SIGNAL_TYPE_INDEX) as SignalEvent["type"][]).find(
      (type) => SIGNAL_TYPE_INDEX[type] === i,
    );
    if (!driver || !signalType) {
      continue;
    }

    const avg = averageByType(events, signalType);
    if (avg === null) {
      continue;
    }

    weightedSum += driverContribution(avg, driver) * driver.weight;
    totalWeight += driver.weight;
  }

  if (totalWeight === 0) {
    return 50;
  }

  return Math.round(weightedSum / totalWeight);
}

/** Compare older vs newer event halves to detect score movement. */
function computeTrend(events: SignalEvent[]): HealthScore["trend"] {
  if (events.length < 2) {
    return "flat";
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
  const midpoint = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, midpoint);
  const newer = sorted.slice(midpoint);

  const olderScore = scoreFromEvents(older);
  const newerScore = scoreFromEvents(newer);
  const delta = newerScore - olderScore;

  if (delta >= 5) {
    return "up";
  }
  if (delta <= -5) {
    return "down";
  }
  return "flat";
}

/** Turn raw signal events into an explainable 0–100 health score. */
export function computeScore(events: SignalEvent[]): HealthScore {
  const accountId = events[0]?.accountId ?? "unknown";
  const latestAt = events.reduce<string | null>((latest, event) => {
    if (latest === null || event.at > latest) {
      return event.at;
    }
    return latest;
  }, null);

  return {
    accountId,
    score: scoreFromEvents(events),
    trend: computeTrend(events),
    drivers: SCORE_DRIVERS,
    updatedAt: latestAt ?? new Date().toISOString(),
  };
}
