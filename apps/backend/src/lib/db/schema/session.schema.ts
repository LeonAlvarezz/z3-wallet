import { relations } from "drizzle-orm";
import { pgTable, integer, text, serial } from "drizzle-orm/pg-core";
import { userTable } from "./user.schema";
import { timestamps } from "../common";
import { isoTimestamp as timestamp } from "@/lib/db/common/iso-timestamp";

export const sessionTable = pgTable("sessions", {
  // Opaque session identifier (safe to expose)
  id: serial().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  session_token_hash: text().notNull().unique(),
  ip: text(),
  user_agent: text(),
  expires_at: timestamp({ mode: "string" }).notNull(),
  ...timestamps,
});

export const sessionRelation = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.user_id],
    references: [userTable.id],
  }),
}));
