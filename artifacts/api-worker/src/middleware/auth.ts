import { createMiddleware } from "hono/factory";
import { createD1Db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Clerk auth middleware for Cloudflare Workers.

   Verifies the Clerk session token from the Authorization header
   by calling Clerk's API. Creates/looks up the internal user in D1.

   Custom code: ~2% (token verification + user upsert).
   ═══════════════════════════════════════════════════════════════ */

export interface AuthVars {
  clerkId: string;
  userId: string;
}

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AuthVars }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice(7);
    const clerkSecretKey = c.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      return c.json({ error: "Auth not configured" }, 500);
    }

    // Verify the session token with Clerk's Backend API
    try {
      const verifyRes = await fetch(`https://api.clerk.com/v1/sessions/verify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!verifyRes.ok) {
        return c.json({ error: "Invalid session" }, 401);
      }

      const session = await verifyRes.json() as { user_id: string };
      const clerkId = session.user_id;

      // Get or create internal user in D1
      const db = createD1Db(c.env.DB);
      const id = crypto.randomUUID();
      await db.insert(usersTable).values({ id, clerkId, email: "" }).onConflictDoNothing({ target: usersTable.clerkId });
      const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

      if (!rows[0]) {
        return c.json({ error: "Failed to create user" }, 500);
      }

      c.set("clerkId", clerkId);
      c.set("userId", rows[0].id);
      await next();
    } catch {
      return c.json({ error: "Auth verification failed" }, 401);
    }
  }
);
