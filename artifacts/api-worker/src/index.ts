import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";

import healthRouter from "./routes/health";
import readingsRouter from "./routes/readings";
import userRouter from "./routes/user";
import submissionsRouter from "./routes/submissions";
import waitlistRouter from "./routes/waitlist";
import mediaRouter from "./routes/media";

/* ═══════════════════════════════════════════════════════════════
   Origin API — Hono on Cloudflare Workers.

   This is the Workers-compatible replacement for the Express API
   server. It uses D1 for persistence and R2 for media storage.
   The Express server remains for local development; this worker
   is for production deployment on Cloudflare's edge network.

   Custom code: ~3% (route wiring + Clerk auth verification).
   ═══════════════════════════════════════════════════════════════ */

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_BASE_URL: string;
  CLERK_SECRET_KEY: string;
  CORS_ALLOWED_ORIGINS: string;
  R2_BUCKET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", compress());

// CORS — restrict to trusted origins
app.use("*", cors({
  origin: (origin, c) => {
    const allowed = (c.env.CORS_ALLOWED_ORIGINS || "").split(",").map((s: string) => s.trim());
    if (!origin || allowed.includes(origin)) return origin;
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.route("/api/healthz", healthRouter);
app.route("/api/readings", readingsRouter);
app.route("/api/user", userRouter);
app.route("/api/submissions", submissionsRouter);
app.route("/api/waitlist", waitlistRouter);
app.route("/api/media", mediaRouter);

export default app;
