import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { CategoryRuleModel } from "@z3-wallet/types";
import { enumToPgEnum, timestamps } from "../common";
import { categoryTable } from "./category.schema";
import { userTable } from "./user.schema";

export const categoryRuleTypeEnum = pgEnum(
  "CategoryRuleTypeEnum",
  enumToPgEnum(CategoryRuleModel.TypeEnum),
);

export const categoryRuleTable = pgTable(
  "category_rules",
  {
    id: serial().primaryKey(),
    user_id: integer().references(() => userTable.id, {
      onDelete: "cascade",
    }),
    category_id: integer()
      .references(() => categoryTable.id, {
        onDelete: "set null",
      })
      .notNull(),
    type: categoryRuleTypeEnum()
      .default(CategoryRuleModel.TypeEnum.USER)
      .notNull(),
    keyword: text().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("unique_user_personal_rule")
      .on(table.keyword, table.user_id)
      .where(sql`${table.type} = 'USER'::"CategoryRuleTypeEnum"`),
    index("idx_category_rules_user_id").on(table.user_id), // add this
    index("idx_category_rules_category_id").on(table.category_id), // add this
  ],
);

export const categoryRuleRelation = relations(categoryRuleTable, ({ one }) => ({
  user: one(userTable, {
    fields: [categoryRuleTable.user_id],
    references: [userTable.id],
  }),
  category: one(categoryTable, {
    fields: [categoryRuleTable.category_id],
    references: [categoryTable.id],
  }),
}));
