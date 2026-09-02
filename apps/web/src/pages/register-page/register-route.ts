import { lazy } from "react";

import { defineStaticRoute } from "../../app/define-route";

export const registerRoute = defineStaticRoute({
  id: "register",
  access: "public",
  path: "/register",
  Component: lazy(() =>
    import("./index").then((module) => ({
      default: module.RegisterPage,
    })),
  ),
});
