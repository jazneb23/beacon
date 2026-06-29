import type { SignalEvent } from "@beacon/shared";

/**
 * Derive an approximate score delta for a signal row.
 *
 * Usage/login/billing are positive drivers (high value helps), support is a
 * negative driver (high value hurts). We map the 0–100 value to a small signed
 * delta so the feed can show a "+2" / "-5" style indicator.
 */
export function getSignalScoreDelta(type: SignalEvent["type"], value: number): number {
  const normalized = Math.min(Math.max(value, 0), 100);
  const magnitude = Math.round((Math.abs(normalized - 50) / 50) * 6);

  if (type === "support") {
    // High support volume lowers health; low volume is mildly positive.
    return normalized >= 50 ? -magnitude : magnitude;
  }

  // Positive drivers: high value raises health, low value lowers it.
  return normalized >= 50 ? magnitude : -magnitude;
}

/** Format a score delta for display ("+2", "-5", or "0"). */
export function formatScoreDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }
  return `${delta}`;
}
