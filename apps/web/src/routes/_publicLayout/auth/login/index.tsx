import LoginPage from "@/modules/auth/pages/login.page";
import { createFileRoute } from "@tanstack/react-router";
import { publicOnly } from "@/middleware/public-only";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_publicLayout/auth/login/")({
  beforeLoad: publicOnly,
  head: () =>
    buildSeo({
      title: "Sign In",
      description:
        "Sign in to My Wallet to review balances, track spending, and manage your personal finances.",
      path: "/auth/login/",
    }),
  component: LoginPage,
});
