import { pgEnum, text } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, serial } from "drizzle-orm/pg-core";
import { enumToPgEnum, simpleTimestamps } from "../common";
import { CategoryModel } from "@z3-wallet/types";
import { integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { transactionTable } from "./transaction.schema";
import { categoryRuleTable } from "./category-rule.schema";
export const categoryColorEnum = pgEnum(
  "CategoryColorEnum",
  enumToPgEnum(CategoryModel.CategoryColorEnum),
);
export const categoryTable = pgTable("categories", {
  id: serial().primaryKey(),
  name: varchar({ length: 50 }).notNull(),
  icon: text().notNull(),
  color: categoryColorEnum().notNull(),
  order: integer().notNull().unique(),
  ...simpleTimestamps,
});

export const categoryRelation = relations(categoryTable, ({ one, many }) => ({
  transaction: one(transactionTable, {
    fields: [categoryTable.id],
    references: [transactionTable.category_id],
  }),
  category_rules: many(categoryRuleTable),
}));
