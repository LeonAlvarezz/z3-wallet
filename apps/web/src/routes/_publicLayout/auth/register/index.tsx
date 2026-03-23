import RegisterPage from "@/modules/auth/pages/register.page";
import { createFileRoute } from "@tanstack/react-router";
import { publicOnly } from "@/middleware/public-only";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_publicLayout/auth/register/")({
  beforeLoad: publicOnly,
  head: () =>
    buildSeo({
      title: "Create Account",
      description:
        "Create a My Wallet account to start tracking expenses, budgets, and cash flow in one place.",
      path: "/auth/register/",
    }),
  component: RegisterPage,
});
