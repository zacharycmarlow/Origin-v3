import { pgTable, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── Fellowship (pods) — walking the Origin together ──────────────
   A pod advances chapter by chapter; members share chosen responses
   with the pod, and the pod gates on everyone's submissions. */

export const podsTable = pgTable("pods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: text("created_by").notNull(), // users.id
  // 'strict' — chapter N+1 opens only when every member submitted chapter N
  // 'soft'   — laggards are nudged but the pod may move on
  gate: text("gate").notNull().default("strict"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("pods_created_by_idx").on(table.createdBy),
]);

export const podMembersTable = pgTable("pod_members", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"), // 'keeper' (creator) | 'member'
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("pod_members_pod_id_idx").on(table.podId),
  index("pod_members_user_id_idx").on(table.userId),
]);

/* One row per member per chapter — the submission that gates the pod. */
export const podSubmissionsTable = pgTable("pod_submissions", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  chapter: integer("chapter").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("pod_submissions_pod_id_idx").on(table.podId),
  index("pod_submissions_user_chapter_idx").on(table.userId, table.chapter),
]);

/* Per-response sharing consent: which of a member's responses the pod may see. */
export const podSharesTable = pgTable("pod_shares", {
  id: text("id").primaryKey(),
  podId: text("pod_id").notNull(),
  userId: text("user_id").notNull(),
  sceneKey: text("scene_key").notNull(),
  shared: boolean("shared").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("pod_shares_pod_id_idx").on(table.podId),
  index("pod_shares_user_id_idx").on(table.userId),
]);

export const insertPodSchema = createInsertSchema(podsTable).omit({ createdAt: true });
export const insertPodMemberSchema = createInsertSchema(podMembersTable).omit({ joinedAt: true });
export const insertPodSubmissionSchema = createInsertSchema(podSubmissionsTable).omit({ submittedAt: true });
export const insertPodShareSchema = createInsertSchema(podSharesTable).omit({ updatedAt: true });

export type Pod = typeof podsTable.$inferSelect;
export type PodMember = typeof podMembersTable.$inferSelect;
export type PodSubmission = typeof podSubmissionsTable.$inferSelect;
export type PodShare = typeof podSharesTable.$inferSelect;
export type InsertPod = z.infer<typeof insertPodSchema>;
export type InsertPodMember = z.infer<typeof insertPodMemberSchema>;
export type InsertPodSubmission = z.infer<typeof insertPodSubmissionSchema>;
export type InsertPodShare = z.infer<typeof insertPodShareSchema>;
