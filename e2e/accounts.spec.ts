import { expect, test } from "@playwright/test";

import { gotoAccounts, isApiPath } from "./fixtures";

test.describe("Accounts portfolio", () => {
  test("shows the portfolio subtitle and filter controls", async ({ page }) => {
    await gotoAccounts(page);

    await expect(page.getByText(/\d+ accounts? · \d+ at risk/)).toBeVisible();
    await expect(page.getByRole("group", { name: "Filter accounts" })).toBeVisible();
  });

  test("filters the portfolio by band", async ({ page }) => {
    await gotoAccounts(page);
    const filters = page.getByRole("group", { name: "Filter accounts" });

    await filters.getByRole("button", { name: "At Risk" }).click();
    await expect(filters.getByRole("button", { name: "At Risk" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await filters.getByRole("button", { name: "Healthy" }).click();
    await expect(filters.getByRole("button", { name: "Healthy" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("changes sort order via the sort dropdown", async ({ page }) => {
    await gotoAccounts(page);

    const sortButton = page.getByRole("button", { name: /Sort by:/ });
    await sortButton.click();
    await page.getByRole("option", { name: "Name" }).click();
    await expect(page.getByRole("button", { name: /Sort by: Name/ })).toBeVisible();
  });

  test("switches between grid and list views and opens an account", async ({ page }) => {
    await gotoAccounts(page);

    // Grid view exposes accounts as links.
    await page.getByRole("button", { name: "Grid view" }).click();
    const card = page.getByRole("link", { name: /View .+ account details/ }).first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/accounts\/.+/);

    // List view renders accounts as clickable table rows.
    await gotoAccounts(page);
    await page.getByRole("button", { name: "List view" }).click();
    await expect(page.getByRole("columnheader", { name: "Account" })).toBeVisible();
    const row = page.getByRole("row").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/accounts\/.+/);
  });

  test("pre-selects the at-risk filter from the query string", async ({ page }) => {
    await gotoAccounts(page, "?filter=at-risk");
    await expect(
      page
        .getByRole("group", { name: "Filter accounts" })
        .getByRole("button", { name: "At Risk" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("shows an empty state when a filter matches nothing", async ({ page }) => {
    // Return only a healthy account so the At Risk filter yields no matches.
    await page.route(isApiPath("/accounts"), (route) =>
      route.fulfill({
        json: {
          data: [
            {
              id: "acct-healthy",
              name: "Evergreen Co",
              plan: "pro",
              latestScore: {
                accountId: "acct-healthy",
                score: 88,
                trend: "up",
                drivers: [],
                updatedAt: "2026-06-28T12:00:00.000Z",
              },
            },
          ],
        },
      }),
    );
    await page.route(isApiPath("/scores"), (route) =>
      route.fulfill({
        json: {
          data: [
            {
              accountId: "acct-healthy",
              score: 88,
              trend: "up",
              drivers: [],
              updatedAt: "2026-06-28T12:00:00.000Z",
            },
          ],
        },
      }),
    );

    await page.goto("/accounts?filter=at-risk");
    await expect(
      page.getByRole("heading", { name: "No accounts match this filter" }),
    ).toBeVisible();
  });

  test("shows a retry affordance when the API fails", async ({ page }) => {
    await page.route(isApiPath("/accounts"), (route) =>
      route.fulfill({ status: 500, json: { error: "boom" } }),
    );

    await page.goto("/accounts");
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});
