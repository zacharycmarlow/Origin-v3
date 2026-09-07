import { Hono, type Context } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import {
  MORPHO_SYSTEM, MORPHO_CUMULATIVE_APPENDIX,
  SAGE_SYSTEM, SAGE_CUMULATIVE_APPENDIX,
  HORIZON_SYSTEM, HORIZON_CUMULATIVE_APPENDIX,
  MARGINS_SYSTEM, STORYTELLER_SYSTEM, STORYTELLER_ORIGIN_APPENDIX,
} from "@workspace/prompts";
import { createD1Db, readingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Readings routes — Anthropic AI on Cloudflare Workers.

   Features:
   - Prompt caching (cache_control: ephemeral) for system prompts
   - SSE streaming for real-time word-by-word reveal
   - Retry with error feedback on JSON parse failure
   - Model fallback chain (Sonnet → Haiku)
   - DB caching of readings (beats hash check)
   - Haiku for Margins and Horizon (cost optimization)
   - Crisis/safety detection in user writing
   - Voice cleanup endpoint for speech-to-text output
   - Citations support for source grounding

   Custom code: ~3% (route wiring + prompt assembly + caching).
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

/* Cache-Control: private, no-store for all readings responses (4.15) */
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "private, no-store");
});

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5";

const beatSchema = z.object({
  title: z.string(), thread: z.string().optional().default(""), text: z.string(),
});

/* ── Crisis/safety keywords ── */
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die", "hurt myself",
  "self-harm", "cutting", "overdose", "no reason to live", "better off dead",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

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

/* ── Beats hash for DB caching ── */
async function beatsHash(beats: { title: string; text: string }[]): Promise<string> {
  const text = beats.map(b => `${b.title}:${b.text}`).join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function getClient(env: Env): Anthropic {
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: env.ANTHROPIC_BASE_URL,
  });
}

/* ── Call Anthropic with retry + model fallback ── */
async function callAnthropic(env: Env, opts: {
  system: string; userContent: string; model: string; maxTokens: number;
  fallbackModel?: string;
}): Promise<unknown> {
  const client = getClient(env);

  const tryCall = async (model: string): Promise<string> => {
    const message = await client.messages.create({
      model,
      max_tokens: opts.maxTokens,
      system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: opts.userContent }],
    });
    const block = message.content[0];
    return block && block.type === "text" ? block.text : "";
  };

  // First attempt
  try {
    const text = await tryCall(opts.model);
    return safeParseJson(text);
  } catch (err) {
    // If JSON parse failed, retry with error feedback
    if (err instanceof Error && err.message.includes("JSON")) {
      try {
        const retryMessage = await client.messages.create({
          model: opts.model,
          max_tokens: opts.maxTokens,
          system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
          messages: [
            { role: "user", content: opts.userContent },
            { role: "assistant", content: "I will return valid JSON." },
            { role: "user", content: "Your previous response was not valid JSON. Return ONLY a valid JSON object matching the schema. No markdown fences, no prose before or after." },
          ],
        });
        const block = retryMessage.content[0];
        const text = block && block.type === "text" ? block.text : "";
        return safeParseJson(text);
      } catch {
        // Fall through to model fallback
      }
    }
    // Model fallback
    if (opts.fallbackModel && opts.fallbackModel !== opts.model) {
      const text = await tryCall(opts.fallbackModel);
      return safeParseJson(text);
    }
    throw err;
  }
}

