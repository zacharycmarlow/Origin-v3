import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  clerkId: text("clerk_id"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  payload: jsonb("payload").notNull(),
  ipHash: text("ip_hash"),
}, (table) => [
  index("submissions_user_id_idx").on(table.userId),
  index("submissions_clerk_id_idx").on(table.clerkId),
]);

export type Submission = typeof submissionsTable.$inferSelect;
