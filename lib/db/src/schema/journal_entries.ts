import { pgTable, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// kind: 'stream' | 'body' | 'response'
export const journalEntriesTable = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(), // 'stream' | 'body' | 'response'
  chapter: integer("chapter").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("journal_entries_user_id_idx").on(table.userId),
  index("journal_entries_user_chapter_idx").on(table.userId, table.chapter),
  index("journal_entries_kind_idx").on(table.kind),
]);

export const insertJournalEntrySchema = createInsertSchema(journalEntriesTable).omit({ createdAt: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;
