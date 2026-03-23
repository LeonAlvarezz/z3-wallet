import AddTransactionPage from "@/modules/transaction/pages/add.page";
import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/transaction/add/")({
  head: () =>
    buildSeo({
      title: "Add Transaction",
      description:
        "Record a new income or expense entry in My Wallet.",
      path: "/transaction/add/",
    }),
  component: AddTransactionPage,
});
