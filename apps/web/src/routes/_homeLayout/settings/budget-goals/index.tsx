import BudgetGoalsSettingsPage from "@/modules/settings/pages/budget-goals";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/settings/budget-goals/")({
  head: () =>
    buildSeo({
      title: "Budget Goals",
      description:
        "Set and review your category budget goals to stay on track in My Wallet.",
      path: "/settings/budget-goals/",
    }),
  component: BudgetGoalsSettingsPage,
});
