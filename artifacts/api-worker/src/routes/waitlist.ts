import { Hono } from "hono";
import { z, ZodError } from "zod";
import { eq, sql } from "drizzle-orm";
import { createD1Db, waitlistTable, usersTable } from "@workspace/db";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

const waitlistSchema = z.object({ email: z.string().email() });

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
function getJWKS(appId: string) {
  let jwks = jwksCache.get(appId);
  if (!jwks) {
    const url = new URL(`https://auth.privy.io/api/v1/applications/${appId}/jwks`);
    jwks = createRemoteJWKSet(url);
    jwksCache.set(appId, jwks);
  }
  return jwks;
}

async function resolveInternalUserId(db: ReturnType<typeof createD1Db>, privyId: string): Promise<string | null> {
  try {
    const id = crypto.randomUUID();
    await db.insert(usersTable).values({ id, privyId, email: "" }).onConflictDoNothing({ target: usersTable.privyId });
    const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.privyId, privyId)).limit(1);
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
  if (authHeader?.startsWith("Bearer ") && c.env.PRIVY_APP_ID) {
    try {
      const token = authHeader.slice(7);
      const jwks = getJWKS(c.env.PRIVY_APP_ID);
      const { payload } = await jwtVerify(token, jwks, { issuer: "privy" });
      if (payload.sub) {
        userId = await resolveInternalUserId(db, payload.sub);
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
