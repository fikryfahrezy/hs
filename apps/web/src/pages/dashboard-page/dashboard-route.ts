import { lazy } from "react";

import { defineStaticRoute } from "../../app/define-route";

export const dashboardRoute = defineStaticRoute({
  id: "dashboard",
  access: "authenticated",
  path: "/",
  Component: lazy(() =>
    import("./index").then((module) => ({
      default: module.DashboardPage,
    })),
  ),
});
