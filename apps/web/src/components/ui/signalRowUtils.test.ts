import { describe, expect, it } from "vitest";

import { formatRelativeTime, getSignalDescription } from "./signalRowUtils";

const NOW = new Date("2026-06-28T12:00:30.000Z");

describe("formatRelativeTime", () => {
  it("formats seconds and minutes ago", () => {
    expect(
      formatRelativeTime("2026-06-28T12:00:28.000Z", NOW),
    ).toBe("2s ago");
    expect(
      formatRelativeTime("2026-06-28T11:59:30.000Z", NOW),
    ).toBe("1m ago");
  });

  it("formats hours and days ago", () => {
    expect(
      formatRelativeTime("2026-06-28T10:00:30.000Z", NOW),
    ).toBe("2h ago");
    expect(
      formatRelativeTime("2026-06-26T12:00:30.000Z", NOW),
    ).toBe("2d ago");
  });

  it("never returns negative offsets", () => {
    expect(
      formatRelativeTime("2026-06-28T12:01:00.000Z", NOW),
    ).toBe("0s ago");
  });
});

describe("getSignalDescription", () => {
  it("returns a brief label for each signal type", () => {
    expect(getSignalDescription("usage")).toBe("Usage drop");
    expect(getSignalDescription("support")).toBe("Support ticket");
    expect(getSignalDescription("billing")).toBe("Billing issue");
    expect(getSignalDescription("login")).toBe("Login activity");
  });
});
