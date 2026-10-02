import { expect, test, type Page } from "@playwright/test";

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const path of ["/", "/?as=okafors", "/about", "/docs/plan-card"]) {
  test(`no horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await noHorizontalScroll(page);
  });
}

test("every step fits the viewport", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "That's my home address" }).click();
  await page.getByRole("button", { name: "Try plans on" }).click();
  await noHorizontalScroll(page);
  await page.getByRole("button", { name: "See plans that fit" }).click();
  await expect(page.getByRole("heading", { name: /plans, priced for your year/ })).toBeVisible();
  await noHorizontalScroll(page);
  await page.getByRole("button", { name: "Choose this plan" }).first().click();
  await noHorizontalScroll(page);
  await page.getByRole("button", { name: /^Enroll in / }).click();
  await expect(page.getByRole("heading", { name: /You're enrolled/ })).toBeVisible();
  await noHorizontalScroll(page);
});
