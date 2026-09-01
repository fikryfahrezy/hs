import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CalendarDateSchema,
  CreateHabitRequestSchema,
  IdentifierSchema,
  ListHabitsQuerySchema,
} from "@habit-shaper/contracts";

import { parseSchema } from "../../../../common/validation/parse-schema";
import { AuthGuard } from "../../../auth/transport/rest/auth.guard";
import { CurrentUserId } from "../../../auth/transport/rest/current-user-id";
import { HabitsService } from "../../application/habits.service";
import { type HabitResponseDto } from "../../dto/habit-response.dto";

@Controller("habits")
@UseGuards(AuthGuard)
export class HabitsController {
  public constructor(private readonly habits: HabitsService) {}

  @Get()
  public async list(
    @CurrentUserId() userId: string,
    @Query() query: unknown,
  ): Promise<HabitResponseDto[]> {
    const parsed = parseSchema(ListHabitsQuerySchema, query);
    return this.habits.list(userId, parsed.week_start);
  }

  @Post()
  public async create(
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ): Promise<HabitResponseDto> {
    return this.habits.create(
      userId,
      parseSchema(CreateHabitRequestSchema, body),
    );
  }

  @Delete(":habit_id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentUserId() userId: string,
    @Param("habit_id") id: string,
  ): Promise<void> {
    await this.habits.delete(userId, parseSchema(IdentifierSchema, id));
  }

  @Put(":habit_id/completions/:date")
  public completion(
    @CurrentUserId() userId: string,
    @Param("habit_id") id: string,
    @Param("date") date: string,
  ): Promise<HabitResponseDto> {
    return this.habits.setCompletion(
      userId,
      parseSchema(IdentifierSchema, id),
      parseSchema(CalendarDateSchema, date),
      true,
    );
  }

  @Delete(":habit_id/completions/:date")
  public correction(
    @CurrentUserId() userId: string,
    @Param("habit_id") id: string,
    @Param("date") date: string,
  ): Promise<HabitResponseDto> {
    return this.habits.setCompletion(
      userId,
      parseSchema(IdentifierSchema, id),
      parseSchema(CalendarDateSchema, date),
      false,
    );
  }
}
