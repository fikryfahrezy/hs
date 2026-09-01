import {
  HealthResponseSchema,
  type HealthResponse,
} from "@habit-shaper/contracts";
import { Controller, Get } from "@nestjs/common";

import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  @Get()
  public async getHealth(): Promise<HealthResponse> {
    const health = await this.healthService.checkReadiness();

    return HealthResponseSchema.parse(health);
  }
}
