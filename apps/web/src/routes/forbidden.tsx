import { buildSeo } from "@/lib/seo";
import { ForbiddenPage } from "@/modules/error/components/StatusPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forbidden")({
  head: () =>
    buildSeo({
      title: "Forbidden",
      description: "You do not have permission to view this page in Z3 Wallet.",
      noIndex: true,
      path: "/forbidden",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ForbiddenPage />;
}
