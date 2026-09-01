import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppProviders } from "./app/providers";
import { appRoutes } from "./app/route-registry";

export function Root() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Suspense fallback={<p>Loading Habit Shaper…</p>}>
          <Routes>
            {appRoutes.map((route) => {
              const Page = route.Component;
              const element = <Page />;

              return route.index ? (
                <Route element={element} index key={route.id} />
              ) : (
                <Route element={element} key={route.id} path={route.path} />
              );
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}
