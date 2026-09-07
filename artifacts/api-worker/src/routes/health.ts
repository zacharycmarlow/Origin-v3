import { Hono } from "hono";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  const aiStatus = c.env.ANTHROPIC_API_KEY && c.env.ANTHROPIC_BASE_URL ? "configured" : "missing";
  return c.json({ ok: true, db: "d1-bound", ai: aiStatus });
});

export default app;
