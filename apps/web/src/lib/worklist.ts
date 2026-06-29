import { getTopNegativeDriver } from "../components/ui/accountCardUtils";
import { getHealthScoreBand } from "../components/ui/healthScoreBand";
import type { BoardRow } from "./boardData";

/** A troubled band that warrants attention (green accounts are excluded). */
export type TroubledBand = "red" | "amber";

export type RecommendedAction = {
  label: string;
  tone: "primary" | "secondary";
};

export type WorklistItem = {
  row: BoardRow;
  band: TroubledBand;
  /** One-line explanation of why the account needs attention. */
  reason: string;
  /** Recent score change (latest minus earliest in the sparkline window). */
  scoreDelta: number;
  action: RecommendedAction;
};

/** Red accounts always rank above amber ones. */
const BAND_RANK: Record<TroubledBand, number> = { red: 0, amber: 1 };

const DROP_THRESHOLD = 3;

/** Recent score change across the accumulated sparkline window. */
function getScoreDelta(history: number[], current: number): number {
  if (history.length < 2) {
    return 0;
  }
  return Math.round(current - history[0]);
}

/** Explain why an account is flagged: a recent drop, a driver, or low score. */
function getReason(row: BoardRow, delta: number): string {
  if (delta <= -DROP_THRESHOLD) {
    return `Score dropped ${Math.abs(delta)} pts`;
  }
  const driver = getTopNegativeDriver(row.score.drivers);
  if (driver) {
    return `${driver.label} declining`;
  }
  return "Low health score";
}

/** Recommend the next action based on urgency band. */
function getAction(band: TroubledBand): RecommendedAction {
  return band === "red"
    ? { label: "Draft outreach", tone: "primary" }
    : { label: "Review account", tone: "secondary" };
}

/**
 * Build a prioritized worklist of troubled (red/amber) accounts, ranked by
 * urgency: red before amber, then lowest score, then largest recent drop.
 */
export function buildWorklist(rows: BoardRow[]): WorklistItem[] {
  const items: WorklistItem[] = [];

  for (const row of rows) {
    const band = getHealthScoreBand(row.score.score);
    if (band === "green") {
      continue;
    }
    const scoreDelta = getScoreDelta(row.scoreHistory, row.score.score);
    items.push({
      row,
      band,
      reason: getReason(row, scoreDelta),
      scoreDelta,
      action: getAction(band),
    });
  }

  items.sort((a, b) => {
    if (BAND_RANK[a.band] !== BAND_RANK[b.band]) {
      return BAND_RANK[a.band] - BAND_RANK[b.band];
    }
    if (a.row.score.score !== b.row.score.score) {
      return a.row.score.score - b.row.score.score;
    }
    return a.scoreDelta - b.scoreDelta;
  });

  return items;
}

export type WorklistSummary = {
  total: number;
  atRisk: number;
  warning: number;
};

/** Count red / amber items for the focus-board summary strip. */
export function summarizeWorklist(items: WorklistItem[]): WorklistSummary {
  const atRisk = items.filter((item) => item.band === "red").length;
  return {
    total: items.length,
    atRisk,
    warning: items.length - atRisk,
  };
}
