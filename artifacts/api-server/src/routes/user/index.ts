import { Router, type IRouter } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { db, journeyStateTable, journalEntriesTable, readingsTable, archiveUnlocksTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);

/* ─── Journey State: tileIdx + scene responses ─── */

router.get("/state", async (req, res, next) => {
  try {
    const userId = req.userId;

    const [stateRow] = await db
      .select()
      .from(journeyStateTable)
      .where(eq(journeyStateTable.userId, userId))
      .limit(1);

    const [respRow] = await db
      .select()
      .from(journalEntriesTable)
      .where(and(
        eq(journalEntriesTable.userId, userId),
        eq(journalEntriesTable.kind, "response"),
      ))
      .limit(1);

    res.json({
      tileIdx: stateRow?.tileIdx ?? 0,
      responses: (respRow?.content as Record<string, unknown>) ?? {},
    });
  } catch (err) {
    next(err);
  }
});

const putStateSchema = z.object({
  tileIdx: z.number().int().min(0),
  responses: z.record(z.unknown()).optional().default({}),
});

router.put("/state", async (req, res, next) => {
  try {
    const userId = req.userId;
    const { tileIdx, responses } = putStateSchema.parse(req.body);

    await db
      .insert(journeyStateTable)
      .values({ userId, tileIdx })
      .onConflictDoUpdate({
        target: journeyStateTable.userId,
        set: { tileIdx, updatedAt: new Date() },
      });

    const respId = `resp-${userId}`;
    await db
      .insert(journalEntriesTable)
      .values({ id: respId, userId, kind: "response", chapter: 0, content: responses })
      .onConflictDoUpdate({
        target: journalEntriesTable.id,
        set: { content: responses },
      });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ─── Journal Entries: stream + body ─── */

router.get("/entries", async (req, res, next) => {
  try {
    const userId = req.userId;
    const rows = await db
      .select()
      .from(journalEntriesTable)
      .where(and(
        eq(journalEntriesTable.userId, userId),
        inArray(journalEntriesTable.kind, ["stream", "body"]),
      ));

    const stream = rows.filter(r => r.kind === "stream").map(r => r.content);
    const body = rows.filter(r => r.kind === "body").map(r => r.content);

    res.json({ stream, body });
  } catch (err) {
    next(err);
  }
});

const putEntriesSchema = z.object({
  stream: z.array(z.object({
    id: z.string(),
    chapter: z.number().int(),
    text: z.string(),
    timestamp: z.number(),
  })).optional().default([]),
  body: z.array(z.object({
    id: z.string(),
    zoneId: z.string(),
    energyCenter: z.string(),
    chapter: z.number().int(),
    note: z.string(),
    timestamp: z.number(),
  })).optional().default([]),
});

router.put("/entries", async (req, res, next) => {
  try {
    const userId = req.userId;
    const { stream, body } = putEntriesSchema.parse(req.body);

    await db
      .delete(journalEntriesTable)
      .where(and(
        eq(journalEntriesTable.userId, userId),
        inArray(journalEntriesTable.kind, ["stream", "body"]),
      ));

    const toInsert = [
      ...stream.map(e => ({ id: e.id, userId, kind: "stream" as const, chapter: e.chapter, content: e })),
      ...body.map(e => ({ id: e.id, userId, kind: "body" as const, chapter: e.chapter, content: e })),
    ];

    if (toInsert.length > 0) {
      await db.insert(journalEntriesTable).values(toInsert);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ─── Readings: morpho/sage/horizon per chapter + cumulative ─── */

router.get("/readings", async (req, res, next) => {
  try {
    const userId = req.userId;
    const rows = await db
      .select()
      .from(readingsTable)
      .where(eq(readingsTable.userId, userId));

    const readings: Record<number, Record<string, unknown>> = {};
    let cumulative = null;

    for (const row of rows) {
      if (row.cumulative) {
        cumulative = row.data;
      } else {
        if (!readings[row.chapter]) readings[row.chapter] = {};
        readings[row.chapter][row.kind] = row.data;
      }
    }

    res.json({ readings, cumulative });
  } catch (err) {
    next(err);
  }
});

const putReadingsSchema = z.object({
  readings: z.record(z.string(), z.record(z.string(), z.unknown())).optional().default({}),
  cumulative: z.unknown().optional().nullable(),
});

router.put("/readings", async (req, res, next) => {
  try {
    const userId = req.userId;
    const { readings, cumulative } = putReadingsSchema.parse(req.body);

    await db.delete(readingsTable).where(eq(readingsTable.userId, userId));

    const toInsert: {
      id: string;
      userId: string;
      chapter: number;
      kind: string;
      cumulative: boolean;
      data: unknown;
    }[] = [];

    for (const [chIdxStr, chReadings] of Object.entries(readings)) {
      const chapter = parseInt(chIdxStr, 10);
      if (isNaN(chapter)) continue;
      for (const [kind, data] of Object.entries(chReadings)) {
        if (!data) continue;
        toInsert.push({
          id: `${userId}-${chapter}-${kind}`,
          userId,
          chapter,
          kind,
          cumulative: false,
          data,
        });
      }
    }

    if (cumulative) {
      toInsert.push({
        id: `${userId}-cumulative`,
        userId,
        chapter: -1,
        kind: "cumulative",
        cumulative: true,
        data: cumulative,
      });
    }

    if (toInsert.length > 0) {
      await db.insert(readingsTable).values(toInsert);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ─── Archive Unlocks ─── */

router.get("/archive", async (req, res, next) => {
  try {
    const userId = req.userId;
    const rows = await db
      .select({ id: archiveUnlocksTable.id })
      .from(archiveUnlocksTable)
      .where(eq(archiveUnlocksTable.userId, userId));

    const unlocked = rows.map(r => r.id.replace(`${userId}|`, ""));
    res.json({ unlocked });
  } catch (err) {
    next(err);
  }
});

const putArchiveSchema = z.object({
  unlocked: z.array(z.string()).optional().default([]),
});

router.put("/archive", async (req, res, next) => {
  try {
    const userId = req.userId;
    const { unlocked } = putArchiveSchema.parse(req.body);

    await db
      .delete(archiveUnlocksTable)
      .where(eq(archiveUnlocksTable.userId, userId));

    if (unlocked.length > 0) {
      const toInsert = unlocked.map(rawId => {
        const [chIdxStr, kind, ...titleParts] = rawId.split("|");
        return {
          id: `${userId}|${rawId}`,
          userId,
          chapterIdx: parseInt(chIdxStr, 10),
          kind: kind as "code" | "lore",
          title: titleParts.join("|"),
        };
      });
      await db.insert(archiveUnlocksTable).values(toInsert);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
