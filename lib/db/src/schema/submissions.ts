import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  clerkId: text("clerk_id"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  payload: jsonb("payload").notNull(),
  ipHash: text("ip_hash"),
});

export type Submission = typeof submissionsTable.$inferSelect;
