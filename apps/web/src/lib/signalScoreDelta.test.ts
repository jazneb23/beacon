import { describe, expect, it } from "vitest";

import { formatScoreDelta, getSignalScoreDelta } from "./signalScoreDelta";

describe("getSignalScoreDelta", () => {
  it("treats high usage/login/billing values as positive", () => {
    expect(getSignalScoreDelta("usage", 100)).toBeGreaterThan(0);
    expect(getSignalScoreDelta("login", 90)).toBeGreaterThan(0);
  });

  it("treats low positive-driver values as negative", () => {
    expect(getSignalScoreDelta("usage", 0)).toBeLessThan(0);
  });

  it("inverts support: high volume is negative", () => {
    expect(getSignalScoreDelta("support", 100)).toBeLessThan(0);
    expect(getSignalScoreDelta("support", 0)).toBeGreaterThan(0);
  });

  it("is near zero at the midpoint", () => {
    expect(getSignalScoreDelta("usage", 50)).toBe(0);
  });
});

describe("formatScoreDelta", () => {
  it("prefixes positive values with a plus sign", () => {
    expect(formatScoreDelta(3)).toBe("+3");
    expect(formatScoreDelta(-5)).toBe("-5");
    expect(formatScoreDelta(0)).toBe("0");
  });
});
