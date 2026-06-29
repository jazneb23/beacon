import { expect, type Page } from "@playwright/test";

// A stable seeded account used for deep links and detail-page assertions.
export const KNOWN_ACCOUNT = {
  id: "acct-northwind",
  name: "Northwind Analytics",
} as const;

// Sidebar nav entries: accessible link name -> expected pathname + header title.
export const NAV_ITEMS = [
  { name: "Health Board", path: "/", title: "Health Board" },
  { name: "Accounts", path: "/accounts", title: "Accounts" },
  { name: "Signals", path: "/signals", title: "Signals" },
  { name: "Playbooks", path: "/playbooks", title: "Playbooks" },
  { name: "Reports", path: "/reports", title: "Reports" },
  { name: "Alerts", path: "/alerts", title: "Alerts" },
  { name: "Settings", path: "/settings", title: "Settings" },
  { name: "Help", path: "/help", title: "Help" },
] as const;

/** Open the Health Board and wait until the worklist finishes loading. */
export async function gotoBoard(page: Page): Promise<void> {
  await page.goto("/");
  await expect(
    page.getByText(/need attention right now|All clear/),
  ).toBeVisible();
}

/** Open the portfolio board and wait for its account-count subtitle. */
export async function gotoAccounts(page: Page, query = ""): Promise<void> {
  await page.goto(`/accounts${query}`);
  await expect(page.getByText(/\d+ accounts? · \d+ at risk/)).toBeVisible();
}

/** Predicate matching a Beacon API request (port 3001) by exact pathname. */
export function isApiPath(pathname: string): (url: URL) => boolean {
  return (url) => url.port === "3001" && url.pathname === pathname;
}

/** Open the global command palette via the keyboard shortcut. */
export async function openCommandPalette(page: Page): Promise<void> {
  const modifier = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+k`);
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
}
