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
  return useQuery({
    queryKey: goalQueryKeys.all,
    queryFn: ({ signal }) => listGoals({ signal }),
  });
}

type CreateGoalMutationParams = {
  input: CreateGoalRequest;
};

export function useCreateGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateGoalMutationParams) => createGoal(params),
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}

type UpdateGoalMutationParams = {
  id: string;
  input: UpdateGoalRequest;
};

export function useUpdateGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateGoalMutationParams) => updateGoal(params),
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}

type DeleteGoalMutationParams = {
  id: string;
};

export function useDeleteGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: DeleteGoalMutationParams) => deleteGoal(params),
    onSuccess: () => client.invalidateQueries({ queryKey: goalQueryKeys.all }),
  });
}
