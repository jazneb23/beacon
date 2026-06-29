import { expect, test } from "@playwright/test";

import { KNOWN_ACCOUNT, gotoAccounts, openCommandPalette } from "./fixtures";

test.describe("Command palette", () => {
  test("opens with grouped commands and account results", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog.getByText("Actions")).toBeVisible();
    await expect(dialog.getByText("Navigation")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Go to Health Board" })).toBeVisible();

    // Account results surface once the query matches a seeded account name.
    await page.getByLabel("Command palette search").fill(KNOWN_ACCOUNT.name);
    await expect(dialog.getByRole("button", { name: KNOWN_ACCOUNT.name })).toBeVisible();
  });

  test("navigates to the Health Board action", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    await page.getByRole("button", { name: "Go to Health Board" }).click();
    await expect(page).toHaveURL("/");
  });

  test("navigates to at-risk accounts", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    await page.getByRole("button", { name: "View At-Risk Accounts" }).click();
    await expect(page).toHaveURL(/\/accounts\?filter=at-risk/);
  });

  test("filters commands and fires the export toast", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    await page.getByLabel("Command palette search").fill("export");
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to Health Board" })).toHaveCount(0);

    await page.getByRole("button", { name: "Export CSV" }).click();
    await expect(page.getByText("Preparing CSV export...")).toBeVisible();
  });

  test("searches for an account and opens it", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    await page.getByLabel("Command palette search").fill(KNOWN_ACCOUNT.name);
    await page.getByRole("button", { name: KNOWN_ACCOUNT.name }).click();
    await expect(page).toHaveURL(`/accounts/${KNOWN_ACCOUNT.id}`);
  });

  test("closes on Escape", async ({ page }) => {
    await gotoAccounts(page);
    await openCommandPalette(page);

    await page.getByLabel("Command palette search").press("Escape");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toHaveCount(0);
  });
});
