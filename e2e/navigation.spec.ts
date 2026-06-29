import { expect, test } from "@playwright/test";

import { KNOWN_ACCOUNT, NAV_ITEMS, gotoBoard } from "./fixtures";

test.describe("App shell and navigation", () => {
  test("sidebar links navigate and update the top-header title", async ({ page }) => {
    await gotoBoard(page);
    const sidebar = page.getByRole("complementary", { name: "Primary navigation" });

    for (const item of NAV_ITEMS) {
      // Some links append a badge (e.g. "Playbooks Soon"), so match by prefix.
      await sidebar.getByRole("link", { name: new RegExp(`^${item.name}`) }).click();
      await expect(page).toHaveURL(
        item.path === "/" ? "/" : new RegExp(`${item.path}$`),
      );
      await expect(
        page.getByRole("heading", { level: 1, name: item.title }),
      ).toBeVisible();
    }
  });

  test("collapses and expands the sidebar", async ({ page }) => {
    await gotoBoard(page);

    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();

    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  });

  test("theme toggle persists across reload", async ({ page }) => {
    await gotoBoard(page);

    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    await page.getByRole("button", { name: /Switch to (light|dark) mode/ }).click();

    const toggledTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(toggledTheme).not.toBe(initialTheme);

    await page.reload();
    const reloadedTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(reloadedTheme).toBe(toggledTheme);
  });

  test("account detail keeps Accounts highlighted in the sidebar", async ({ page }) => {
    await page.goto(`/accounts/${KNOWN_ACCOUNT.id}`);

    const accountsLink = page
      .getByRole("complementary", { name: "Primary navigation" })
      .getByRole("link", { name: "Accounts", exact: true });
    await expect(accountsLink).toHaveAttribute("aria-current", "page");
  });
});
