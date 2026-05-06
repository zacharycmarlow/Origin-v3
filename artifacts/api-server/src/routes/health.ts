import { Router, type IRouter } from "express";
import pg from "pg";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  // Check DB without importing the throwing @workspace/db module —
  // this way the route works even when DATABASE_URL is absent.
  let dbStatus: "connected" | "unconfigured" | "error" = "unconfigured";
  if (process.env.DATABASE_URL) {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      await client.query("SELECT 1");
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  const aiStatus =
    process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL &&
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
      ? "configured"
      : "missing";

  res.json({ ok: true, db: dbStatus, ai: aiStatus });
});

export default router;
