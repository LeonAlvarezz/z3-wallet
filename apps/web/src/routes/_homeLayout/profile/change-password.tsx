import { ChangePasswordPage } from "@/modules/auth/pages/change-password.page";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/profile/change-password")({
  head: () =>
    buildSeo({
      title: "Change Password",
      description:
        "Update your My Wallet password and keep your account secure.",
      path: "/profile/change-password",
    }),
  component: ChangePasswordPage,
});
