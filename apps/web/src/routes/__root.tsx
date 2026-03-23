import * as React from "react";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { ThemeProvider } from "@/modules/theme/theme-provider";
import { Toaster } from "sonner";
import type { RouterContext } from "@/router-context";
import { buildSeo } from "@/lib/seo";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => buildSeo({}),
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
        <div className="max-w-mobile relative m-auto flex min-h-lvh flex-col border">
          <Outlet />
          <Toaster position="top-center" />
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}
