import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const journeyStateTable = pgTable("journey_state", {
  userId: text("user_id").primaryKey(),
  tileIdx: integer("tile_idx").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJourneyStateSchema = createInsertSchema(journeyStateTable);
export type InsertJourneyState = z.infer<typeof insertJourneyStateSchema>;
export type JourneyState = typeof journeyStateTable.$inferSelect;
