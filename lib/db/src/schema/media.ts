import { pgTable, text, integer, bigint, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── Media — user-uploaded photos, documents, audio, video ────────
   Stored in R2 (r2Key). Extracted text from documents/OCR is stored
   separately so AI readings can use it without re-processing. */

export const mediaTable = pgTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entryId: text("entry_id"), // nullable — may be attached to a journal entry
  r2Key: text("r2_key").notNull(),
  contentType: text("content_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  kind: text("kind").notNull(), // 'photo' | 'document' | 'audio' | 'video'
  originalName: text("original_name"),
  extractedText: text("extracted_text"), // from PDF/DOCX/OCR
  publishStatus: text("publish_status").notNull().default("private"), // 'private' | 'unlisted' | 'public'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("media_user_id_idx").on(table.userId),
  index("media_entry_id_idx").on(table.entryId),
  index("media_kind_idx").on(table.kind),
]);

export const insertMediaSchema = createInsertSchema(mediaTable).omit({ createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;
