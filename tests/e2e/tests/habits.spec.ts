import { expect, test } from "@playwright/test";

test("tracks a build completion and a break-habit relapse on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const email = `e2e-tracking-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with one honest habit" }),
  ).toBeVisible();

  const habitName = page.getByLabel("Name", { exact: true });
  await habitName.fill("Walk outside");
  await page.getByRole("button", { name: "Add habit" }).click();
  const buildCard = page
    .getByRole("heading", { name: "Walk outside" })
    .locator("..")
    .locator("..");
  const pendingDay = buildCard.getByRole("button", { name: /: pending$/ });
  const completedDate = (await pendingDay.getAttribute("aria-label"))?.split(
    ":",
  )[0];
  await pendingDay.click();
  await expect(
    buildCard.getByRole("button", {
      name: `${completedDate}: completed`,
    }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Walk outside" }),
  ).toBeVisible();
  await habitName.fill("Late-night scrolling");
  await page.getByLabel("Type").selectOption("break");
  await page.getByRole("button", { name: "Add habit" }).click();
  const breakCard = page
    .getByRole("heading", { name: "Late-night scrolling" })
    .locator("..")
    .locator("..");
  await expect(breakCard.getByText("1 clean days")).toBeVisible();
  await breakCard.getByRole("button", { name: "Record relapse" }).click();
  await expect(
    breakCard.getByText("A setback is information, not failure."),
  ).toBeVisible();
  await breakCard.getByRole("button", { name: "Cancel" }).click();
  await expect(
    breakCard.getByText("A setback is information, not failure."),
  ).not.toBeVisible();
  await breakCard.getByRole("button", { name: "Record relapse" }).click();
  await breakCard
    .getByRole("button", { name: "Record relapse" })
    .last()
    .click();
  await expect(breakCard.getByText("0 clean days")).toBeVisible();

  const pageWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});
