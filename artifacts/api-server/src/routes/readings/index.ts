import { Router, type IRouter } from "express";
import { z } from "zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  MORPHO_SYSTEM,
  MORPHO_CUMULATIVE_APPENDIX,
  SAGE_SYSTEM,
  SAGE_CUMULATIVE_APPENDIX,
  HORIZON_SYSTEM,
  HORIZON_CUMULATIVE_APPENDIX,
  MARGINS_SYSTEM,
  STORYTELLER_SYSTEM,
  STORYTELLER_ORIGIN_APPENDIX,
} from "./prompts";

const router: IRouter = Router();

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5";

const beatSchema = z.object({
  title: z.string(),
  thread: z.string().optional().default(""),
  text: z.string(),
});

const morphoBodySchema = z.object({
  chapterNumber: z.number().int().min(1).max(7),
  chapterTitle: z.string(),
  beats: z.array(beatSchema).min(1),
  previousChapters: z
    .array(
      z.object({
        chapterNumber: z.number(),
        chapterTitle: z.string(),
        beats: z.array(beatSchema),
        morpho: z.unknown().optional(),
      })
    )
    .optional()
    .default([]),
  cumulative: z.boolean().optional().default(false),
});

const sageBodySchema = morphoBodySchema.extend({
  morpho: z.unknown(),
  previousChapters: z
    .array(
      z.object({
        chapterNumber: z.number(),
        chapterTitle: z.string(),
        beats: z.array(beatSchema),
        morpho: z.unknown().optional(),
        sage: z.unknown().optional(),
      })
    )
    .optional()
    .default([]),
});

const horizonBodySchema = z.object({
  chapterNumber: z.number().int().min(1).max(7),
  chapterTitle: z.string(),
  morphoThroughLine: z.string().optional().default(""),
  morphoSubtext: z.string().optional().default(""),
  sageResonance: z.string().optional().default(""),
  cumulative: z.boolean().optional().default(false),
});

function formatBeats(beats: { title: string; thread?: string; text: string }[]): string {
  return beats
    .map(
      (b, i) =>
        `Beat ${i + 1} — ${b.title}${b.thread ? ` (${b.thread})` : ""}:\n${b.text || "[no response written]"}`
    )
    .join("\n\n");
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  return t.trim();
}

function safeParseJson(raw: string): unknown {
  const cleaned = stripJsonFence(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Last-resort: find first { and last } and parse that span
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

async function callAnthropic(opts: {
  system: string;
  userContent: string;
  model: string;
  maxTokens: number;
}): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: [{ role: "user", content: opts.userContent }],
  });
  const block = message.content[0];
  const text = block && block.type === "text" ? block.text : "";
  return safeParseJson(text);
}

