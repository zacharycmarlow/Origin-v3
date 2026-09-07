import { Hono } from "hono";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { createD1Db, journeyStateTable, journalEntriesTable, readingsTable, archiveUnlocksTable } from "@workspace/db";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use("*", requireAuth);

/* ─── Journey State ─── */
app.get("/state", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");

  const stateRow = await db.select().from(journeyStateTable).where(eq(journeyStateTable.userId, userId)).limit(1);
  const respRow = await db.select().from(journalEntriesTable).where(and(
    eq(journalEntriesTable.userId, userId),
    eq(journalEntriesTable.kind, "response"),
  )).limit(1);

  return c.json({
    tileIdx: stateRow[0]?.tileIdx ?? 0,
    responses: respRow[0]?.content ? JSON.parse(respRow[0].content) : {},
  });
});

const putStateSchema = z.object({
  tileIdx: z.number().int().min(0),
  responses: z.record(z.unknown()).optional().default({}),
});

app.put("/state", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const body = putStateSchema.parse(await c.req.json());
  const now = new Date().toISOString();

  await db.insert(journeyStateTable).values({ userId, tileIdx: body.tileIdx, updatedAt: now })
    .onConflictDoUpdate({ target: journeyStateTable.userId, set: { tileIdx: body.tileIdx, updatedAt: now } });

  const respId = `resp-${userId}`;
  await db.insert(journalEntriesTable).values({
    id: respId, userId, kind: "response", chapter: 0, content: JSON.stringify(body.responses),
  }).onConflictDoUpdate({ target: journalEntriesTable.id, set: { content: JSON.stringify(body.responses) } });

  return c.json({ ok: true });
});

/* ─── Journal Entries ─── */
app.get("/entries", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");

  const rows = await db.select().from(journalEntriesTable).where(and(
    eq(journalEntriesTable.userId, userId),
    inArray(journalEntriesTable.kind, ["stream", "body"]),
  ));

  const stream = rows.filter(r => r.kind === "stream").map(r => JSON.parse(r.content));
  const body = rows.filter(r => r.kind === "body").map(r => JSON.parse(r.content));

  return c.json({ stream, body });
});

const streamEntrySchema = z.object({
  id: z.string(), chapter: z.number().int(), text: z.string(), timestamp: z.number(),
});
const bodyEntrySchema = z.object({
  id: z.string(), zoneId: z.string(), energyCenter: z.string(), chapter: z.number().int(), note: z.string(), timestamp: z.number(),
});
const putEntriesSchema = z.object({
  stream: z.array(streamEntrySchema).optional().default([]),
  body: z.array(bodyEntrySchema).optional().default([]),
});

app.put("/entries", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { stream, body } = putEntriesSchema.parse(await c.req.json());

  await db.delete(journalEntriesTable).where(and(
    eq(journalEntriesTable.userId, userId),
    inArray(journalEntriesTable.kind, ["stream", "body"]),
  ));

  const toInsert = [
    ...stream.map(e => ({ id: e.id, userId, kind: "stream" as const, chapter: e.chapter, content: JSON.stringify(e) })),
    ...body.map(e => ({ id: e.id, userId, kind: "body" as const, chapter: e.chapter, content: JSON.stringify(e) })),
  ];
  if (toInsert.length > 0) await db.insert(journalEntriesTable).values(toInsert);

  return c.json({ ok: true });
});

app.delete("/entries/:id", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const id = c.req.param("id");
  await db.delete(journalEntriesTable).where(and(
    eq(journalEntriesTable.userId, userId),
    eq(journalEntriesTable.id, id),
    inArray(journalEntriesTable.kind, ["stream", "body"]),
  ));
  return c.json({ ok: true });
});

/* ─── Readings ─── */
app.get("/readings", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const rows = await db.select().from(readingsTable).where(eq(readingsTable.userId, userId));

  const readings: Record<number, Record<string, unknown>> = {};
  let cumulative = null;
  for (const row of rows) {
    const data = JSON.parse(row.data);
    if (row.cumulative) { cumulative = data; }
    else {
      if (!readings[row.chapter]) readings[row.chapter] = {};
      readings[row.chapter][row.kind] = data;
    }
  }
  return c.json({ readings, cumulative });
});

const putReadingsSchema = z.object({
  readings: z.record(z.string(), z.record(z.string(), z.unknown())).optional().default({}),
  cumulative: z.unknown().optional().nullable(),
});

app.put("/readings", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { readings, cumulative } = putReadingsSchema.parse(await c.req.json());

  await db.delete(readingsTable).where(eq(readingsTable.userId, userId));

  const toInsert: { id: string; userId: string; chapter: number; kind: string; cumulative: boolean; data: string }[] = [];
  for (const [chIdxStr, chReadings] of Object.entries(readings)) {
    const chapter = parseInt(chIdxStr, 10);
    if (isNaN(chapter)) continue;
    for (const [kind, data] of Object.entries(chReadings)) {
      if (!data) continue;
      toInsert.push({ id: `${userId}-${chapter}-${kind}`, userId, chapter, kind, cumulative: false, data: JSON.stringify(data) });
    }
  }
  if (cumulative) {
    toInsert.push({ id: `${userId}-cumulative`, userId, chapter: -1, kind: "cumulative", cumulative: true, data: JSON.stringify(cumulative) });
  }
  if (toInsert.length > 0) await db.insert(readingsTable).values(toInsert);

  return c.json({ ok: true });
});

/* ─── Archive Unlocks ─── */
app.get("/archive", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const rows = await db.select({ id: archiveUnlocksTable.id }).from(archiveUnlocksTable).where(eq(archiveUnlocksTable.userId, userId));
  const unlocked = rows.map(r => r.id.replace(`${userId}|`, ""));
  return c.json({ unlocked });
});

app.put("/archive", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { unlocked } = z.object({ unlocked: z.array(z.string()).optional().default([]) }).parse(await c.req.json());

  await db.delete(archiveUnlocksTable).where(eq(archiveUnlocksTable.userId, userId));
  if (unlocked.length > 0) {
    const toInsert = unlocked.map(rawId => {
      const [chIdxStr, kind, ...titleParts] = rawId.split("|");
      return { id: `${userId}|${rawId}`, userId, chapterIdx: parseInt(chIdxStr, 10), kind, title: titleParts.join("|") };
    });
    await db.insert(archiveUnlocksTable).values(toInsert);
  }
  return c.json({ ok: true });
});

app.post("/archive", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { id: rawId } = z.object({ id: z.string() }).parse(await c.req.json());
  const [chIdxStr, kind, ...titleParts] = rawId.split("|");
  await db.insert(archiveUnlocksTable).values({
    id: `${userId}|${rawId}`, userId, chapterIdx: parseInt(chIdxStr, 10), kind, title: titleParts.join("|"),
  }).onConflictDoNothing();
  return c.json({ ok: true }, 201);
});

export default app;
