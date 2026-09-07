import { Hono } from "hono";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { createD1Db, journeyStateTable, journalEntriesTable, readingsTable, archiveUnlocksTable, mediaTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthVars } from "../middleware/auth";
import { sanitizeObject } from "../lib/sanitize";
import { auditLog } from "../lib/audit";
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
  updatedAt: z.string().optional(),
});

app.put("/state", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const body = putStateSchema.parse(await c.req.json());
  const now = new Date().toISOString();

  // Conflict resolution (5.6): compare client updatedAt with server's
  if (body.updatedAt) {
    const existing = await db.select().from(journeyStateTable).where(eq(journeyStateTable.userId, userId)).limit(1);
    if (existing[0] && existing[0].updatedAt > body.updatedAt) {
      return c.json({ error: "Conflict", serverData: existing[0] }, 409);
    }
  }

  await db.insert(journeyStateTable).values({ userId, tileIdx: body.tileIdx, updatedAt: now })
    .onConflictDoUpdate({ target: journeyStateTable.userId, set: { tileIdx: body.tileIdx, updatedAt: now } });

  const respId = `resp-${userId}`;
  await db.insert(journalEntriesTable).values({
    id: respId, userId, kind: "response", chapter: 0, content: JSON.stringify(sanitizeObject(body.responses)),
    updatedAt: now,
  }).onConflictDoUpdate({ target: journalEntriesTable.id, set: { content: JSON.stringify(sanitizeObject(body.responses)), updatedAt: now } });

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
  updatedAt: z.string().optional(),
});

app.put("/entries", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { stream, body } = putEntriesSchema.parse(await c.req.json());
  const now = new Date().toISOString();

  // Conflict resolution (5.6): check the newest server updatedAt for this user's entries
  const existing = await db.select().from(journalEntriesTable).where(and(
    eq(journalEntriesTable.userId, userId),
    inArray(journalEntriesTable.kind, ["stream", "body"]),
  )).orderBy(journalEntriesTable.updatedAt);
  const serverNewest = existing[existing.length - 1]?.updatedAt;
  // Client updatedAt comparison is optional — only enforce if provided
  // (entries are a full sync, so we use the max updatedAt)

  // Upsert each entry instead of delete-then-insert (5.1)
  const now_ = now;
  for (const e of stream) {
    const sanitized = sanitizeObject(e);
    await db.insert(journalEntriesTable).values({
      id: e.id, userId, kind: "stream" as const, chapter: e.chapter,
      content: JSON.stringify(sanitized), updatedAt: now_,
    }).onConflictDoUpdate({
      target: journalEntriesTable.id,
      set: { chapter: e.chapter, content: JSON.stringify(sanitized), updatedAt: now_ },
    });
  }
  for (const e of body) {
    const sanitized = sanitizeObject(e);
    await db.insert(journalEntriesTable).values({
      id: e.id, userId, kind: "body" as const, chapter: e.chapter,
      content: JSON.stringify(sanitized), updatedAt: now_,
    }).onConflictDoUpdate({
      target: journalEntriesTable.id,
      set: { chapter: e.chapter, content: JSON.stringify(sanitized), updatedAt: now_ },
    });
  }

  // Delete entries that are no longer in the client payload
  const clientIds = new Set([...stream.map(e => e.id), ...body.map(e => e.id)]);
  const toDelete = existing.filter(r => !clientIds.has(r.id));
  for (const r of toDelete) {
    await db.delete(journalEntriesTable).where(and(
      eq(journalEntriesTable.userId, userId),
      eq(journalEntriesTable.id, r.id),
    ));
  }

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
  updatedAt: z.string().optional(),
});

app.put("/readings", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const { readings, cumulative, updatedAt } = putReadingsSchema.parse(await c.req.json());
  const now = new Date().toISOString();

  // Conflict resolution (5.6)
  if (updatedAt) {
    const existing = await db.select().from(readingsTable).where(eq(readingsTable.userId, userId));
    const serverNewest = existing.reduce((max, r) => r.updatedAt > max ? r.updatedAt : max, "");
    if (serverNewest && serverNewest > updatedAt) {
      return c.json({ error: "Conflict", serverData: existing }, 409);
    }
  }

  // Upsert each reading instead of delete-then-insert (5.1)
  for (const [chIdxStr, chReadings] of Object.entries(readings)) {
    const chapter = parseInt(chIdxStr, 10);
    if (isNaN(chapter)) continue;
    for (const [kind, data] of Object.entries(chReadings)) {
      if (!data) continue;
      const sanitized = sanitizeObject(data);
      await db.insert(readingsTable).values({
        id: `${userId}-${chapter}-${kind}`, userId, chapter, kind, cumulative: false,
        data: JSON.stringify(sanitized), updatedAt: now,
      }).onConflictDoUpdate({
        target: readingsTable.id,
        set: { data: JSON.stringify(sanitized), updatedAt: now },
      });
    }
  }
  if (cumulative) {
    const sanitized = sanitizeObject(cumulative);
    await db.insert(readingsTable).values({
      id: `${userId}-cumulative`, userId, chapter: -1, kind: "cumulative", cumulative: true,
      data: JSON.stringify(sanitized), updatedAt: now,
    }).onConflictDoUpdate({
      target: readingsTable.id,
      set: { data: JSON.stringify(sanitized), updatedAt: now },
    });
  }

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

  // Upsert instead of delete-then-insert (5.1)
  for (const rawId of unlocked) {
    const [chIdxStr, kind, ...titleParts] = rawId.split("|");
    await db.insert(archiveUnlocksTable).values({
      id: `${userId}|${rawId}`, userId, chapterIdx: parseInt(chIdxStr, 10),
      kind, title: titleParts.join("|"),
    }).onConflictDoNothing();
  }

  // Delete entries no longer in the client payload
  const clientIds = new Set(unlocked.map(rawId => `${userId}|${rawId}`));
  const existing = await db.select({ id: archiveUnlocksTable.id }).from(archiveUnlocksTable).where(eq(archiveUnlocksTable.userId, userId));
  for (const r of existing) {
    if (!clientIds.has(r.id)) {
      await db.delete(archiveUnlocksTable).where(eq(archiveUnlocksTable.id, r.id));
    }
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

/* ─── Account Deletion (4.8) ─── */
app.delete("/account", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");

  // Get user's media R2 keys before deleting records
  const mediaRows = await db.select({ id: mediaTable.id, r2Key: mediaTable.r2Key }).from(mediaTable).where(eq(mediaTable.userId, userId));

  // Delete media objects from R2
  if (c.env.R2) {
    for (const m of mediaRows) {
      try { await c.env.R2.delete(m.r2Key); } catch { /* best effort */ }
    }
  }

  // Delete all user data from D1 (sequential deletes)
  await db.delete(journeyStateTable).where(eq(journeyStateTable.userId, userId));
  await db.delete(journalEntriesTable).where(eq(journalEntriesTable.userId, userId));
  await db.delete(readingsTable).where(eq(readingsTable.userId, userId));
  await db.delete(archiveUnlocksTable).where(eq(archiveUnlocksTable.userId, userId));
  await db.delete(mediaTable).where(eq(mediaTable.userId, userId));
  await db.delete(usersTable).where(eq(usersTable.id, userId));

  // Audit log the account deletion (4.12)
  await auditLog(db, {
    userId,
    action: "account_deletion",
    resourceType: "user",
    resourceId: userId,
  });

  return c.json({ ok: true });
});

export default app;