router.post("/morpho", async (req, res, next) => {
  try {
    const body = morphoBodySchema.parse(req.body);
    const system = body.cumulative ? MORPHO_SYSTEM + MORPHO_CUMULATIVE_APPENDIX : MORPHO_SYSTEM;

    let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;

    if (body.previousChapters.length > 0) {
      userContent += `\n\n---\n\nPREVIOUS CHAPTERS (for cross-chapter memory):\n`;
      for (const pc of body.previousChapters) {
        userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
        if (pc.morpho) {
          userContent += `\nMorpho reading for that chapter:\n${JSON.stringify(pc.morpho)}\n`;
        }
      }
    }

    const data = await callAnthropic({
      system,
      userContent,
      model: SONNET,
      maxTokens: body.cumulative ? 8192 : 8192,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/sage", async (req, res, next) => {
  try {
    const body = sageBodySchema.parse(req.body);
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

    const data = await callAnthropic({
      system,
      userContent,
      model: SONNET,
      maxTokens: 8192,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/* ── Margins — Morpho reads one submitted page ─────────────── */
const marginsBodySchema = z.object({
  chapterNumber: z.number().int().min(1).max(7),
  chapterTitle: z.string(),
  movementTitle: z.string(),
  question: z.string().optional().default(""),
  text: z.string().min(1),
  archetypeContext: z.string().optional().default(""),
});

router.post("/margins", async (req, res, next) => {
  try {
    const body = marginsBodySchema.parse(req.body);

    let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}
Movement (page): ${body.movementTitle}
What the page asked of them: ${body.question || "[open writing]"}

What they wrote:
${body.text}`;

    if (body.archetypeContext) {
      userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;
    }

    const data = await callAnthropic({
      system: MARGINS_SYSTEM,
      userContent,
      model: SONNET,
      maxTokens: 2048,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/* ── Storyteller — weaves a chapter's beats into one telling ── */
const synthesisBodySchema = z.object({
  chapterNumber: z.number().int().min(1).max(7),
  chapterTitle: z.string(),
  beats: z.array(beatSchema).min(1),
  morpho: z.unknown().optional(),
  previousSyntheses: z
    .array(
      z.object({
        chapterNumber: z.number(),
        title: z.string(),
        story: z.string(),
      })
    )
    .optional()
    .default([]),
  archetypeContext: z.string().optional().default(""),
});

router.post("/synthesis", async (req, res, next) => {
  try {
    const body = synthesisBodySchema.parse(req.body);

    let userContent = `Chapter ${body.chapterNumber}: ${body.chapterTitle}\n\n${formatBeats(body.beats)}`;

    if (body.morpho) {
      userContent += `\n\n---\nMorpho reading (compass only — never quote):\n${JSON.stringify(body.morpho)}`;
    }
    if (body.previousSyntheses.length > 0) {
      userContent += `\n\n---\nPREVIOUS CHAPTER TELLINGS (for continuity of image and thread):\n`;
      for (const ps of body.previousSyntheses) {
        userContent += `\n## Chapter ${ps.chapterNumber} — ${ps.title}\n${ps.story}\n`;
      }
    }
    if (body.archetypeContext) {
      userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;
    }

    const data = await callAnthropic({
      system: STORYTELLER_SYSTEM,
      userContent,
      model: SONNET,
      maxTokens: 4096,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/* ── Storyteller — the full origin story, all seven chapters ── */
const originStoryBodySchema = z.object({
  chapters: z
    .array(
      z.object({
        chapterNumber: z.number(),
        chapterTitle: z.string(),
        beats: z.array(beatSchema),
        synthesis: z
          .object({ title: z.string(), story: z.string() })
          .optional(),
      })
    )
    .min(7),
  archetypeContext: z.string().optional().default(""),
});

router.post("/originstory", async (req, res, next) => {
  try {
    const body = originStoryBodySchema.parse(req.body);

    let userContent = `THE FULL MATERIAL — all seven chapters:\n`;
    for (const ch of body.chapters) {
      userContent += `\n=== Chapter ${ch.chapterNumber}: ${ch.chapterTitle} ===\n${formatBeats(ch.beats)}\n`;
      if (ch.synthesis) {
        userContent += `\nChapter telling already woven — "${ch.synthesis.title}":\n${ch.synthesis.story}\n`;
      }
    }
    if (body.archetypeContext) {
      userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${body.archetypeContext}`;
    }

    const data = await callAnthropic({
      system: STORYTELLER_SYSTEM + STORYTELLER_ORIGIN_APPENDIX,
      userContent,
      model: SONNET,
      maxTokens: 8192,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/horizon", async (req, res, next) => {
  try {
    const body = horizonBodySchema.parse(req.body);
    const system = body.cumulative
      ? HORIZON_SYSTEM + HORIZON_CUMULATIVE_APPENDIX
      : HORIZON_SYSTEM;

    const userContent = `Chapter just completed: ${body.chapterNumber} — ${body.chapterTitle}

Morpho Through-line: ${body.morphoThroughLine || "[none]"}
Morpho Subtext: ${body.morphoSubtext || "[none]"}
Sage Resonance summary: ${body.sageResonance || "[none]"}

Generate the integration prompt.`;

    const data = await callAnthropic({
      system,
      userContent,
      model: HAIKU,
      maxTokens: 8192,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
