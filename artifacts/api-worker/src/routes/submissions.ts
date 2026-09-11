import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createD1Db, submissionsTable, usersTable } from "@workspace/db";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

const submissionSchema = z.object({
  mode: z.enum(["readings", "full"]),
  payload: z.record(z.unknown()),
});

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

async function resolveInternalUserId(db: ReturnType<typeof createD1Db>, privyId: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(usersTable).values({ id, privyId, email: "" }).onConflictDoNothing({ target: usersTable.privyId });
  const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.privyId, privyId)).limit(1);
  return rows[0].id;
}

app.post("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const { mode, payload } = submissionSchema.parse(await c.req.json());

  // Optional auth — submissions can be anonymous
  let userId: string | null = null;
  let privyId: string | null = null;
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ") && c.env.PRIVY_APP_ID) {
    try {
      const token = authHeader.slice(7);
      const jwks = getJWKS(c.env.PRIVY_APP_ID);
      const { payload: jwtPayload } = await jwtVerify(token, jwks, { issuer: "privy" });
      if (jwtPayload.sub) {
        privyId = jwtPayload.sub;
        userId = await resolveInternalUserId(db, privyId);
      }
    } catch { /* anonymous submission */ }
  }

  const rawIp = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = rawIp ? await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp)).then(buf => [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("")) : null;

  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(submissionsTable).values({
    id, userId, privyId,
    payload: JSON.stringify({ mode, ...payload }),
    ipHash,
  });

  return c.json({ ok: true });
});

export default app;
