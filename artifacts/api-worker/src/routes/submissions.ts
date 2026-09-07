import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createD1Db, submissionsTable, usersTable } from "@workspace/db";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

const submissionSchema = z.object({
  mode: z.enum(["readings", "full"]),
  payload: z.record(z.unknown()),
});

async function resolveInternalUserId(db: ReturnType<typeof createD1Db>, clerkId: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(usersTable).values({ id, clerkId, email: "" }).onConflictDoNothing({ target: usersTable.clerkId });
  const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  return rows[0].id;
}

app.post("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const { mode, payload } = submissionSchema.parse(await c.req.json());

  // Optional auth — submissions can be anonymous
  let userId: string | null = null;
  let clerkId: string | null = null;
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
        clerkId = session.user_id;
        userId = await resolveInternalUserId(db, clerkId);
      }
    } catch { /* anonymous submission */ }
  }

  const rawIp = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = rawIp ? await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp)).then(buf => [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("")) : null;

  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(submissionsTable).values({
    id, userId, clerkId,
    payload: JSON.stringify({ mode, ...payload }),
    ipHash,
  });

  return c.json({ ok: true });
});

export default app;
