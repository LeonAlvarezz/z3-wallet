import { ProfilePage } from "@/modules/profile/page";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/profile/")({
  head: () =>
    buildSeo({
      title: "Profile",
      description:
        "View your profile details, avatar, and account balance in Z3 Wallet.",
      path: "/profile/",
    }),
  component: ProfilePage,
});
