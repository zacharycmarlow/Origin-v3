import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { withSentry } from "@sentry/cloudflare";

import healthRouter from "./routes/health";
import readingsRouter from "./routes/readings";
import userRouter from "./routes/user";
import submissionsRouter from "./routes/submissions";
import waitlistRouter from "./routes/waitlist";
import mediaRouter from "./routes/media";
import fellowshipRouter from "./routes/fellowship";
import birthDataRouter from "./routes/birth-data";
import youtubeRouter from "./routes/youtube";
import podcastRouter from "./routes/podcast";
import { validateEnv } from "./lib/env";

/* ═══════════════════════════════════════════════════════════════
   Origin API — Hono on Cloudflare Workers.

   This is the Workers-compatible replacement for the Express API
   server. It uses D1 for persistence and R2 for media storage.
   The Express server remains for local development; this worker
   is for production deployment on Cloudflare's edge network.

   Custom code: ~3% (route wiring + Privy auth verification).
   ═══════════════════════════════════════════════════════════════ */

export interface Env {
  DB: D1Database;
  R2?: R2Bucket;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_BASE_URL: string;
  PRIVY_APP_ID: string;
  CORS_ALLOWED_ORIGINS: string;
  R2_BUCKET: string;
  SENTRY_DSN?: string;
  RESEND_API_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

/* Request ID stored in c.var for error logging */
interface RequestIdVars {
  requestId: string;
}

const app = new Hono<{ Bindings: Env; Variables: RequestIdVars }>();

/* ── Env validation (4.4) ────────────────────────────────────── */
/* Validate at module load so missing required vars fail fast.    */
/* (The actual env is available per-request via c.env, but we     */
/* validate the shape here for type safety.)                      */

/* ── Security headers (4.2) ──────────────────────────────────── */
app.use("*", secureHeaders({
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  referrerPolicy: "no-referrer",
  xXssProtection: "1; mode=block",
  strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
}));

app.use("*", logger());

/* ── Request ID middleware (4.9) ─────────────────────────────── */
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("X-Request-ID", requestId);
  await next();
});

/* ── Request size limiting (4.5) ─────────────────────────────── */
app.use("*", async (c, next) => {
  const contentLength = c.req.header("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > 100 * 1024 * 1024) {
      return c.json({ error: "Request entity too large (max 100MB)" }, 413);
    }
  }
  await next();
});

/* ── CSRF protection (4.7) ───────────────────────────────────── */
app.use("*", csrf());

/* ── Rate limiting (4.1) — simple per-isolate in-memory limiter ── */
/* Cloudflare Workers isolates are short-lived, so this is a soft limit.
   For strict rate limiting, use Cloudflare Dashboard rate limiting rules. */
function rateLimit(windowMs: number, limit: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (c: any, next: any) => {
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
    const now = Date.now();
    let entry = hits.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count++;
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(Math.max(0, limit - entry.count)));
    if (entry.count > limit) {
      return c.json({ error: "Too many requests" }, 429);
    }
    await next();
  };
}

/* ── Rate limiting (4.1) — general: 100 req/min per IP ───────── */
app.use("*", rateLimit(60 * 1000, 100));

/* ── Rate limiting (4.1) — expensive ops: 10 req/min per IP ──── */
app.use("/api/readings/*", rateLimit(60 * 1000, 10));
app.use("/api/media/*", rateLimit(60 * 1000, 10));

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

/* ── Env validation at first request (4.4) ───────────────────── */
app.use("*", async (c, next) => {
  try {
    validateEnv(c.env as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[env] validation failed:", err);
    return c.json({ error: "Server misconfigured" }, 500);
  }
  await next();
});

app.route("/api/healthz", healthRouter);
app.route("/api/readings", readingsRouter);
app.route("/api/user", userRouter);
app.route("/api/submissions", submissionsRouter);
app.route("/api/waitlist", waitlistRouter);
app.route("/api/media", mediaRouter);
app.route("/api/fellowship", fellowshipRouter);
app.route("/api/birth-data", birthDataRouter);
app.route("/api/youtube", youtubeRouter);
app.route("/api/podcast", podcastRouter);

/* ── Error handling middleware (4.6) ─────────────────────────── */
app.onError((err, c) => {
  const requestId = c.get("requestId") || crypto.randomUUID();
  console.error(`[error] requestId=${requestId}`, err);
  return c.json({ error: "Internal server error", requestId }, 500);
});

/* ── Sentry (8.1) — only init if SENTRY_DSN is present ───────── */
export default withSentry<Env>(
  (env) => {
    if (!env.SENTRY_DSN) return undefined;
    return { dsn: env.SENTRY_DSN };
  },
  app,
);
