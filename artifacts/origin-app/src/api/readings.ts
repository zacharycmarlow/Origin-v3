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
import type { BrowserLLMResult } from "../hooks/useBrowserLLM";
import {
  browserMorpho, browserSage, browserHorizon,
  browserMargins, browserSynthesis, browserOriginStory,
} from "./browserReadings";

/* ═══════════════════════════════════════════════════════════════
   Readings API — server-first with in-browser fallback.

   Flow:
   1. Try the server (/api/readings/*) — uses Anthropic if configured.
   2. If the server fails (404, 500, network error, or AI not
      configured), fall back to the in-browser LLM (WebLLM/Chrome AI).
   3. If no browser LLM is available, rethrow the original error.

   The browser LLM is injected via setBrowserLLM() so this module
   stays framework-agnostic. A React provider wires it up.
   ═══════════════════════════════════════════════════════════════ */

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

interface MarginsRequest {
  chapterNumber: number;
  chapterTitle: string;
  movementTitle: string;
  question?: string;
  text: string;
  archetypeContext?: string;
}

interface SynthesisRequest {
  chapterNumber: number;
  chapterTitle: string;
  beats: Beat[];
  morpho?: MorphoReading;
  previousSyntheses?: { chapterNumber: number; title: string; story: string }[];
  archetypeContext?: string;
}

interface OriginStoryRequest {
  chapters: {
    chapterNumber: number;
    chapterTitle: string;
    beats: Beat[];
    synthesis?: { title: string; story: string };
  }[];
  archetypeContext?: string;
}

/* ─── Browser LLM singleton ─── */
let browserLLM: BrowserLLMResult | null = null;

export function setBrowserLLM(llm: BrowserLLMResult | null) {
  browserLLM = llm;
}

/* ─── Server fetch helper ─── */
async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `/api/readings${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Reading request failed (${res.status}): ${text}`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The reading is taking longer than expected. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ─── Fallback wrapper ─── */
async function withBrowserFallback<T>(
  serverFn: () => Promise<T>,
  browserFn: (llm: BrowserLLMResult) => Promise<T>,
): Promise<T> {
  try {
    return await serverFn();
  } catch (serverErr) {
    // If browser LLM is available, try it as a fallback
    if (browserLLM && browserLLM.available) {
      try {
        return await browserFn(browserLLM);
      } catch (browserErr) {
        // Browser LLM also failed — throw the browser error since it's
        // more actionable (e.g. "model failed to load" vs "server 500")
        throw browserErr;
      }
    }
    // No browser LLM — rethrow the original server error
    throw serverErr;
  }
}

/* ─── Public API (same signatures as before) ─── */

export async function fetchMorpho(req: MorphoRequest): Promise<MorphoReading> {
  return withBrowserFallback(
    () => post<MorphoReading>("/morpho", req),
    (llm) => browserMorpho(llm, req),
  );
}

export async function fetchSage(req: SageRequest): Promise<SageReading> {
  return withBrowserFallback(
    () => post<SageReading>("/sage", req),
    (llm) => browserSage(llm, req),
  );
}

export async function fetchHorizon(req: HorizonRequest): Promise<HorizonReading> {
  return withBrowserFallback(
    async () => {
      const data = await post<{ whisper?: string; text?: string }>("/horizon", req);
      return { whisper: data.whisper || data.text || "", generatedAt: Date.now() };
    },
    (llm) => browserHorizon(llm, req),
  );
}

export async function fetchMargins(req: MarginsRequest): Promise<PageMargins> {
  return withBrowserFallback(
    async () => {
      const data = await post<{ marginalNotes: PageMargins["marginalNotes"]; invitation?: string }>("/margins", req);
      return {
        marginalNotes: data.marginalNotes || [],
        invitation: data.invitation || "",
        generatedAt: Date.now(),
      };
    },
    (llm) => browserMargins(llm, req),
  );
}

export async function fetchSynthesis(req: SynthesisRequest): Promise<ChapterSynthesis> {
  return withBrowserFallback(
    async () => {
      const data = await post<{ title: string; story: string; closing?: string }>("/synthesis", req);
      return {
        title: data.title || "",
        story: data.story || "",
        closing: data.closing || "",
        generatedAt: Date.now(),
      };
    },
    (llm) => browserSynthesis(llm, req),
  );
}

export async function fetchOriginStory(req: OriginStoryRequest): Promise<OriginStory> {
  return withBrowserFallback(
    async () => {
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
    },
    (llm) => browserOriginStory(llm, req),
  );
}

export type { ChapterReading, PreviousChapterPayload };
