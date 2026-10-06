import { ERROR_CODE } from "@habit-shaper/contracts";

import { AppError } from "#app/common/errors/app-error";
import { type AuthService } from "#app/features/auth/application/auth.service";
import { type HabitsRepository } from "../data/habits.repository";
import {
  BreakHabitResponseDto,
  BuildHabitResponseDto,
} from "../dto/habit-response.dto";
import { HabitsService } from "./habits.service";

const userId = "186b3c50-9a9e-4802-b167-bbbd71632d4a";

function authenticatedUser(): AuthService {
  return {
    getTimezone: jest.fn().mockResolvedValue("Asia/Jakarta"),
  } as unknown as AuthService;
}

describe("HabitsService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-02T17:30:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(["build", "break"] as const)(
    "uses the stored timezone and serializes a created %s habit as a class DTO",
    async (type) => {
      const repository = {
        create: jest.fn().mockImplementation((input) => ({
          id: input.id,
          name: input.name,
          type: input.type,
          start_date: new Date(`${input.start_date}T00:00:00.000Z`),
          created_at: new Date("2026-09-02T17:30:00.000Z"),
          updated_at: new Date("2026-09-02T17:30:00.000Z"),
        })),
      } as unknown as HabitsRepository;
      const service = new HabitsService(repository, authenticatedUser());

      const habit = await service.create(userId, {
        name: "Meditate",
        type,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          name: "Meditate",
          type,
          start_date: "2026-09-03",
        }),
      );
      expect(habit).toBeInstanceOf(
        type === "build" ? BuildHabitResponseDto : BreakHabitResponseDto,
      );
      expect(habit.start_date).toBe("2026-09-03");
      if (habit instanceof BreakHabitResponseDto) {
        expect(habit.tracking.current_clean_streak).toBe(1);
        expect(habit.tracking.last_relapse_date).toBeNull();
      }
    },
  );

  it("rejects a future week before loading habits", async () => {
    const repository = {
      list: jest.fn(),
    } as unknown as HabitsRepository;
    const service = new HabitsService(repository, authenticatedUser());

    await expect(service.list(userId, "2026-09-07")).rejects.toMatchObject<
      Partial<AppError>
    >({
      status: 400,
      code: ERROR_CODE.VALIDATION_ERROR,
    });
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("returns the shared not-found error when an owned delete changes nothing", async () => {
    const repository = {
      delete: jest.fn().mockResolvedValue(false),
    } as unknown as HabitsRepository;
    const service = new HabitsService(repository, authenticatedUser());

    await expect(service.delete(userId, userId)).rejects.toMatchObject<
      Partial<AppError>
    >({
      status: 404,
      code: ERROR_CODE.RESOURCE_NOT_FOUND,
    });
  });
});
