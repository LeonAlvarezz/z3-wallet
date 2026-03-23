import NotificationsSettingsPage from "@/modules/settings/pages/notifications";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/settings/notifications/")({
  head: () =>
    buildSeo({
      title: "Notification Settings",
      description:
        "Choose how My Wallet should notify you about budgets and account activity.",
      path: "/settings/notifications/",
    }),
    
  component: NotificationsSettingsPage,
});
