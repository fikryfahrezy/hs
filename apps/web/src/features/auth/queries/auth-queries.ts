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

type LoginMutationParams = {
  input: LoginRequest;
};

function clearNonAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authQueryKeys.session[0],
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input }: LoginMutationParams) => login(input),
    onSuccess: (user) => {
      clearNonAuthQueries(queryClient);
      queryClient.setQueryData<SessionUser>(authQueryKeys.session, user);
    },
  });
}

type RegisterMutationParams = {
  input: RegisterRequest;
};

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input }: RegisterMutationParams) => register(input),
    onSuccess: (user) => {
      clearNonAuthQueries(queryClient);
      queryClient.setQueryData<SessionUser>(authQueryKeys.session, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearNonAuthQueries(queryClient);
      queryClient.setQueryData(authQueryKeys.session, null);
    },
  });
}
