import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const archiveUnlocksTable = pgTable("archive_unlocks", {
  id: text("id").primaryKey(), // `${userId}|${chapterIdx}|${kind}|${title}`
  userId: text("user_id").notNull(),
  chapterIdx: integer("chapter_idx").notNull(),
  kind: text("kind").notNull(), // 'code' | 'lore'
  title: text("title").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertArchiveUnlockSchema = createInsertSchema(archiveUnlocksTable).omit({ unlockedAt: true });
export type InsertArchiveUnlock = z.infer<typeof insertArchiveUnlockSchema>;
export type ArchiveUnlock = typeof archiveUnlocksTable.$inferSelect;
