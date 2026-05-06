import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "connected";
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch {
    dbStatus = "error";
  }

  const aiStatus =
    process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL &&
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
      ? "configured"
      : "missing";

  res.json({
    ok: true,
    db: dbStatus,
    ai: aiStatus,
  });
});

export default router;
