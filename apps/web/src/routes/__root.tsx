import * as React from "react";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { ThemeProvider } from "@/modules/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { RouterContext } from "@/router-context";
import { buildSeo } from "@/lib/seo";
import {
  NotFoundPage,
  RouteErrorPage,
} from "@/modules/error/components/StatusPage";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => buildSeo({}),
  errorComponent: RouteErrorPage,
  notFoundComponent: () => <NotFoundPage />,
  component: RootComponent,
});

function RouteHeadPortal() {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(<HeadContent />, document.head);
}

function RootComponent() {
  return (
    <React.Fragment>
      <RouteHeadPortal />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="relative flex min-h-lvh flex-col">
          <Outlet />
          <Toaster position="top-center" />
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}
