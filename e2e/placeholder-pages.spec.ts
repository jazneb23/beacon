import { expect, test } from "@playwright/test";

// Placeholder routes: path -> an expected heading rendered on the page.
const PLACEHOLDER_PAGES = [
  { path: "/playbooks", heading: "Automate customer success playbooks" },
  { path: "/reports", heading: "Reports are coming soon" },
  { path: "/alerts", heading: "No alerts configured" },
  { path: "/help", heading: "Need a hand?" },
] as const;

test.describe("Placeholder pages", () => {
  for (const placeholder of PLACEHOLDER_PAGES) {
    test(`renders the empty state for ${placeholder.path}`, async ({ page }) => {
      await page.goto(placeholder.path);
      await expect(
        page.getByRole("heading", { name: placeholder.heading }),
      ).toBeVisible();
    });
  }

  test("settings shows profile, workspace, and appearance cards", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Workspace" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  });
});
