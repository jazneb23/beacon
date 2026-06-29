import { expect, test } from "@playwright/test";

import { KNOWN_ACCOUNT } from "./fixtures";

test.describe("Account detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/accounts/${KNOWN_ACCOUNT.id}`);
    await expect(
      page.getByRole("heading", { level: 1, name: `Account Detail — ${KNOWN_ACCOUNT.name}` }),
    ).toBeVisible();
  });

  test("renders breadcrumb, sections, and header actions", async ({ page }) => {
    await expect(
      page
        .getByRole("navigation", { name: "Breadcrumb" })
        .getByRole("link", { name: "Health Board" }),
    ).toHaveAttribute("href", "/");

    await expect(page.getByRole("heading", { name: "Score History" })).toBeVisible();
    await expect(page.getByTestId("score-history-chart")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Score Drivers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick Stats" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Insight" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent Signals" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Generate AI Summary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Draft Outreach", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Playbook" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
  });

  test("breadcrumb navigates back to the Health Board", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Health Board" })
      .click();
    await expect(page).toHaveURL("/");
  });

  test("Start Playbook shows the coming-soon toast", async ({ page }) => {
    await page.getByRole("button", { name: "Start Playbook" }).click();
    await expect(page.getByText("Playbooks are coming soon")).toBeVisible();
  });

  test("Export PDF shows the export toast", async ({ page }) => {
    await page.getByRole("button", { name: "Export PDF" }).click();
    await expect(page.getByText("Preparing PDF export...")).toBeVisible();
  });
});
