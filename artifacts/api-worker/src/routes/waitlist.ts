import { Hono } from "hono";
import { z, ZodError } from "zod";
import { eq, sql } from "drizzle-orm";
import { createD1Db, waitlistTable, usersTable } from "@workspace/db";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

const waitlistSchema = z.object({ email: z.string().email() });

async function resolveInternalUserId(db: ReturnType<typeof createD1Db>, clerkId: string): Promise<string | null> {
  try {
    const id = crypto.randomUUID();
    await db.insert(usersTable).values({ id, clerkId, email: "" }).onConflictDoNothing({ target: usersTable.clerkId });
    const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    return rows[0]?.id ?? null;
  } catch { return null; }
}

app.post("/", async (c) => {
  const db = createD1Db(c.env.DB);
  let parsed: { email: string };
  try {
    parsed = waitlistSchema.parse(await c.req.json());
  } catch (err) {
    if (err instanceof ZodError) return c.json({ ok: false, message: "Invalid email address." }, 400);
    throw err;
  }

  const { email } = parsed;
  let userId: string | null = null;
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ") && c.env.CLERK_SECRET_KEY) {
    try {
      const token = authHeader.slice(7);
      const verifyRes = await fetch(`https://api.clerk.com/v1/sessions/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${c.env.CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (verifyRes.ok) {
        const session = await verifyRes.json() as { user_id: string };
        userId = await resolveInternalUserId(db, session.user_id);
      }
    } catch { /* anonymous */ }
  }

  const id = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(waitlistTable).values({ id, email, userId }).onConflictDoUpdate({
    target: waitlistTable.email,
    set: { userId, submittedAt: sql`datetime('now')` },
  });

  return c.json({ ok: true });
});

export default app;
