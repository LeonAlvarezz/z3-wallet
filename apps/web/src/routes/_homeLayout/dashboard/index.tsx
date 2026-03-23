import Dashboard from "@/modules/dashboard/page";
import { buildSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_homeLayout/dashboard/")({
  head: () =>
    buildSeo({
      title: "Dashboard",
      description:
        "View your balance, cash flow, and category spending from the My Wallet dashboard.",
      path: "/dashboard/",
    }),
  component: Dashboard,
});
