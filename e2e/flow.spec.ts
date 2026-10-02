import { expect, test, type Page } from "@playwright/test";

async function toPlans(page: Page, as = "") {
  await page.goto(as ? `/?as=${as}` : "/");
  await page.getByRole("button", { name: "That's my home address" }).click();
  await page.getByRole("button", { name: "Try plans on" }).click();
  await expect(page.getByRole("heading", { name: /Try it on/ })).toBeVisible();
  await page.getByRole("button", { name: "See plans that fit" }).click();
  await expect(page.getByRole("heading", { name: /plans, priced for your year/ })).toBeVisible();
}

test("the budget step confirms the address before continuing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Maya, your employer gives you \$550/ })).toBeVisible();
  const next = page.getByRole("button", { name: "Try plans on" });
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "That's my home address" }).click();
  await expect(page.getByRole("status")).toContainText("Address confirmed");
  await expect(next).toBeEnabled();
});

test("ranks by estimated year by default and the best fit is not the cheapest premium", async ({ page }) => {
  await toPlans(page);
  const cards = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Choose this plan" }) });
  await expect(cards.first()).toContainText("Best fit for your year");
  await expect(cards.first()).toContainText("Oscar Silver Classic");
  // Sorting by premium puts a Bronze plan first and shows the warning.
  await page.getByText("Lowest monthly", { exact: true }).click();
  await expect(cards.first()).toContainText("Bronze");
  await expect(page.getByRole("note")).toContainText("Lowest monthly isn't lowest cost");
});

test("the ledger previews the hovered plan", async ({ page }) => {
  await toPlans(page);
  const ledger = page.getByRole("region", { name: "Your budget with this plan" });
  await expect(ledger).toContainText("Best fit for your year");
  await expect(ledger).toContainText("Oscar Silver Classic");
  const cards = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Choose this plan" }) });
  await cards.nth(1).hover();
  await expect(ledger).toContainText("Previewing");
  await expect(ledger).toContainText("Oscar Gold Classic");
});

test("changing the likely year re-prices and re-ranks", async ({ page }) => {
  await toPlans(page);
  await page.getByRole("button", { name: "Change that" }).click();
  await page.getByRole("checkbox", { name: /Therapy most weeks/ }).click();
  await page.getByRole("button", { name: "See plans that fit" }).click();
  await expect(page.getByText(/Assuming the usual, monthly prescriptions\./)).toBeVisible();
});

test("compare shows two plans with the arithmetic, and choosing continues", async ({ page }) => {
  await toPlans(page);
  const compareButtons = page.getByRole("button", { name: "Compare", exact: true });
  await compareButtons.nth(0).click();
  await compareButtons.nth(0).click(); // the next un-pressed one
  await expect(page.getByRole("button", { name: /Compare these two/ })).toBeEnabled();
  await page.getByRole("button", { name: /Compare these two/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Same year, two plans.");
  await expect(dialog).toContainText("Premiums × 12");
  await dialog.getByRole("button", { name: /^Choose / }).first().click();
  await expect(page.getByRole("heading", { name: /a month is yours for care|covers the premium exactly|more than your budget/ })).toBeVisible();
});

test("the full flow ends with a coverage timeline and an enrollment confirmation", async ({ page }) => {
  await toPlans(page);
  await page.getByRole("button", { name: "Choose this plan" }).first().click();
  await expect(page.getByRole("heading", { name: /\$88 a month is yours for care/ })).toBeVisible();
  // Market suggestion sized to what's left.
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await expect(page.getByText("Still unspent each month")).toBeVisible();
  await page.getByRole("button", { name: /^Enroll in / }).click();
  await expect(page.getByRole("heading", { name: /You're enrolled/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "Coverage timeline" })).toContainText("Carrier is processing");
  await expect(page.getByText("Enrollment confirmation")).toBeVisible();
  await expect(page.getByText("Pending from carrier")).toBeVisible();
});

test("a plan over budget says so plainly (Dennis)", async ({ page }) => {
  await toPlans(page, "dennis");
  const ledger = page.getByRole("region", { name: "Your budget with this plan" });
  await expect(ledger).toContainText("From your paycheck");
  await page.getByRole("button", { name: "Choose this plan" }).first().click();
  await expect(page.getByRole("heading", { name: /more than your budget/ })).toBeVisible();
});

test("out-of-network doctors and uncovered drugs are called out (Okafors)", async ({ page }) => {
  await toPlans(page, "okafors");
  await expect(page.getByText(/out of network/).first()).toBeVisible();
  await expect(page.getByText(/not covered, full price/).first()).toBeVisible();
  await expect(page.getByText(/would be full price on this plan/).first()).toBeVisible();
});

test("switching household resets the flow", async ({ page }) => {
  await toPlans(page);
  await page.getByRole("radio", { name: "Dennis" }).click();
  await expect(page.getByRole("heading", { name: /Dennis, your employer gives you \$1,100/ })).toBeVisible();
  await expect(page).toHaveURL(/as=dennis/);
});
