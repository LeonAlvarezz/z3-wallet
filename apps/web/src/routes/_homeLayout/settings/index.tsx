import SettingsHubPage from "@/modules/settings/pages";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/settings/")({
  head: () =>
    buildSeo({
      title: "Settings",
      description:
        "Manage budget, notifications, and account preferences in My Wallet.",
      path: "/settings/",
    }),
  component: SettingsHubPage,
});
