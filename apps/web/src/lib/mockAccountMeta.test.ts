import { describe, expect, it } from "vitest";

import {
  getAccountOwner,
  getCustomerSince,
  getDaysSinceLogin,
  getOpenTickets,
  getWeeklySignalCount,
} from "./mockAccountMeta";

describe("mockAccountMeta", () => {
  it("is deterministic for the same id", () => {
    expect(getAccountOwner("acct-x")).toBe(getAccountOwner("acct-x"));
    expect(getCustomerSince("acct-x")).toBe(getCustomerSince("acct-x"));
    expect(getOpenTickets("acct-x")).toBe(getOpenTickets("acct-x"));
    expect(getDaysSinceLogin("acct-x")).toBe(getDaysSinceLogin("acct-x"));
    expect(getWeeklySignalCount("acct-x")).toBe(getWeeklySignalCount("acct-x"));
  });

  it("keeps mock values within expected ranges", () => {
    for (const id of ["a", "b", "acct-northwind", "acct-brightpath", "zzz"]) {
      expect(getOpenTickets(id)).toBeGreaterThanOrEqual(0);
      expect(getOpenTickets(id)).toBeLessThanOrEqual(4);
      expect(getDaysSinceLogin(id)).toBeGreaterThanOrEqual(1);
      expect(getDaysSinceLogin(id)).toBeLessThanOrEqual(14);
      expect(getWeeklySignalCount(id)).toBeGreaterThanOrEqual(4);
      expect(getWeeklySignalCount(id)).toBeLessThanOrEqual(24);
    }
  });
});
