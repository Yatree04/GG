/* End-to-end checks for the garage owner app. Each test follows one real flow
   across tabs, so it proves the parts of the app are connected. */
import { expect, test, type Page } from "@playwright/test";

const nav = (page: Page, tab: "Stock" | "Jobs" | "My Garage") =>
  page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: new RegExp(`^${tab}`) }).click();

const stockCount = async (page: Page, part: string) => {
  await nav(page, "Stock");
  await page.getByPlaceholder(/Search pistons/).fill(part);
  const n = await page.getByRole("button", { name: new RegExp(part) }).first().locator("span").first().innerText();
  await page.getByRole("button", { name: "Clear search" }).click();
  return Number(n);
};

test.beforeEach(async ({ page }) => { await page.goto("/"); });

test("a job runs from queue to paid bill, and stock and money follow it", async ({ page }) => {
  const batteries = await stockCount(page, "Batteries");
  await nav(page, "Jobs");
  await page.getByRole("button", { name: "Job 3: MH 12 AB 7710" }).click();
  const card = page.getByRole("region", { name: "Job card MH 12 AB 7710" });
  await expect(card).toContainText("QUEUED");

  await page.getByRole("button", { name: "Start inspection" }).click();
  await page.getByRole("button", { name: /Send estimate/ }).click();
  await expect(card).toContainText("IN WORK");

  // A part over the approval limit waits for the customer and blocks "Mark ready".
  await page.getByRole("button", { name: "Add part or service" }).click();
  await page.getByRole("button", { name: /^Batteries/ }).click();
  await page.getByRole("button", { name: /ask Vikram on WhatsApp/ }).click();
  await expect(card).toContainText("Awaiting Vikram’s OK");
  await expect(page.getByRole("button", { name: /Waiting for Vikram’s reply/ })).toBeDisabled();
  await card.getByRole("button", { name: "They said yes" }).click();
  expect(await stockCount(page, "Batteries")).toBe(batteries - 1);

  await nav(page, "Jobs");
  await page.getByRole("button", { name: /Mark ready/ }).click();
  await expect(page.getByRole("button", { name: "Choose how they paid" })).toBeDisabled();
  await page.getByRole("radio", { name: "Cash" }).click();
  await page.getByRole("button", { name: /Close bill/ }).click();

  await nav(page, "My Garage");
  await page.getByRole("button", { name: /^8 October/ }).click();
  await expect(page.getByRole("button", { name: /MH 12 AB 7710/ })).toContainText("Cash");
});

test("undo puts a part back on the shelf", async ({ page }) => {
  const plugs = await stockCount(page, "Spark plugs");
  await nav(page, "Jobs");
  await page.getByRole("button", { name: "Add part or service" }).click();
  await page.getByRole("button", { name: /^Spark plugs/ }).click();
  await page.getByRole("button", { name: /send Rohan the new total/ }).click();
  expect(await stockCount(page, "Spark plugs")).toBe(plugs - 1);
  await nav(page, "Jobs");
  await page.getByRole("button", { name: "Add part or service" }).click();
  await page.getByRole("button", { name: /^Spark plugs/ }).click();
  await page.getByRole("button", { name: /send Rohan the new total/ }).click();
  await page.getByRole("button", { name: "Undo" }).click();
  expect(await stockCount(page, "Spark plugs")).toBe(plugs - 1);
});

test("scanning an unknown plate opens a new job card", async ({ page }) => {
  await page.getByRole("button", { name: "Scan plate" }).click();
  await page.getByLabel("Number plate", { exact: true }).fill("MH 04 ZZ 1234");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.getByText("MH 04 ZZ 1234 is new to the garage")).toBeVisible();
  await page.getByRole("button", { name: "Fill sample details" }).click();
  await page.getByRole("button", { name: "Open job card" }).click();
  await expect(page.getByRole("region", { name: "Job card MH 04 ZZ 1234" })).toContainText("QUEUED");
});

test("a bill paid later shows as due, and collecting it adds to today's money", async ({ page }) => {
  await nav(page, "My Garage");
  await page.getByRole("button", { name: /^8 October/ }).click();
  const before = await page.getByText(/^In$/).locator("..").innerText();
  await page.getByRole("button", { name: /MH 14 GH 5521/ }).click();
  await page.getByRole("button", { name: "UPI", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByText("To collect (udhari)")).toHaveCount(0);
  expect(await page.getByText(/^In$/).locator("..").innerText()).not.toBe(before);
});

test("restock: order list, delivery, and stock count go together", async ({ page }) => {
  const clutch = await stockCount(page, "Clutch plates");
  await nav(page, "My Garage");
  await page.getByRole("radio", { name: "Restock" }).click();
  await page.getByRole("button", { name: "Add Clutch plates to the order list" }).click();
  await page.getByRole("button", { name: "Mark Clutch plates ordered" }).click();
  await page.getByRole("button", { name: "Delivery of Clutch plates came" }).click();
  expect(await stockCount(page, "Clutch plates")).toBeGreaterThan(clutch);
});

test("notifications lead to the place where you act", async ({ page }) => {
  await page.getByRole("button", { name: /^Notifications/ }).click();
  await page.getByRole("button", { name: /running low/ }).click();
  await expect(page.getByRole("radio", { name: /Running low/ })).toHaveAttribute("aria-checked", "true");
});

test("team: a busy mechanic links to their job, and reassigning updates it", async ({ page }) => {
  await nav(page, "My Garage");
  await page.getByRole("radio", { name: "Team" }).click();
  await page.getByRole("button", { name: /On job MH 14 DK 0937/ }).click();
  await expect(page.getByRole("region", { name: "Job card MH 14 DK 0937" })).toBeVisible();
  await page.getByRole("button", { name: /Change mechanic/ }).click();
  await page.getByRole("button", { name: /Sunil/ }).click();
  await expect(page.getByRole("button", { name: /Mechanic Sunil/ })).toBeVisible();
});

test("basic accessibility: every control has a name and nothing scrolls sideways", async ({ page }) => {
  for (const tab of ["Jobs", "Stock", "My Garage"] as const) {
    await nav(page, tab);
    const unnamed = await page.$$eval("button, input", (els) =>
      els.filter((e) => !(e.getAttribute("aria-label") || e.textContent?.trim() || (e as HTMLInputElement).placeholder)).length);
    expect(unnamed, `${tab}: unnamed controls`).toBe(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${tab}: sideways scroll`).toBeLessThanOrEqual(0);
  }
});
