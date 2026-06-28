import { describe, expect, it } from "vitest";
import { computeScore, type SignalEvent } from "./index.js";

/** Build a dated event for a given account and signal type. */
function event(
  accountId: string,
  type: SignalEvent["type"],
  value: number,
  at: string,
): SignalEvent {
  return { accountId, type, value, at };
}

describe("computeScore", () => {
  it("scores a declining account as trending down", () => {
    const events: SignalEvent[] = [
      // Older period — healthy signals
      event("acct-down", "usage", 90, "2026-06-01T00:00:00Z"),
      event("acct-down", "login", 85, "2026-06-01T00:00:00Z"),
      event("acct-down", "billing", 95, "2026-06-01T00:00:00Z"),
      event("acct-down", "support", 10, "2026-06-01T00:00:00Z"),
      // Newer period — usage drops, support spikes
      event("acct-down", "usage", 30, "2026-06-15T00:00:00Z"),
      event("acct-down", "login", 25, "2026-06-15T00:00:00Z"),
      event("acct-down", "billing", 40, "2026-06-15T00:00:00Z"),
      event("acct-down", "support", 90, "2026-06-15T00:00:00Z"),
    ];

    const result = computeScore(events);

    expect(result.accountId).toBe("acct-down");
    expect(result.trend).toBe("down");
    expect(result.score).toBeLessThan(70);
    expect(result.drivers).toHaveLength(4);
  });

  it("scores an improving account as trending up", () => {
    const events: SignalEvent[] = [
      // Older period — weak engagement, heavy support load
      event("acct-up", "usage", 20, "2026-06-01T00:00:00Z"),
      event("acct-up", "login", 15, "2026-06-01T00:00:00Z"),
      event("acct-up", "billing", 30, "2026-06-01T00:00:00Z"),
      event("acct-up", "support", 85, "2026-06-01T00:00:00Z"),
      // Newer period — strong usage and fewer tickets (more events shift the average)
      event("acct-up", "usage", 95, "2026-06-15T00:00:00Z"),
      event("acct-up", "usage", 92, "2026-06-16T00:00:00Z"),
      event("acct-up", "login", 90, "2026-06-15T00:00:00Z"),
      event("acct-up", "login", 88, "2026-06-16T00:00:00Z"),
      event("acct-up", "billing", 92, "2026-06-15T00:00:00Z"),
      event("acct-up", "billing", 94, "2026-06-16T00:00:00Z"),
      event("acct-up", "support", 5, "2026-06-15T00:00:00Z"),
      event("acct-up", "support", 8, "2026-06-16T00:00:00Z"),
    ];

    const result = computeScore(events);

    expect(result.accountId).toBe("acct-up");
    expect(result.trend).toBe("up");
    expect(result.score).toBeGreaterThan(60);
    expect(result.drivers).toHaveLength(4);
  });
});
