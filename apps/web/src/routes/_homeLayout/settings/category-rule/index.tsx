import CategoryMatchPage from "@/modules/category-rule/page";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/settings/category-rule/")({
  head: () =>
    buildSeo({
      title: "Category Rules",
      description:
        "Create keyword rules that automatically match transactions to categories in My Wallet.",
      path: "/settings/category-rule/",
    }),
  component: CategoryMatchPage,
});
