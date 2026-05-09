import { Router, type IRouter } from "express";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import { getAuth } from "@clerk/express";
import { db, submissionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const submissionSchema = z.object({
  mode: z.enum(["readings", "full"]),
  payload: z.record(z.unknown()),
});

async function resolveInternalUserId(clerkId: string): Promise<string> {
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

router.post("/", async (req, res, next) => {
  try {
    const { mode, payload } = submissionSchema.parse(req.body);

    const auth = getAuth(req);
    const clerkId = auth.userId ?? null;

    const userId = clerkId ? await resolveInternalUserId(clerkId) : null;

    const rawIp =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.ip ||
      "";
    const ipHash = rawIp
      ? createHash("sha256").update(rawIp).digest("hex").slice(0, 16)
      : null;

    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(submissionsTable).values({
      id,
      userId,
      clerkId,
      payload: { mode, ...payload },
      ipHash,
    });

    const webhookUrl = process.env.SUBMISSIONS_WEBHOOK_URL;
    if (webhookUrl) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, mode, userId, clerkId }),
        signal: controller.signal,
      })
        .catch((err: unknown) => {
          req.log.warn({ err }, "Webhook delivery failed (silent)");
        })
        .finally(() => clearTimeout(timeout));
    } else {
      req.log.info({ id, mode, userId, clerkId }, "New submission received (no webhook configured)");
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
