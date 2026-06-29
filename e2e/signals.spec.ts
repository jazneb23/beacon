import { expect, test } from "@playwright/test";

test.describe("Signals feed", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signals");
  });

  test("shows the page header and live feed", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Signals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live Signals" })).toBeVisible();
    await expect(page.getByText("LIVE", { exact: true })).toBeVisible();
  });

  test("renders signal rows with account links", async ({ page }) => {
    const feed = page.getByRole("complementary", { name: "Live Signals" });
    const accountLink = feed.getByRole("link").first();
    await expect(accountLink).toBeVisible();

    await accountLink.click();
    await expect(page).toHaveURL(/\/accounts\/.+/);
  });
});
