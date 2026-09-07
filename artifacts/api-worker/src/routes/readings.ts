import { Hono } from "hono";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import {
  MORPHO_SYSTEM, MORPHO_CUMULATIVE_APPENDIX,
  SAGE_SYSTEM, SAGE_CUMULATIVE_APPENDIX,
  HORIZON_SYSTEM, HORIZON_CUMULATIVE_APPENDIX,
  MARGINS_SYSTEM, STORYTELLER_SYSTEM, STORYTELLER_ORIGIN_APPENDIX,
} from "../../../api-server/src/routes/readings/prompts";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Readings routes — Anthropic AI on Cloudflare Workers.

   Mirrors the Express readings routes. Uses the Anthropic SDK
   directly with the AI Gateway base URL if configured.

   Custom code: ~2% (route wiring + prompt assembly).
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env }>();

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5";

const beatSchema = z.object({
  title: z.string(), thread: z.string().optional().default(""), text: z.string(),
});

function formatBeats(beats: { title: string; thread?: string; text: string }[]): string {
  return beats.map((b, i) => `Beat ${i + 1} — ${b.title}${b.thread ? ` (${b.thread})` : ""}:\n${b.text || "[no response written]"}`).join("\n\n");
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return t.trim();
}

function safeParseJson(raw: string): unknown {
  const cleaned = stripJsonFence(raw);
  try { return JSON.parse(cleaned); }
  catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
    throw new Error("Model did not return valid JSON");
  }
}

function getClient(env: Env): Anthropic {
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: env.ANTHROPIC_BASE_URL,
  });
}

async function callAnthropic(env: Env, opts: { system: string; userContent: string; model: string; maxTokens: number }): Promise<unknown> {
  const client = getClient(env);
  const message = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: opts.userContent }],
  });
  const block = message.content[0];
  const text = block && block.type === "text" ? block.text : "";
  return safeParseJson(text);
}

/* ── Morpho ── */
const morphoBodySchema = z.object({
  chapterNumber: z.number().int().min(1).max(7),
  chapterTitle: z.string(),
  beats: z.array(beatSchema).min(1),
  previousChapters: z.array(z.object({
    chapterNumber: z.number(), chapterTitle: z.string(),
    beats: z.array(beatSchema), morpho: z.unknown().optional(),
  })).optional().default([]),
  cumulative: z.boolean().optional().default(false),
});

app.post("/morpho", async (c) => {
  const body = morphoBodySchema.parse(await c.req.json());
  const system = body.cumulative ? MORPHO_SYSTEM + MORPHO_CUMULATIVE_APPENDIX : MORPHO_SYSTEM;
  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;
  if (body.previousChapters.length > 0) {
    userContent += `\n\n---\n\nPREVIOUS CHAPTERS (for cross-chapter memory):\n`;
    for (const pc of body.previousChapters) {
      userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
      if (pc.morpho) userContent += `\nMorpho reading for that chapter:\n${JSON.stringify(pc.morpho)}\n`;
    }
  }
  const data = await callAnthropic(c.env, { system, userContent, model: SONNET, maxTokens: 8192 });
  return c.json({ data });
});

/* ── Sage ── */
const sageBodySchema = morphoBodySchema.extend({
  morpho: z.unknown(),
  previousChapters: z.array(z.object({
    chapterNumber: z.number(), chapterTitle: z.string(),
    beats: z.array(beatSchema), morpho: z.unknown().optional(), sage: z.unknown().optional(),
  })).optional().default([]),
});

app.post("/sage", async (c) => {
  const body = sageBodySchema.parse(await c.req.json());
  const system = body.cumulative ? SAGE_SYSTEM + SAGE_CUMULATIVE_APPENDIX : SAGE_SYSTEM;
  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;
  userContent += `\n\n---\n\nMorpho Reading:\n${JSON.stringify(body.morpho)}`;
  if (body.previousChapters.length > 0) {
    userContent += `\n\n---\n\nPREVIOUS CHAPTERS:\n`;
    for (const pc of body.previousChapters) {
      userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
      if (pc.morpho) userContent += `\nMorpho: ${JSON.stringify(pc.morpho)}\n`;
      if (pc.sage) userContent += `\nSage: ${JSON.stringify(pc.sage)}\n`;
    }
  }
  const data = await callAnthropic(c.env, { system, userContent, model: SONNET, maxTokens: 8192 });
  return c.json({ data });
});

