import { pgTable, text, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// kind: 'morpho' | 'sage' | 'horizon' | 'cumulative'
export const readingsTable = pgTable("readings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  chapter: integer("chapter").notNull(),
  kind: text("kind").notNull(), // 'morpho' | 'sage' | 'horizon' | 'cumulative'
  cumulative: boolean("cumulative").notNull().default(false),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("readings_user_id_idx").on(table.userId),
  index("readings_user_chapter_kind_idx").on(table.userId, table.chapter, table.kind),
]);

export const insertReadingSchema = createInsertSchema(readingsTable).omit({ createdAt: true });
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readingsTable.$inferSelect;
