import type { ComponentType, LazyExoticComponent } from "react";

type RouteRegistrationBase = {
  id: string;
  access: "authenticated" | "public";
  Component: LazyExoticComponent<ComponentType>;
};

type IndexRouteRegistration = RouteRegistrationBase & {
  index: true;
  path?: never;
};

export type AppPathRouteRegistration = RouteRegistrationBase & {
  index?: false;
  path: string;
};

export type AppRouteRegistration =
  | IndexRouteRegistration
  | AppPathRouteRegistration;
