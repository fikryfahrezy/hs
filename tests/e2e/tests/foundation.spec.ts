import { expect, test } from "@playwright/test";

test("serves the application and API through the same origin", async ({
  page,
  request,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Sign in",
    }),
  ).toBeVisible();

  const healthResponse = await request.get("/api/health");

  expect(healthResponse.ok()).toBe(true);
  await expect(healthResponse.json()).resolves.toEqual({
    status: "ok",
    database: "ready",
  });
});

test("registers, restores the session, logs out, and logs in", async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "correct horse battery staple";

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Your daily shape" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByText(email)).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(email)).toBeVisible();
});
