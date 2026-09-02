import { ERROR_CODE } from "@habit-shaper/contracts";

import { AppError } from "#app/common/errors/app-error";
import { type GoalsRepository } from "../data/goals.repository";
import { GoalResponseDto } from "../dto/goal-response.dto";
import { GOAL_UPDATE_STATUS } from "../goal.types";
import { GoalsService } from "./goals.service";

const userId = "186b3c50-9a9e-4802-b167-bbbd71632d4a";
const habitId = "7f269562-bb36-4bd7-8f0d-173835568dbe";
const goalId = "58506433-c00f-4b75-8334-a427212c0673";

function storedGoal() {
  return {
    id: goalId,
    habit: { id: habitId, name: "Read", type: "build" as const },
    title: "Read consistently",
    description: null,
    created_at: new Date("2026-09-02T10:00:00.000Z"),
    updated_at: new Date("2026-09-02T10:00:00.000Z"),
  };
}

describe("GoalsService", () => {
  it("normalizes an omitted description and returns a class DTO", async () => {
    const repository = {
      createOwned: jest.fn().mockResolvedValue(storedGoal()),
    } as unknown as GoalsRepository;
    const service = new GoalsService(repository);

    const goal = await service.create(userId, {
      habit_id: habitId,
      title: "Read consistently",
    });

    expect(repository.createOwned).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        habitId,
        description: null,
      }),
    );
    expect(goal).toBeInstanceOf(GoalResponseDto);
  });

  it("hides a missing goal update behind the generic not-found error", async () => {
    const repository = {
      updateOwned: jest
        .fn()
        .mockResolvedValue({ status: GOAL_UPDATE_STATUS.GOAL_NOT_FOUND }),
    } as unknown as GoalsRepository;
    const service = new GoalsService(repository);

    await expect(
      service.update(userId, goalId, { habit_id: habitId }),
    ).rejects.toMatchObject<Partial<AppError>>({
      status: 404,
      code: ERROR_CODE.RESOURCE_NOT_FOUND,
    });
  });

  it("hides a missing linked habit behind the generic not-found error", async () => {
    const repository = {
      updateOwned: jest
        .fn()
        .mockResolvedValue({ status: GOAL_UPDATE_STATUS.HABIT_NOT_FOUND }),
    } as unknown as GoalsRepository;
    const service = new GoalsService(repository);

    await expect(
      service.update(userId, goalId, { habit_id: habitId }),
    ).rejects.toMatchObject<Partial<AppError>>({
      status: 404,
      code: ERROR_CODE.RESOURCE_NOT_FOUND,
    });
  });

  it("returns not found when an ownership-scoped delete changes nothing", async () => {
    const repository = {
      deleteOwned: jest.fn().mockResolvedValue(false),
    } as unknown as GoalsRepository;
    const service = new GoalsService(repository);

    await expect(service.delete(userId, goalId)).rejects.toMatchObject<
      Partial<AppError>
    >({ status: 404, code: ERROR_CODE.RESOURCE_NOT_FOUND });
  });
});
