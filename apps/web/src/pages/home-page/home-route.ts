import { lazy } from "react";

import type { AppRouteRegistration } from "../../types/route";

export const homeRoute = {
  id: "home",
  path: "/",
  Component: lazy(() =>
    import("./index").then((module) => ({
      default: module.HomePage,
    })),
  ),
} satisfies AppRouteRegistration;
