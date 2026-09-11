import { createMiddleware } from "hono/factory";
import { createD1Db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Privy auth middleware for Cloudflare Workers.

   Verifies the Privy access token (JWT) from the Authorization
   header using Privy's JWKS endpoint. Creates/looks up the internal
   user in D1.

   The frontend obtains the token via Privy's getAccessToken() and
   sends it as `Authorization: Bearer <token>`.

   Custom code: ~2% (token verification + user upsert).
   ═══════════════════════════════════════════════════════════════ */

export interface AuthVars {
  privyId: string;
  userId: string;
}

// Privy JWKS endpoint — cached per app ID.
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

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AuthVars }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice(7);
    const privyAppId = c.env.PRIVY_APP_ID;
    if (!privyAppId) {
      return c.json({ error: "Auth not configured" }, 500);
    }

    try {
      // Verify the Privy JWT using Privy's JWKS
      const jwks = getJWKS(privyAppId);
      const { payload } = await jwtVerify(token, jwks, {
        issuer: "privy",
        // Privy tokens don't have a fixed audience; verify the issuer only.
      });

      const privyId = payload.sub;
      if (!privyId) {
        return c.json({ error: "Invalid token: missing subject" }, 401);
      }

      // Get or create internal user in D1
      const db = createD1Db(c.env.DB);
      const id = crypto.randomUUID();
      await db.insert(usersTable).values({ id, privyId, email: "" }).onConflictDoNothing({ target: usersTable.privyId });
      const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.privyId, privyId)).limit(1);

      if (!rows[0]) {
        return c.json({ error: "Failed to create user" }, 500);
      }

      c.set("privyId", privyId);
      c.set("userId", rows[0].id);
      await next();
    } catch {
      return c.json({ error: "Auth verification failed" }, 401);
    }
  }
);
