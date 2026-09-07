import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createD1Db, birthDataTable } from "@workspace/db";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Birth data routes — save/retrieve user birth data.

   Used for archetype context in readings.
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use("*", requireAuth);

app.get("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const [row] = await db.select().from(birthDataTable).where(eq(birthDataTable.userId, userId)).limit(1);
  return c.json({ data: row || null });
});

const putSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string().optional().default(""),
  birthPlace: z.string().optional().default(""),
  archetypeContext: z.string().optional().default(""),
  computation: z.string().optional().default(""),
});

app.put("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const body = putSchema.parse(await c.req.json());
  const now = new Date().toISOString();

  await db.insert(birthDataTable).values({
    userId, birthDate: body.birthDate, birthTime: body.birthTime,
    birthPlace: body.birthPlace, archetypeContext: body.archetypeContext,
    computation: body.computation,
  }).onConflictDoUpdate({
    target: birthDataTable.userId,
    set: {
      birthDate: body.birthDate, birthTime: body.birthTime,
      birthPlace: body.birthPlace, archetypeContext: body.archetypeContext,
      computation: body.computation, updatedAt: now,
    },
  });

  return c.json({ ok: true });
});

export default app;
