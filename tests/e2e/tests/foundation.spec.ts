import { expect, test } from "@playwright/test";

test("serves the application and API through the same origin", async ({
  page,
  request,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Build what helps. Break what holds you back.",
    }),
  ).toBeVisible();

  const healthResponse = await request.get("/api/health");

  expect(healthResponse.ok()).toBe(true);
  await expect(healthResponse.json()).resolves.toEqual({
    status: "ok",
    database: "ready",
  });
});
