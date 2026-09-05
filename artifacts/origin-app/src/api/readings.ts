import type {
  Beat,
  MorphoReading,
  SageReading,
  HorizonReading,
  ChapterReading,
  PageMargins,
  ChapterSynthesis,
  OriginStory,
} from "../storage";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

interface PreviousChapterPayload {
  chapterNumber: number;
  chapterTitle: string;
  beats: Beat[];
  morpho?: MorphoReading;
  sage?: SageReading;
}

interface MorphoRequest {
  chapterNumber: number;
  chapterTitle: string;
  beats: Beat[];
  previousChapters?: PreviousChapterPayload[];
  cumulative?: boolean;
}

interface SageRequest extends MorphoRequest {
  morpho: MorphoReading;
}

interface HorizonRequest {
  chapterNumber: number;
  chapterTitle: string;
  morphoThroughLine: string;
  morphoSubtext: string;
  sageResonance: string;
  cumulative?: boolean;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  // BASE may be "/" or "/origin-app" etc. Always hit /api at root via the proxy.
  // The artifact's BASE_URL prefix doesn't apply to /api calls — they go to the
  // shared proxy directly.
  const url = `/api/readings${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Reading request failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

export async function fetchMorpho(req: MorphoRequest): Promise<MorphoReading> {
  return post<MorphoReading>("/morpho", req);
}

export async function fetchSage(req: SageRequest): Promise<SageReading> {
  return post<SageReading>("/sage", req);
}

export async function fetchHorizon(req: HorizonRequest): Promise<HorizonReading> {
  const data = await post<{ whisper?: string; text?: string }>("/horizon", req);
  return { whisper: data.whisper || data.text || "", generatedAt: Date.now() };
}

/* ── Margins — Morpho reads one submitted page ── */

interface MarginsRequest {
  chapterNumber: number;
  chapterTitle: string;
  movementTitle: string;
  question?: string;
  text: string;
  archetypeContext?: string;
}

export async function fetchMargins(req: MarginsRequest): Promise<PageMargins> {
  const data = await post<{ marginalNotes: PageMargins["marginalNotes"]; invitation?: string }>(
    "/margins",
    req,
  );
  return {
    marginalNotes: data.marginalNotes || [],
    invitation: data.invitation || "",
    generatedAt: Date.now(),
  };
}

/* ── The Storyteller — chapter synthesis ── */

interface SynthesisRequest {
  chapterNumber: number;
  chapterTitle: string;
  beats: Beat[];
  morpho?: MorphoReading;
  previousSyntheses?: { chapterNumber: number; title: string; story: string }[];
  archetypeContext?: string;
}

export async function fetchSynthesis(req: SynthesisRequest): Promise<ChapterSynthesis> {
  const data = await post<{ title: string; story: string; closing?: string }>(
    "/synthesis",
    req,
  );
  return {
    title: data.title || "",
    story: data.story || "",
    closing: data.closing || "",
    generatedAt: Date.now(),
  };
}

/* ── The Storyteller — the full origin story ── */

interface OriginStoryRequest {
  chapters: {
    chapterNumber: number;
    chapterTitle: string;
    beats: Beat[];
    synthesis?: { title: string; story: string };
  }[];
  archetypeContext?: string;
}

export async function fetchOriginStory(req: OriginStoryRequest): Promise<OriginStory> {
  const data = await post<{
    title: string;
    movements: OriginStory["movements"];
    dedication?: string;
  }>("/originstory", req);
  return {
    title: data.title || "",
    movements: data.movements || [],
    dedication: data.dedication || "",
    generatedAt: Date.now(),
  };
}

export type { ChapterReading, PreviousChapterPayload };
// Suppress "unused" warning; BASE is intentionally unused in URL above
// (kept here for future absolute-URL escape hatch).
void BASE;
