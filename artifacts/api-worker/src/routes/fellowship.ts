import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import {
  createD1Db,
  podsTable,
  podMembersTable,
  podSubmissionsTable,
} from "@workspace/db";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Fellowship (Pods) routes — walking the Origin together.

   A pod advances chapter by chapter; members share chosen
   responses with the pod, and the pod gates on everyone's
   submissions.

   Custom code: ~3% (route wiring + pod CRUD).
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use("*", requireAuth);

/* Generate a short human-readable invite code */
function makeInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

/* ── POST /api/fellowship/pods — create a pod ── */
const createPodSchema = z.object({
  name: z.string().min(1).max(100),
  gate: z.enum(["strict", "soft"]).optional().default("strict"),
});

app.post("/pods", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const body = createPodSchema.parse(await c.req.json());

  const id = crypto.randomUUID();
  const inviteCode = makeInviteCode();
  const now = new Date().toISOString();

  await db.insert(podsTable).values({
    id,
    name: body.name,
    inviteCode,
    createdBy: userId,
    gate: body.gate,
    createdAt: now,
  });

  // Creator becomes a keeper member
  await db.insert(podMembersTable).values({
    id: crypto.randomUUID(),
    podId: id,
    userId,
    role: "keeper",
    joinedAt: now,
  });

  return c.json({
    data: { id, name: body.name, inviteCode, gate: body.gate, role: "keeper" },
  }, 201);
});

/* ── GET /api/fellowship/pods — list user's pods ── */
app.get("/pods", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");

  const memberships = await db
    .select()
    .from(podMembersTable)
    .where(eq(podMembersTable.userId, userId));

  if (memberships.length === 0) return c.json({ data: [] });

  const podIds = memberships.map((m) => m.podId);
  const pods = await db.select().from(podsTable);

  const userPods = pods
    .filter((p) => podIds.includes(p.id))
    .map((p) => {
      const membership = memberships.find((m) => m.podId === p.id);
      return { ...p, role: membership?.role ?? "member" };
    });

  return c.json({ data: userPods });
});

/* ── POST /api/fellowship/pods/:id/join — join with invite code ── */
const joinSchema = z.object({ inviteCode: z.string().min(1) });

app.post("/pods/:id/join", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const podId = c.req.param("id");
  const { inviteCode } = joinSchema.parse(await c.req.json());

  const [pod] = await db
    .select()
    .from(podsTable)
    .where(and(eq(podsTable.id, podId), eq(podsTable.inviteCode, inviteCode)))
    .limit(1);

  if (!pod) return c.json({ error: "Invalid pod or invite code" }, 404);

  // Check existing membership
  const [existing] = await db
    .select()
    .from(podMembersTable)
    .where(and(eq(podMembersTable.podId, podId), eq(podMembersTable.userId, userId)))
    .limit(1);

  if (existing) return c.json({ data: { alreadyMember: true, role: existing.role } });

  await db.insert(podMembersTable).values({
    id: crypto.randomUUID(),
    podId,
    userId,
    role: "member",
    joinedAt: new Date().toISOString(),
  });

  return c.json({ data: { joined: true, role: "member" } }, 201);
});

/* ── POST /api/fellowship/pods/:id/submit — submit chapter to pod ── */
const submitSchema = z.object({
  chapter: z.number().int().min(1).max(7),
});

app.post("/pods/:id/submit", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const podId = c.req.param("id");
  const { chapter } = submitSchema.parse(await c.req.json());

  // Verify membership
  const [membership] = await db
    .select()
    .from(podMembersTable)
    .where(and(eq(podMembersTable.podId, podId), eq(podMembersTable.userId, userId)))
    .limit(1);

  if (!membership) return c.json({ error: "Not a member of this pod" }, 403);

  // Upsert submission (one per member per chapter)
  const subId = `${podId}|${userId}|${chapter}`;
  await db
    .insert(podSubmissionsTable)
    .values({
      id: subId,
      podId,
      userId,
      chapter,
      submittedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: podSubmissionsTable.id,
      set: { submittedAt: new Date().toISOString() },
    });

  return c.json({ data: { submitted: true, chapter } }, 201);
});

/* ── GET /api/fellowship/pods/:id/submissions — list pod submissions ── */
app.get("/pods/:id/submissions", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const podId = c.req.param("id");

  // Verify membership
  const [membership] = await db
    .select()
    .from(podMembersTable)
    .where(and(eq(podMembersTable.podId, podId), eq(podMembersTable.userId, userId)))
    .limit(1);

  if (!membership) return c.json({ error: "Not a member of this pod" }, 403);

  const submissions = await db
    .select()
    .from(podSubmissionsTable)
    .where(eq(podSubmissionsTable.podId, podId));

  return c.json({ data: submissions });
});

export default app;
