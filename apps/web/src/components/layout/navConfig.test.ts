import { describe, expect, it } from "vitest";

import { ALL_NAV_ITEMS, getPageTitle, isNavItemActive } from "./navConfig";

const accounts = ALL_NAV_ITEMS.find((item) => item.href === "/accounts");
const board = ALL_NAV_ITEMS.find((item) => item.href === "/");

describe("navConfig", () => {
  it("matches the home route only on exact path", () => {
    expect(board && isNavItemActive(board, "/")).toBe(true);
    expect(board && isNavItemActive(board, "/accounts")).toBe(false);
  });

  it("matches a section on nested routes", () => {
    expect(accounts && isNavItemActive(accounts, "/accounts")).toBe(true);
    expect(accounts && isNavItemActive(accounts, "/accounts/acct-1")).toBe(true);
    expect(accounts && isNavItemActive(accounts, "/signals")).toBe(false);
  });

  it("resolves page titles from the nav config", () => {
    expect(getPageTitle("/")).toBe("Health Board");
    expect(getPageTitle("/accounts/acct-1")).toBe("Accounts");
    expect(getPageTitle("/settings")).toBe("Settings");
  });
});