/* ── Margins ── */
app.post("/margins", async (c) => {
  const body = z.object({
    chapterNumber: z.number().int().min(1).max(7), chapterTitle: z.string(),
    movementTitle: z.string(), question: z.string().optional().default(""),
    text: z.string().min(1), archetypeContext: z.string().optional().default(""),
  }).parse(await c.req.json());

  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\nMovement (page): ${body.movementTitle}\nWhat the page asked of them: ${body.question || "[open writing]"}\n\nWhat they wrote:\n${body.text}`;
  if (body.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;

  const data = await callAnthropic(c.env, { system: MARGINS_SYSTEM, userContent, model: SONNET, maxTokens: 2048 });
  return c.json({ data });
});

/* ── Synthesis ── */
app.post("/synthesis", async (c) => {
  const body = z.object({
    chapterNumber: z.number().int().min(1).max(7), chapterTitle: z.string(),
    beats: z.array(beatSchema).min(1), morpho: z.unknown().optional(),
    previousSyntheses: z.array(z.object({ chapterNumber: z.number(), title: z.string(), story: z.string() })).optional().default([]),
    archetypeContext: z.string().optional().default(""),
  }).parse(await c.req.json());

  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;
  if (body.morpho) userContent += `\n\n---\nMorpho reading (compass only — never quote):\n${JSON.stringify(body.morpho)}`;
  if (body.previousSyntheses.length > 0) {
    userContent += `\n\n---\nPREVIOUS CHAPTER TELLINGS (for continuity of image and thread):\n`;
    for (const ps of body.previousSyntheses) userContent += `\n## Chapter ${ps.chapterNumber} — ${ps.title}\n${ps.story}\n`;
  }
  if (body.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;

  const data = await callAnthropic(c.env, { system: STORYTELLER_SYSTEM, userContent, model: SONNET, maxTokens: 4096 });
  return c.json({ data });
});

/* ── Origin Story ── */
app.post("/originstory", async (c) => {
  const body = z.object({
    chapters: z.array(z.object({
      chapterNumber: z.number(), chapterTitle: z.string(),
      beats: z.array(beatSchema), synthesis: z.object({ title: z.string(), story: z.string() }).optional(),
    })).min(7),
    archetypeContext: z.string().optional().default(""),
  }).parse(await c.req.json());

  let userContent = `THE FULL MATERIAL — all seven chapters:\n`;
  for (const ch of body.chapters) {
    userContent += `\n=== Chapter ${ch.chapterNumber}: ${ch.chapterTitle} ===\n${formatBeats(ch.beats)}\n`;
    if (ch.synthesis) userContent += `\nChapter telling already woven — "${ch.synthesis.title}":\n${ch.synthesis.story}\n`;
  }
  if (body.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;

  const data = await callAnthropic(c.env, { system: STORYTELLER_SYSTEM + STORYTELLER_ORIGIN_APPENDIX, userContent, model: SONNET, maxTokens: 8192 });
  return c.json({ data });
});

/* ── Horizon ── */
app.post("/horizon", async (c) => {
  const body = z.object({
    chapterNumber: z.number().int().min(1).max(7), chapterTitle: z.string(),
    morphoThroughLine: z.string().optional().default(""),
    morphoSubtext: z.string().optional().default(""),
    sageResonance: z.string().optional().default(""),
    cumulative: z.boolean().optional().default(false),
  }).parse(await c.req.json());

  const system = body.cumulative ? HORIZON_SYSTEM + HORIZON_CUMULATIVE_APPENDIX : HORIZON_SYSTEM;
  const userContent = `Chapter just completed: ${body.chapterNumber} — ${body.chapterTitle}\n\nMorpho Through-line: ${body.morphoThroughLine || "[none]"}\nMorpho Subtext: ${body.morphoSubtext || "[none]"}\nSage Resonance summary: ${body.sageResonance || "[none]"}\n\nGenerate the integration prompt.`;

  const data = await callAnthropic(c.env, { system, userContent, model: HAIKU, maxTokens: 8192 });
  return c.json({ data });
});

export default app;
