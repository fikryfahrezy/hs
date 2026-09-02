import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type LoginRequest,
  type RegisterRequest,
} from "@habit-shaper/contracts";

import { getSession, login, logout, register } from "../api/auth-api";
import { type SessionUser } from "../auth.types";

export const authQueryKeys = {
  session: ["auth", "session"] as const,
};

export function useSessionQuery() {
  return useQuery({ queryKey: authQueryKeys.session, queryFn: getSession });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) => login(input),
    onSuccess: (user) =>
      queryClient.setQueryData<SessionUser>(authQueryKeys.session, user),
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterRequest) => register(input),
    onSuccess: (user) =>
      queryClient.setQueryData<SessionUser>(authQueryKeys.session, user),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(authQueryKeys.session, null),
  });
}
