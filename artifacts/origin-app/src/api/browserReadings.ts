import {
  MORPHO_SYSTEM, MORPHO_CUMULATIVE_APPENDIX,
  SAGE_SYSTEM, SAGE_CUMULATIVE_APPENDIX,
  HORIZON_SYSTEM, HORIZON_CUMULATIVE_APPENDIX,
  MARGINS_SYSTEM, STORYTELLER_SYSTEM, STORYTELLER_ORIGIN_APPENDIX,
} from '@workspace/prompts';
import type {
  Beat, MorphoReading, SageReading, HorizonReading,
  PageMargins, ChapterSynthesis, OriginStory,
} from '../storage';
import type { BrowserLLMResult } from '../hooks/useBrowserLLM';

/* ═══════════════════════════════════════════════════════════════
   browserReadings — in-browser AI reading generation.

   Mirrors the server-side readings routes but runs entirely in the
   browser using the useBrowserLLM hook. Used as a fallback when the
   Anthropic API key is not configured on the server.

   The prompts are shared with the worker via @workspace/prompts so
   both paths produce the same reading format.

   Custom code: ~2% (prompt assembly + JSON parsing).
   ═══════════════════════════════════════════════════════════════ */

interface PreviousChapterPayload {
  chapterNumber: number;
  chapterTitle: string;
  beats: Beat[];
  morpho?: MorphoReading;
  sage?: SageReading;
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

async function generate(llm: BrowserLLMResult, system: string, userContent: string, maxTokens = 4096): Promise<unknown> {
  const raw = await llm.generate(system, userContent, { maxTokens, temperature: 0.7 });
  return safeParseJson(raw);
}

/* ── Morpho ── */
export async function browserMorpho(
  llm: BrowserLLMResult,
  req: {
    chapterNumber: number;
    chapterTitle: string;
    beats: Beat[];
    previousChapters?: PreviousChapterPayload[];
    cumulative?: boolean;
  },
): Promise<MorphoReading> {
  const system = req.cumulative ? MORPHO_SYSTEM + MORPHO_CUMULATIVE_APPENDIX : MORPHO_SYSTEM;
  let userContent = `Chapter ${req.chapterNumber}: ${req.chapterTitle}\n\n${formatBeats(req.beats)}`;
  if (req.previousChapters?.length) {
    userContent += `\n\n---\n\nPREVIOUS CHAPTERS (for cross-chapter memory):\n`;
    for (const pc of req.previousChapters) {
      userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
      if (pc.morpho) userContent += `\nMorpho reading for that chapter:\n${JSON.stringify(pc.morpho)}\n`;
    }
  }
  const data = await generate(llm, system, userContent, 4096) as MorphoReading;
  return data;
}

/* ── Sage ── */
export async function browserSage(
  llm: BrowserLLMResult,
  req: {
    chapterNumber: number;
    chapterTitle: string;
    beats: Beat[];
    morpho: MorphoReading;
    previousChapters?: PreviousChapterPayload[];
    cumulative?: boolean;
  },
): Promise<SageReading> {
  const system = req.cumulative ? SAGE_SYSTEM + SAGE_CUMULATIVE_APPENDIX : SAGE_SYSTEM;
  let userContent = `Chapter ${req.chapterNumber}: ${req.chapterTitle}\n\n${formatBeats(req.beats)}`;
  userContent += `\n\n---\n\nMorpho Reading:\n${JSON.stringify(req.morpho)}`;
  if (req.previousChapters?.length) {
    userContent += `\n\n---\n\nPREVIOUS CHAPTERS:\n`;
    for (const pc of req.previousChapters) {
      userContent += `\n## Chapter ${pc.chapterNumber}: ${pc.chapterTitle}\n${formatBeats(pc.beats)}\n`;
      if (pc.morpho) userContent += `\nMorpho: ${JSON.stringify(pc.morpho)}\n`;
      if (pc.sage) userContent += `\nSage: ${JSON.stringify(pc.sage)}\n`;
    }
  }
  const data = await generate(llm, system, userContent, 4096) as SageReading;
  return data;
}

/* ── Horizon ── */
export async function browserHorizon(
  llm: BrowserLLMResult,
  req: {
    chapterNumber: number;
    chapterTitle: string;
    morphoThroughLine: string;
    morphoSubtext: string;
    sageResonance: string;
    cumulative?: boolean;
  },
): Promise<HorizonReading> {
  const system = req.cumulative ? HORIZON_SYSTEM + HORIZON_CUMULATIVE_APPENDIX : HORIZON_SYSTEM;
  const userContent = `Chapter just completed: ${req.chapterNumber} — ${req.chapterTitle}\n\nMorpho Through-line: ${req.morphoThroughLine || "[none]"}\nMorpho Subtext: ${req.morphoSubtext || "[none]"}\nSage Resonance summary: ${req.sageResonance || "[none]"}\n\nGenerate the integration prompt.`;
  const data = await generate(llm, system, userContent, 1024) as { whisper?: string; text?: string };
  return { whisper: data.whisper || data.text || "", generatedAt: Date.now() };
}

/* ── Margins ── */
export async function browserMargins(
  llm: BrowserLLMResult,
  req: {
    chapterNumber: number;
    chapterTitle: string;
    movementTitle: string;
    question?: string;
    text: string;
    archetypeContext?: string;
  },
): Promise<PageMargins> {
  let userContent = `Chapter ${req.chapterNumber}: ${req.chapterTitle}\nMovement (page): ${req.movementTitle}\nWhat the page asked of them: ${req.question || "[open writing]"}\n\nWhat they wrote:\n${req.text}`;
  if (req.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${req.archetypeContext}`;
  const data = await generate(llm, MARGINS_SYSTEM, userContent, 2048) as { marginalNotes: PageMargins["marginalNotes"]; invitation?: string };
  return {
    marginalNotes: data.marginalNotes || [],
    invitation: data.invitation || "",
    generatedAt: Date.now(),
  };
}

/* ── Synthesis ── */
export async function browserSynthesis(
  llm: BrowserLLMResult,
  req: {
    chapterNumber: number;
    chapterTitle: string;
    beats: Beat[];
    morpho?: MorphoReading;
    previousSyntheses?: { chapterNumber: number; title: string; story: string }[];
    archetypeContext?: string;
  },
): Promise<ChapterSynthesis> {
  let userContent = `Chapter ${req.chapterNumber}: ${req.chapterTitle}\n\n${formatBeats(req.beats)}`;
  if (req.morpho) userContent += `\n\n---\nMorpho reading (compass only — never quote):\n${JSON.stringify(req.morpho)}`;
  if (req.previousSyntheses?.length) {
    userContent += `\n\n---\nPREVIOUS CHAPTER TELLINGS (for continuity of image and thread):\n`;
    for (const ps of req.previousSyntheses) userContent += `\n## Chapter ${ps.chapterNumber} — ${ps.title}\n${ps.story}\n`;
  }
  if (req.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${req.archetypeContext}`;
  const data = await generate(llm, STORYTELLER_SYSTEM, userContent, 4096) as { title: string; story: string; closing?: string };
  return {
    title: data.title || "",
    story: data.story || "",
    closing: data.closing || "",
    generatedAt: Date.now(),
  };
}

/* ── Origin Story ── */
export async function browserOriginStory(
  llm: BrowserLLMResult,
  req: {
    chapters: {
      chapterNumber: number;
      chapterTitle: string;
      beats: Beat[];
      synthesis?: { title: string; story: string };
    }[];
    archetypeContext?: string;
  },
): Promise<OriginStory> {
  let userContent = `THE FULL MATERIAL — all seven chapters:\n`;
  for (const ch of req.chapters) {
    userContent += `\n=== Chapter ${ch.chapterNumber}: ${ch.chapterTitle} ===\n${formatBeats(ch.beats)}\n`;
    if (ch.synthesis) userContent += `\nChapter telling already woven — "${ch.synthesis.title}":\n${ch.synthesis.story}\n`;
  }
  if (req.archetypeContext) userContent += `\n\n---\nPRIVATE BACKGROUND SKETCH (never name or reference any system behind this; seasoning only):\n${req.archetypeContext}`;
  const data = await generate(llm, STORYTELLER_SYSTEM + STORYTELLER_ORIGIN_APPENDIX, userContent, 4096) as {
    title: string;
    movements: OriginStory["movements"];
    dedication?: string;
  };
  return {
    title: data.title || "",
    movements: data.movements || [],
    dedication: data.dedication || "",
    generatedAt: Date.now(),
  };
}
