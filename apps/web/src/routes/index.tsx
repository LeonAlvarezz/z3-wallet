import HomePage from "@/modules/home/page";
import { buildSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () =>
    buildSeo({
      title: "Track Spending With Clarity",
      description:
        "Discover My Wallet, a focused personal finance app for tracking transactions, understanding cash flow, and building stronger money habits.",
      path: "/",
    }),
  component: HomePage,
});
