import { Router, type IRouter } from "express";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";
import { db, mediaTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router: IRouter = Router();

/* R2 / S3-compatible client — lazy singleton */
let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (_s3) return _s3;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  }
  _s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _s3;
}

const R2_BUCKET = process.env.R2_BUCKET || "origin-media";

/* Allowed file types */
const ALLOWED_TYPES = new Set([
  // Images
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/gif",
  // Documents
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", "text/markdown",
  "application/vnd.oasis.opendocument.text",
  // Audio
  "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/webm", "audio/mp4",
  // Video
  "video/mp4", "video/webm", "video/quicktime",
]);

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  size: z.number().int().positive().max(MAX_SIZE),
});

/* POST /api/media/presign — get a presigned URL + generated key for direct upload to R2 */
router.post("/presign", requireAuth, async (req, res, next) => {
  try {
    const body = presignSchema.parse(req.body);
    if (!ALLOWED_TYPES.has(body.contentType)) {
      res.status(400).json({ error: `File type ${body.contentType} is not allowed` });
      return;
    }

    const userId = req.userId;
    const ext = body.filename.split(".").pop() || "bin";
    const key = `uploads/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: body.contentType,
      ContentLength: body.size,
    });

    const signedUrl = await getSignedUrl(getS3(), command, { expiresIn: 600 });

    res.json({ data: { uploadUrl: signedUrl, key, publicUrl: `/${key}` } });
  } catch (err) {
    next(err);
  }
});

const presignKeySchema = z.object({
  key: z.string().min(1),
  method: z.enum(["PUT", "DELETE", "POST", "GET"]),
});

/* POST /api/media/presign-key — sign an existing key (used by Uppy's AwsS3 plugin) */
router.post("/presign-key", requireAuth, async (req, res, next) => {
  try {
    const body = presignKeySchema.parse(req.body);
    const userId = req.userId;

    // Verify the key belongs to this user
    if (!body.key.startsWith(`uploads/${userId}/`)) {
      res.status(403).json({ error: "Key does not belong to user" });
      return;
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: body.key,
    });

    const signedUrl = await getSignedUrl(getS3(), command, { expiresIn: 600 });

    res.json({ data: { uploadUrl: signedUrl } });
  } catch (err) {
    next(err);
  }
});

/* POST /api/media/confirm — confirm upload and store metadata */
const confirmSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  kind: z.enum(["photo", "document", "audio", "video"]),
  originalName: z.string().optional(),
  entryId: z.string().optional(),
  extractedText: z.string().optional(),
});

router.post("/confirm", requireAuth, async (req, res, next) => {
  try {
    const body = confirmSchema.parse(req.body);
    const userId = req.userId;

    const id = randomUUID();
    const [media] = await db
      .insert(mediaTable)
      .values({
        id,
        userId,
        entryId: body.entryId || null,
        r2Key: body.key,
        contentType: body.contentType,
        size: body.size,
        kind: body.kind,
        originalName: body.originalName || null,
        extractedText: body.extractedText || null,
      })
      .returning();

    res.json({ data: media });
  } catch (err) {
    next(err);
  }
});

/* GET /api/media — list user's media */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const media = await db.select().from(mediaTable).where(eq(mediaTable.userId, userId));
    res.json({ data: media });
  } catch (err) {
    next(err);
  }
});

/* DELETE /api/media/:id — delete media (from R2 + DB) */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const mediaId = String(req.params.id);
    // TODO: Delete from R2 as well
    await db.delete(mediaTable).where(and(eq(mediaTable.id, mediaId), eq(mediaTable.userId, userId)));
    res.json({ data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
