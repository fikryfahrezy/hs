import { expect, test } from "@playwright/test";

test("creates, edits, reassigns, and deletes a goal", async ({ page }) => {
  const email = `e2e-goals-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with one honest habit" }),
  ).toBeVisible();

  const habitName = page.getByLabel("Name", { exact: true });
  await habitName.fill("Read");
  await page.getByRole("button", { name: "Add habit" }).click();
  await expect(page.getByRole("heading", { name: "Read" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Read" })).toBeVisible();
  await habitName.fill("Doomscrolling");
  await page.getByLabel("Type").selectOption("break");
  await page.getByRole("button", { name: "Add habit" }).click();
  await expect(
    page.getByRole("heading", { name: "Doomscrolling" }),
  ).toBeVisible();

  await page.getByLabel("Title").fill("Read consistently");
  await page.locator("#goal-habit").selectOption({ label: "Read (build)" });
  await page
    .getByLabel("Description (optional)")
    .fill("Ten pages after breakfast.");
  await page.getByRole("button", { name: "Add goal" }).click();
  await expect(
    page.getByRole("heading", { name: "Read consistently" }),
  ).toBeVisible();

  const goals = page.locator("#goals");
  await goals.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Title").fill("Stay present");
  await page
    .locator("#goal-habit")
    .selectOption({ label: "Doomscrolling (break)" });
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(
    page.getByRole("heading", { name: "Stay present" }),
  ).toBeVisible();
  await expect(goals.getByText("Doomscrolling · break")).toBeVisible();

  await goals.getByRole("button", { name: "Delete" }).click();
  await goals.getByRole("button", { name: "Confirm delete" }).click();
  await expect(
    page.getByRole("heading", { name: "Stay present" }),
  ).not.toBeVisible();
});
