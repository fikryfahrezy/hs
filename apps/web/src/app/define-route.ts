import { type AppPathRouteRegistration } from "../types/route";

export function defineRoute<
  const Registration extends AppPathRouteRegistration,
  Arguments extends unknown[],
>(
  registration: Registration,
  buildPath: (path: Registration["path"], ...arguments_: Arguments) => string,
) {
  return {
    ...registration,
    to: (...arguments_: Arguments) =>
      buildPath(registration.path, ...arguments_),
  };
}

export function defineStaticRoute<
  const Registration extends AppPathRouteRegistration,
>(registration: Registration) {
  return defineRoute(registration, (path) => path);
}
