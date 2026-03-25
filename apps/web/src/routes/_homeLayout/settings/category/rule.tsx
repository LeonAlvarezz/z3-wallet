import { buildSeo } from "@/lib/seo";
import CategoryMatchPage from "@/modules/category-rule/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_homeLayout/settings/category/rule")({
  head: () =>
    buildSeo({
      title: "Category Rules",
      description:
        "Create keyword rules that automatically match transactions to categories in Z3 Wallet.",
      path: "/settings/category-rule/",
    }),
  component: CategoryMatchPage,
});
