import { dashboardRoute } from "../pages/dashboard-page/dashboard-route";
import { loginRoute } from "../pages/login-page/login-route";
import { registerRoute } from "../pages/register-page/register-route";
import type { AppRouteRegistration } from "../types/route";

export const appRoutes: readonly AppRouteRegistration[] = [
  dashboardRoute,
  loginRoute,
  registerRoute,
];
