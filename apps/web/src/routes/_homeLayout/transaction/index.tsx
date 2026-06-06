import { TransactionPage } from "@/modules/transaction";
import { createFileRoute } from "@tanstack/react-router";
import type { BaseModel } from "@z3-wallet/types";
import { buildSeo } from "@/lib/seo";

const validTimeFrames = new Set<string>([
  "today",
  "yesterday",
  "week",
  "month",
  "year",
  "all",
]);

export const Route = createFileRoute("/_homeLayout/transaction/")({
  validateSearch: (search) => ({
    query: typeof search.query === "string" ? search.query : undefined,
    time_frame:
      typeof search.time_frame === "string" &&
      validTimeFrames.has(search.time_frame)
        ? (search.time_frame as BaseModel.TimeFrameEnum)
        : undefined,
  }),
  head: () =>
    buildSeo({
      title: "Transactions",
      description:
        "Browse, filter, and edit your transaction history in Z3 Wallet.",
      path: "/transaction/",
    }),
  component: TransactionPage,
});
