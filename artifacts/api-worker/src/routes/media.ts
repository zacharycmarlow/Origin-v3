import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createD1Db, mediaTable } from "@workspace/db";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Media routes — R2 direct upload from Workers.

   On Workers, we use the R2 binding directly (no presigned URLs
   needed — the worker writes to R2 directly). For large files,
   the frontend can still use presigned URLs via a separate endpoint
   that generates them using the S3 API.

   Custom code: ~2% (route wiring + R2 put/get).
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use("*", requireAuth);

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "text/markdown",
  "application/vnd.oasis.opendocument.text",
  "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/webm", "audio/mp4",
  "video/mp4", "video/webm", "video/quicktime",
]);

function inferKind(contentType: string): "photo" | "document" | "audio" | "video" {
  if (contentType.startsWith("image/")) return "photo";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("video/")) return "video";
  return "document";
}

/* POST /api/media — upload file directly to R2 via worker */
app.post("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "No file provided" }, 400);

  if (!ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: `File type ${file.type} is not allowed` }, 400);
  }
  if (file.size > 100 * 1024 * 1024) {
    return c.json({ error: "File too large (max 100MB)" }, 400);
  }

  const ext = file.name.split(".").pop() || "bin";
  const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`;

  // Upload to R2 directly
  await c.env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const id = crypto.randomUUID();
  const kind = inferKind(file.type);
  await db.insert(mediaTable).values({
    id, userId, r2Key: key, contentType: file.type, size: file.size,
    kind, originalName: file.name,
  });

  return c.json({ data: { id, key, kind, contentType: file.type, size: file.size } }, 201);
});

/* GET /api/media — list user's media */
app.get("/", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const media = await db.select().from(mediaTable).where(eq(mediaTable.userId, userId));
  return c.json({ data: media });
});

/* GET /api/media/:id — get media file from R2 */
app.get("/:id", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [media] = await db.select().from(mediaTable).where(and(eq(mediaTable.id, id), eq(mediaTable.userId, userId))).limit(1);
  if (!media) return c.json({ error: "Not found" }, 404);

  const object = await c.env.R2.get(media.r2Key);
  if (!object) return c.json({ error: "File not found in R2" }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", media.contentType);
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(object.body, { headers });
});

/* DELETE /api/media/:id — delete from R2 + D1 */
app.delete("/:id", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [media] = await db.select().from(mediaTable).where(and(eq(mediaTable.id, id), eq(mediaTable.userId, userId))).limit(1);
  if (!media) return c.json({ error: "Not found" }, 404);

  await c.env.R2.delete(media.r2Key);
  await db.delete(mediaTable).where(and(eq(mediaTable.id, id), eq(mediaTable.userId, userId)));

  return c.json({ data: { deleted: true } });
});

export default app;
