import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── Birth data — the invisible archetype layer ────────────────────
   Coordinates of the user's beginning. archetypeContext is computed
   server-side (never surfaced to the user as any named system) and
   injected as a private background sketch into readings/syntheses. */

export const birthDataTable = pgTable("birth_data", {
  userId: text("user_id").primaryKey(), // users.id
  birthDate: text("birth_date").notNull(), // YYYY-MM-DD
  birthTime: text("birth_time"), // HH:MM, optional
  birthPlace: text("birth_place"), // free text, optional
  // Computed background sketch + raw computation payload for regeneration.
  archetypeContext: text("archetype_context"),
  computation: jsonb("computation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBirthDataSchema = createInsertSchema(birthDataTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertBirthData = z.infer<typeof insertBirthDataSchema>;
export type BirthData = typeof birthDataTable.$inferSelect;
