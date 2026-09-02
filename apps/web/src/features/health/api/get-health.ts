import {
  HealthResponseSchema,
  type HealthResponse,
} from "@habit-shaper/contracts";

import { requestJson } from "#app/lib/api-client";

export async function getHealth(): Promise<HealthResponse> {
  const response = await requestJson("/api/health");

  return HealthResponseSchema.parse(response);
}
