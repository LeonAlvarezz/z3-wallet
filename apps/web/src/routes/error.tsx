import { buildSeo } from "@/lib/seo";
import { GenericErrorPage } from "@/modules/error/components/StatusPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  head: () =>
    buildSeo({
      title: "Something Went Wrong",
      description:
        "An unexpected problem interrupted this page in Z3 Wallet.",
      noIndex: true,
      path: "/error",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <GenericErrorPage />;
}
