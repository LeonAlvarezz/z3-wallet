import { serial, text, pgTable, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { relations } from "drizzle-orm";
import { authTable } from "./auth.schema";
import { sessionTable } from "./session.schema";
import { isoTimestamp as timestamp } from "@/lib/db/common/iso-timestamp";
import { transactionTable } from "./transaction.schema";
import { walletTable } from "./wallet.schema";
import { categoryRuleTable } from "./category-rule.schema";
import { oauthTable } from "./oauth.schema";

export const userTable = pgTable("users", {
  id: serial().primaryKey(),
  public_id: uuid().defaultRandom().unique().notNull(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  avatar_url: text(),
  last_login_at: timestamp({ mode: "string" }),
  ...timestamps,
});

export const userRelation = relations(userTable, ({ one, many }) => ({
  auth: one(authTable, {
    fields: [userTable.id],
    references: [authTable.user_id],
  }),
  session: many(sessionTable),
  wallet: one(walletTable, {
    fields: [userTable.id],
    references: [walletTable.user_id],
  }),
  category_rules: many(categoryRuleTable),
  oauth_accounts: many(oauthTable),
}));
