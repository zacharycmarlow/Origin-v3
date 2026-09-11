import { Hono } from "hono";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const aiStatus = c.env.ANTHROPIC_API_KEY && c.env.ANTHROPIC_BASE_URL ? "configured" : "missing";

  // Check R2 availability — try listing one object
  let r2Status: string = "not-configured";
  if (c.env.R2) {
    try {
      await c.env.R2.list({ limit: 1 });
      r2Status = "ok";
    } catch {
      r2Status = "error";
    }
  }

  return c.json({ ok: true, db: "d1-bound", ai: aiStatus, r2: r2Status }, 200, {
    "Cache-Control": "no-store",
  });
});

export default app;
