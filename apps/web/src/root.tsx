import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppProviders } from "./app/providers";
import { appRoutes } from "./app/route-registry";
import { useSessionQuery } from "./features/auth/queries/auth-queries";
import { dashboardRoute } from "./pages/dashboard-page/dashboard-route";
import { loginRoute } from "./pages/login-page/login-route";
import { type AppRouteRegistration } from "./types/route";

type RegisteredRoutesProps = {
  access: AppRouteRegistration["access"];
  redirectTo: string;
};

function RegisteredRoutes({ access, redirectTo }: RegisteredRoutesProps) {
  return (
    <Routes>
      {appRoutes
        .filter((route) => route.access === access)
        .map((route) => {
          const element = <route.Component />;
          return route.index ? (
            <Route key={route.id} index element={element} />
          ) : (
            <Route key={route.id} path={route.path} element={element} />
          );
        })}
      <Route path="*" element={<Navigate to={redirectTo} replace />} />
    </Routes>
  );
}

function SessionRoutes() {
  const session = useSessionQuery();

  if (session.isPending) {
    return <p className="route-status">Restoring your session…</p>;
  }

  if (session.isError) {
    return (
      <div className="route-status" role="alert">
        <p>We could not connect to Habit Shaper.</p>
        <button
          type="button"
          data-variant="secondary"
          onClick={() => void session.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (session.data) {
    return (
      <RegisteredRoutes
        access="authenticated"
        redirectTo={dashboardRoute.to()}
      />
    );
  }

  return <RegisteredRoutes access="public" redirectTo={loginRoute.to()} />;
}

export function Root() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Suspense fallback={<p>Loading Habit Shaper…</p>}>
          <SessionRoutes />
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}
