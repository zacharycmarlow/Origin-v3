import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      clerkId: string;
      userId: string;
    }
  }
}

// Atomic upsert: insert then do-nothing on the clerkId unique constraint,
// then select. This is safe under concurrent requests (e.g. the 4-parallel
// pullAll calls fired immediately after sign-in) because the DB enforces the
// constraint — no race between select+insert can produce duplicate rows or 500s.
async function getOrCreateUser(clerkId: string): Promise<string> {
  const id = randomUUID();
  await db
    .insert(usersTable)
    .values({ id, clerkId, email: "" })
    .onConflictDoNothing({ target: usersTable.clerkId });
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);
  return rows[0].id;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const userId = await getOrCreateUser(clerkId);
    req.clerkId = clerkId;
    req.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
};
