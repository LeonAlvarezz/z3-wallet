import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { enumToPgEnum, simpleTimestamps } from "../common";
import { userTable } from "./user.schema";
import { AuthModel } from "@z3-wallet/types";
export const oauthProvider = pgEnum(
  "OAuthProvider",
  enumToPgEnum(AuthModel.OAuthProvider),
);
export const oauthTable = pgTable(
  "oauths",
  {
    id: serial().primaryKey(),
    user_id: integer()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: oauthProvider().notNull(),
    provider_account_id: text().notNull(),
    provider_login: text(),
    provider_email: text(),
    ...simpleTimestamps,
  },
  (table) => [
    uniqueIndex("uq_oauths_provider_account").on(
      table.provider,
      table.provider_account_id,
    ),
    uniqueIndex("uq_oauths_user_provider").on(table.user_id, table.provider),
    index("idx_oauth_accounts_user_id").on(table.user_id),
  ],
);

export const oauthAccountRelation = relations(oauthTable, ({ one }) => ({
  user: one(userTable, {
    fields: [oauthTable.user_id],
    references: [userTable.id],
  }),
}));
