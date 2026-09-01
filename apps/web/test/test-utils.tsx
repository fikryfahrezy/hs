import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render as testingLibraryRender,
  type RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type PropsWithChildren, type ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return function TestProviders({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return testingLibraryRender(ui, {
    wrapper: createWrapper(),
    ...options,
  });
}

export * from "@testing-library/react";
export { userEvent };