/* ── DB-cached reading call ── */
async function callWithCache(
  c: Context<{ Bindings: Env; Variables: AuthVars }>,
  opts: { system: string; userContent: string; model: string; maxTokens: number; fallbackModel?: string; cacheKey: { chapter: number; kind: string; beats: { title: string; text: string }[] } },
): Promise<unknown> {
  // Check DB cache (only for authenticated users)
  const userId = c.get("userId") as string | undefined;
  if (userId) {
    const db = createD1Db(c.env.DB);
    const hash = await beatsHash(opts.cacheKey.beats);
    const cacheId = `${userId}-${opts.cacheKey.chapter}-${opts.cacheKey.kind}-${hash}`;
    const [existing] = await db.select({ data: readingsTable.data }).from(readingsTable)
      .where(and(eq(readingsTable.id, cacheId), eq(readingsTable.userId, userId))).limit(1);
    if (existing) return JSON.parse(existing.data);
  }

  const data = await callAnthropic(c.env, opts);

  // Save to cache
  if (userId) {
    const db = createD1Db(c.env.DB);
    const hash = await beatsHash(opts.cacheKey.beats);
    const cacheId = `${userId}-${opts.cacheKey.chapter}-${opts.cacheKey.kind}-${hash}`;
    await db.insert(readingsTable).values({
      id: cacheId, userId, chapter: opts.cacheKey.chapter, kind: opts.cacheKey.kind,
      cumulative: false, data: JSON.stringify(data),
    }).onConflictDoUpdate({ target: readingsTable.id, set: { data: JSON.stringify(data) } });
  }

  return data;
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
  if (detectCrisis(body.beats.map(b => b.text).join(" "))) {
    return c.json({ data: { crisisWarning: true, message: "If you're in crisis, please reach out. You can call or text 988 (Suicide & Crisis Lifeline) in the US, or find local resources at findahelpline.com." } }, 200);
  }
  const system = body.cumulative ? MORPHO_SYSTEM + MORPHO_CUMULATIVE_APPENDIX : MORPHO_SYSTEM;
  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;
  if (body.previousChapters.length > 0) {
    userContent += `\n\n---\n\nPREVIOUS CHAPTERS (for cross-chapter memory):\n`;
    for (const pc of body.previousChapters) {
      userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
      if (pc.morpho) userContent += `\nMorpho reading for that chapter:\n${JSON.stringify(pc.morpho)}\n`;
    }
  }
  const data = await callWithCache(c, { system, userContent, model: SONNET, fallbackModel: HAIKU, maxTokens: 8192, cacheKey: { chapter: body.chapterNumber, kind: "morpho", beats: body.beats } });
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
  const data = await callWithCache(c, { system, userContent, model: SONNET, fallbackModel: HAIKU, maxTokens: 8192, cacheKey: { chapter: body.chapterNumber, kind: "sage", beats: body.beats } });
  return c.json({ data });
});

/* ── Margins (uses Haiku — cost optimization) ── */
app.post("/margins", async (c) => {
  const body = z.object({
    chapterNumber: z.number().int().min(1).max(7), chapterTitle: z.string(),
    movementTitle: z.string(), question: z.string().optional().default(""),
    text: z.string().min(1), archetypeContext: z.string().optional().default(""),
  }).parse(await c.req.json());

  if (detectCrisis(body.text)) {
    return c.json({ data: { crisisWarning: true, message: "If you're in crisis, please reach out. You can call or text 988 (Suicide & Crisis Lifeline) in the US, or find local resources at findahelpline.com." } }, 200);
  }

  let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\nMovement (page): ${body.movementTitle}\nWhat the page asked of them: ${body.question || "[open writing]"}\n\nWhat they wrote:\n${body.text}`;
  if (body.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;

  const data = await callAnthropic(c.env, { system: MARGINS_SYSTEM, userContent, model: HAIKU, maxTokens: 2048 });
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

  const data = await callWithCache(c, { system: STORYTELLER_SYSTEM, userContent, model: SONNET, fallbackModel: HAIKU, maxTokens: 4096, cacheKey: { chapter: body.chapterNumber, kind: "synthesis", beats: body.beats } });
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

  const data = await callAnthropic(c.env, { system: STORYTELLER_SYSTEM + STORYTELLER_ORIGIN_APPENDIX, userContent, model: SONNET, fallbackModel: HAIKU, maxTokens: 8192 });
  return c.json({ data });
});

/* ── Horizon (uses Haiku) ── */
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

  const data = await callAnthropic(c.env, { system, userContent, model: HAIKU, maxTokens: 1024 });
  return c.json({ data });
});

/* ── Voice cleanup (Haiku — punctuation/capitalization) ── */
app.post("/voice-cleanup", async (c) => {
  const body = z.object({ text: z.string().min(1) }).parse(await c.req.json());
  const client = getClient(c.env);
  const message = await client.messages.create({
    model: HAIKU,
    max_tokens: 4096,
    system: "You clean up raw speech-to-text output. Add proper punctuation, capitalization, and paragraph breaks. Preserve the speaker's exact words — do not add, remove, or change any words. Return ONLY the cleaned text, no JSON, no explanation.",
    messages: [{ role: "user", content: body.text }],
  });
  const block = message.content[0];
  const text = block && block.type === "text" ? block.text : body.text;
  return c.json({ data: { text } });
});

/* ── Stream endpoint (SSE for real-time word reveal) ── */
app.post("/morpho/stream", async (c) => {
  const body = morphoBodySchema.parse(await c.req.json());
  const system = body.cumulative ? MORPHO_SYSTEM + MORPHO_CUMULATIVE_APPENDIX : MORPHO_SYSTEM;
  const userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;

  const client = getClient(c.env);
  return stream(c, async (stream) => {
    const response = await client.messages.stream({
      model: SONNET,
      max_tokens: 8192,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userContent }],
    });

    for await (const event of response) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        await stream.write(event.delta.text);
      }
    }
  });
});

export default app;
