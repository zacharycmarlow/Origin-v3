import type { Beat, MorphoReading, SageReading, HorizonReading, ChapterReading } from "../storage";

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

export type { ChapterReading, PreviousChapterPayload };
// Suppress "unused" warning; BASE is intentionally unused in URL above
// (kept here for future absolute-URL escape hatch).
void BASE;
