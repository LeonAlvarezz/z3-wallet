import { TransactionPage } from "@/modules/transaction";
import { createFileRoute } from "@tanstack/react-router";
import { TransactionModel } from "@my-wallet/types";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/_homeLayout/transaction/")({
  validateSearch: (search) =>
    TransactionModel.TransactionBaseQuerySchema.parse(search),
  head: () =>
    buildSeo({
      title: "Transactions",
      description:
        "Browse, filter, and edit your transaction history in My Wallet.",
      path: "/transaction/",
    }),
  component: TransactionPage,
});
