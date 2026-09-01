import { type Pool } from "mysql2/promise";

import { HealthService } from "./health.service";

it("reports readiness after the database responds", async () => {
  const execute = jest.fn().mockResolvedValue([[], []]);
  const pool = { execute } as unknown as Pool;
  const service = new HealthService(pool);

  await expect(service.checkReadiness()).resolves.toEqual({
    status: "ok",
    database: "ready",
  });
  expect(execute).toHaveBeenCalledWith("SELECT 1");
});
