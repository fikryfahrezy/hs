import type { ComponentType, LazyExoticComponent } from "react";

type RouteRegistrationBase = {
  id: string;
  Component: LazyExoticComponent<ComponentType>;
};

type IndexRouteRegistration = RouteRegistrationBase & {
  index: true;
  path?: never;
};

type PathRouteRegistration = RouteRegistrationBase & {
  index?: false;
  path: string;
};

export type AppRouteRegistration =
  | IndexRouteRegistration
  | PathRouteRegistration;
