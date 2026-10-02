import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function audit(page: Page) {
  // Let enter animations finish; axe measures colour mid-fade otherwise.
  await page.waitForTimeout(600);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

async function toPlans(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "That's my home address" }).click();
  await page.getByRole("button", { name: "Try plans on" }).click();
  await page.getByRole("button", { name: "See plans that fit" }).click();
  await expect(page.getByRole("heading", { name: /plans, priced for your year/ })).toBeVisible();
}

test("budget step has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await audit(page);
});

test("plans step has no serious accessibility violations", async ({ page }) => {
  await toPlans(page);
  await audit(page);
});

test("compare dialog has no serious accessibility violations", async ({ page }) => {
  await toPlans(page);
  const compareButtons = page.getByRole("button", { name: "Compare", exact: true });
  await compareButtons.nth(0).click();
  await compareButtons.nth(0).click();
  await page.getByRole("button", { name: /Compare these two/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await audit(page);
});

test("enrolled step has no serious accessibility violations", async ({ page }) => {
  await toPlans(page);
  await page.getByRole("button", { name: "Choose this plan" }).first().click();
  await page.getByRole("button", { name: /^Enroll in / }).click();
  await expect(page.getByRole("heading", { name: /You're enrolled/ })).toBeVisible();
  await audit(page);
});

test("case study and spec have no serious accessibility violations", async ({ page }) => {
  await page.goto("/about");
  await audit(page);
  await page.goto("/docs/plan-card");
  await audit(page);
});

test("works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toPlans(page);
  await page.getByRole("button", { name: "Choose this plan" }).first().click();
  await expect(page.getByRole("heading", { name: /yours for care/ })).toBeVisible();
});

test("the whole flow is operable by keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "That's my home address" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Try plans on" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "See plans that fit" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /plans, priced for your year/ })).toBeVisible();
  // Focusing a plan previews it in the ledger, like hover does.
  const cards = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Choose this plan" }) });
  await cards.nth(1).getByRole("button", { name: "Choose this plan" }).focus();
  await expect(page.getByRole("region", { name: "Your budget with this plan" })).toContainText("Previewing");
});
