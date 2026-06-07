import { buildSeo } from "@/lib/seo";
import ImportPrototypePage from "@/modules/transaction/pages/prototype/import-prototype.page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_homeLayout/transaction/import-prototype",
)({
  head: () =>
    buildSeo({
      title: "Import Prototype",
      description: "Prototype the CSV transaction import review flow.",
      path: "/transaction/import-prototype/",
    }),
  component: ImportPrototypePage,
});
