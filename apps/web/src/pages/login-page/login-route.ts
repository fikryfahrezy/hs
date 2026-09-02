import { lazy } from "react";

import { defineStaticRoute } from "#app/app/define-route";

export const loginRoute = defineStaticRoute({
  id: "login",
  access: "public",
  path: "/login",
  Component: lazy(() =>
    import("./index").then((module) => ({
      default: module.LoginPage,
    })),
  ),
});
