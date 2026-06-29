import { expect, test } from "@playwright/test";

import { gotoBoard, isApiPath } from "./fixtures";

test.describe("Health Board (focus worklist)", () => {
  test("lists troubled accounts and opens an account on click", async ({ page }) => {
    await gotoBoard(page);

    await expect(page.getByText(/need attention right now/)).toBeVisible();

    const reviewLinks = page.getByRole("link", { name: /^Review .+/ });
    await expect(reviewLinks.first()).toBeVisible();

    await reviewLinks.first().click();
    await expect(page).toHaveURL(/\/accounts\/.+/);
  });

  test("does not render the signals feed on the home page", async ({ page }) => {
    await gotoBoard(page);
    await expect(page.getByRole("heading", { name: "Live Signals" })).toHaveCount(0);
  });

  test("shows the all-clear state when nothing needs attention", async ({ page }) => {
    // Force an empty portfolio so the worklist resolves to the all-clear state.
    await page.route(isApiPath("/accounts"), (route) =>
      route.fulfill({ json: { data: [] } }),
    );
    await page.route(isApiPath("/scores"), (route) =>
      route.fulfill({ json: { data: [] } }),
    );

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "All clear" })).toBeVisible();
  });
});
