/* ═══════════════════════════════════════════════════════════════
   D1 (SQLite) schema for Cloudflare Workers deployment.

   Mirrors the PostgreSQL schema in ../schema/ but uses SQLite types:
   - jsonb → text (JSON stored as string)
   - timestamp with timezone → text (ISO 8601 string)
   - boolean → integer (0/1)
   - bigint → integer

   Drizzle ORM supports D1 via drizzle-orm/sqlite-proxy or
   drizzle-orm/d1. We use the D1 driver directly.
   ═══════════════════════════════════════════════════════════════ */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── Users ─────────────────────────────────────────────────────── */
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

/* ── Journey State ─────────────────────────────────────────────── */
export const journeyStateTable = sqliteTable("journey_state", {
  userId: text("user_id").primaryKey(),
  tileIdx: integer("tile_idx").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertJourneyStateSchema = createInsertSchema(journeyStateTable);
export type InsertJourneyState = z.infer<typeof insertJourneyStateSchema>;
export type JourneyState = typeof journeyStateTable.$inferSelect;

/* ── Journal Entries ───────────────────────────────────────────── */
export const journalEntriesTable = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  chapter: integer("chapter").notNull(),
  content: text("content").notNull(), // JSON string
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("journal_entries_user_id_idx").on(table.userId),
  index("journal_entries_user_chapter_idx").on(table.userId, table.chapter),
  index("journal_entries_kind_idx").on(table.kind),
]);

export const insertJournalEntrySchema = createInsertSchema(journalEntriesTable).omit({ createdAt: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;

/* ── Readings ──────────────────────────────────────────────────── */
export const readingsTable = sqliteTable("readings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  chapter: integer("chapter").notNull(),
  kind: text("kind").notNull(),
  cumulative: integer("cumulative", { mode: "boolean" }).notNull().default(false),
  data: text("data").notNull(), // JSON string
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("readings_user_id_idx").on(table.userId),
  index("readings_user_chapter_kind_idx").on(table.userId, table.chapter, table.kind),
]);

export const insertReadingSchema = createInsertSchema(readingsTable).omit({ createdAt: true });
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readingsTable.$inferSelect;

/* ── Archive Unlocks ───────────────────────────────────────────── */
export const archiveUnlocksTable = sqliteTable("archive_unlocks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  chapterIdx: integer("chapter_idx").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  unlockedAt: text("unlocked_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("archive_unlocks_user_id_idx").on(table.userId),
  index("archive_unlocks_user_chapter_idx").on(table.userId, table.chapterIdx),
]);

export const insertArchiveUnlockSchema = createInsertSchema(archiveUnlocksTable).omit({ unlockedAt: true });
export type InsertArchiveUnlock = z.infer<typeof insertArchiveUnlockSchema>;
export type ArchiveUnlock = typeof archiveUnlocksTable.$inferSelect;

/* ── Submissions ───────────────────────────────────────────────── */
export const submissionsTable = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  clerkId: text("clerk_id"),
  submittedAt: text("submitted_at").notNull().default(new Date().toISOString()),
  payload: text("payload").notNull(), // JSON string
  ipHash: text("ip_hash"),
}, (table) => [
  index("submissions_user_id_idx").on(table.userId),
  index("submissions_clerk_id_idx").on(table.clerkId),
]);

export type Submission = typeof submissionsTable.$inferSelect;

/* ── Waitlist ──────────────────────────────────────────────────── */
export const waitlistTable = sqliteTable("waitlist", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: text("user_id"),
  submittedAt: text("submitted_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("waitlist_user_id_idx").on(table.userId),
]);

export type Waitlist = typeof waitlistTable.$inferSelect;

/* ── Fellowship (pods) ─────────────────────────────────────────── */
export const podsTable = sqliteTable("pods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: text("created_by").notNull(),
  gate: text("gate").notNull().default("strict"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("pods_created_by_idx").on(table.createdBy),
]);

export const podMembersTable = sqliteTable("pod_members", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: text("joined_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("pod_members_pod_id_idx").on(table.podId),
  index("pod_members_user_id_idx").on(table.userId),
]);

export const podSubmissionsTable = sqliteTable("pod_submissions", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  chapter: integer("chapter").notNull(),
  submittedAt: text("submitted_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("pod_submissions_pod_id_idx").on(table.podId),
  index("pod_submissions_user_chapter_idx").on(table.userId, table.chapter),
]);

export const podSharesTable = sqliteTable("pod_shares", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  sceneKey: text("scene_key").notNull(),
  shared: integer("shared", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("pod_shares_pod_id_idx").on(table.podId),
  index("pod_shares_user_id_idx").on(table.userId),
]);

/* ── Birth Data ────────────────────────────────────────────────── */
export const birthDataTable = sqliteTable("birth_data", {
  userId: text("user_id").primaryKey(),
  birthDate: text("birth_date").notNull(),
  birthTime: text("birth_time"),
  birthPlace: text("birth_place"),
  archetypeContext: text("archetype_context"),
  computation: text("computation"), // JSON string
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertBirthDataSchema = createInsertSchema(birthDataTable).omit({
  createdAt: true, updatedAt: true,
});
export type InsertBirthData = z.infer<typeof insertBirthDataSchema>;
export type BirthData = typeof birthDataTable.$inferSelect;

/* ── Media ─────────────────────────────────────────────────────── */
export const mediaTable = sqliteTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entryId: text("entry_id"),
  r2Key: text("r2_key").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  kind: text("kind").notNull(),
  originalName: text("original_name"),
  extractedText: text("extracted_text"),
  publishStatus: text("publish_status").notNull().default("private"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => [
  index("media_user_id_idx").on(table.userId),
  index("media_entry_id_idx").on(table.entryId),
  index("media_kind_idx").on(table.kind),
]);

export const insertMediaSchema = createInsertSchema(mediaTable).omit({ createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;
