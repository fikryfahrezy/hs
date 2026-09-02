import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from "@habit-shaper/contracts";

import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from "../api/goals-api";

export const goalQueryKeys = { all: ["goals"] as const };

export function useGoalsQuery() {
  return useQuery({ queryKey: goalQueryKeys.all, queryFn: listGoals });
}

export function useCreateGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalRequest) => createGoal(input),
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}

export function useUpdateGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: { id: string; input: UpdateGoalRequest }) =>
      updateGoal(request.id, request.input),
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}

export function useDeleteGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}
