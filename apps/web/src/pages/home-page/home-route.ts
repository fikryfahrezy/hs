import { lazy } from "react";

import { defineStaticRoute } from "../../app/define-route";

export const homeRoute = defineStaticRoute({
  id: "home",
  access: "authenticated",
  path: "/",
  Component: lazy(() =>
    import("./index").then((module) => ({
      default: module.HomePage,
    })),
  ),
});
