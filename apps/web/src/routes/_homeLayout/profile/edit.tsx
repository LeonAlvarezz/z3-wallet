import { EditProfilePage } from "@/modules/profile/edit-profile.page";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/profile/edit")({
  head: () =>
    buildSeo({
      title: "Edit Profile",
      description: "Update your name and avatar in My Wallet.",
      path: "/profile/edit",
    }),
  component: EditProfilePage,
});
