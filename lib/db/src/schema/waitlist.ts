import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const waitlistTable = pgTable("waitlist", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: text("user_id"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("waitlist_user_id_idx").on(table.userId),
]);

export type Waitlist = typeof waitlistTable.$inferSelect;
