import { Router, type IRouter } from "express";
import { z, ZodError } from "zod";
import { getAuth } from "@clerk/express";
import { db, waitlistTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

const waitlistSchema = z.object({
  email: z.string().email(),
});

async function resolveInternalUserId(clerkId: string): Promise<string | null> {
  try {
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
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

router.post("/", async (req, res, next) => {
  try {
    let parsed: { email: string };
    try {
      parsed = waitlistSchema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ ok: false, message: "Invalid email address." });
        return;
      }
      throw err;
    }

    const { email } = parsed;

    const auth = getAuth(req);
    const clerkId = auth.userId ?? null;
    const userId = clerkId ? await resolveInternalUserId(clerkId) : null;

    const id = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db
      .insert(waitlistTable)
      .values({ id, email, userId })
      .onConflictDoUpdate({
        target: waitlistTable.email,
        set: {
          userId,
          submittedAt: sql`now()`,
        },
      });

    req.log.info({ emailPrefix: email.slice(0, 4), userId }, "Waitlist signup");

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
