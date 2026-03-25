import CategorySettingsPage from "@/modules/settings/pages/category";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/settings/category/")({
  head: () =>
    buildSeo({
      title: "Category Settings",
      description:
        "Manage category rules, matching preferences, and other category tools in Z3 Wallet.",
      path: "/settings/category/",
    }),
  component: CategorySettingsPage,
});
