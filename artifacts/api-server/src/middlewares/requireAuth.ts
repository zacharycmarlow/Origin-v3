import type { Request, Response, NextFunction } from "express";
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

async function getOrCreateUser(clerkId: string): Promise<string> {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);
  if (rows.length > 0) return rows[0].id;
  const id = randomUUID();
  await db.insert(usersTable).values({ id, clerkId, email: "" });
  return id;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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
}
