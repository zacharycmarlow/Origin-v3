import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   useBrowserLLM — in-browser LLM for AI readings fallback.

   When the Anthropic API key is not configured on the server, the
   app falls back to running an LLM entirely in the browser. This
   keeps the readings feature working without any server-side AI.

   Two backends, tried in order of preference:
   1. Chrome built-in AI (window.ai / window.languageModel) — zero
      download, instant, Chrome 127+ with optimization hints enabled.
   2. WebLLM (@mlc-ai/web-llm) — WebGPU-accelerated, downloads a
      small model (~1-2GB) on first use, cached afterward. Works in
      any browser with WebGPU (Chrome, Edge, recent Firefox/Safari).

   The model loads lazily on first use. A status callback lets the
   UI show loading progress.

   Custom code: ~2% (backend selection + model loading).
   ═══════════════════════════════════════════════════════════════ */

// Chrome built-in AI type (experimental, not in standard lib)
interface ChromeAI {
  languageModel?: {
    create: (opts?: { initialPrompts?: unknown[]; temperature?: number; topK?: number }) => Promise<{
      prompt: (input: string) => Promise<string>;
      promptStreaming: (input: string) => ReadableStream<string>;
      destroy: () => void;
    }>;
    capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no'; defaultTemperature: number; defaultTopK: number }>;
  };
}

function getChromeAI(): ChromeAI | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ai?: ChromeAI }).ai ?? null;
}

function hasWebGPU(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'gpu' in navigator;
}

// WebLLM is loaded dynamically so it doesn't bloat the initial bundle.
let webllmEngine: any = null;
let webllmLoading: Promise<any> | null = null;

const WEBLLM_MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';

async function loadWebLLM(
  onProgress?: (progress: number, text: string) => void,
): Promise<any> {
  if (webllmEngine) return webllmEngine;
  if (webllmLoading) return webllmLoading;

  webllmLoading = (async () => {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
    const engine = await CreateMLCEngine(WEBLLM_MODEL, {
      initProgressCallback: (info: { progress: number; text: string }) => {
        onProgress?.(info.progress, info.text);
      },
    });
    webllmEngine = engine;
    return engine;
  })();

  return webllmLoading;
}

export type BrowserLLMBackend = 'chrome-ai' | 'webllm' | 'none';
export type BrowserLLMStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface BrowserLLMState {
  backend: BrowserLLMBackend;
  status: BrowserLLMStatus;
  loadProgress: number;
  loadText: string;
  error: string | null;
}

export interface BrowserLLMResult {
  state: BrowserLLMState;
  /** Check which backend is available without loading a model. */
  detect: () => BrowserLLMBackend;
  /** Load the model (lazy — only needed before first generation). */
  ensureLoaded: () => Promise<void>;
  /** Generate text from a system+user prompt. Returns the raw text. */
  generate: (system: string, user: string, opts?: { maxTokens?: number; temperature?: number }) => Promise<string>;
  /** Whether any in-browser backend is available. */
  available: boolean;
}

export function useBrowserLLM(): BrowserLLMResult {
  const [state, setState] = useState<BrowserLLMState>({
    backend: 'none',
    status: 'idle',
    loadProgress: 0,
    loadText: '',
    error: null,
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const detect = useCallback((): BrowserLLMBackend => {
    const chromeAI = getChromeAI();
    if (chromeAI?.languageModel) return 'chrome-ai';
    if (hasWebGPU()) return 'webllm';
    return 'none';
  }, []);

  const ensureLoaded = useCallback(async () => {
    if (stateRef.current.status === 'ready') return;
    if (stateRef.current.status === 'loading') return;

    const backend = detect();
    if (backend === 'none') {
      setState(s => ({ ...s, status: 'error', error: 'No in-browser AI available. Requires Chrome 127+ or a WebGPU-enabled browser.' }));
      throw new Error('No browser LLM backend available');
    }

    setState(s => ({ ...s, backend, status: 'loading', loadProgress: 0, loadText: 'Loading AI model…', error: null }));

    try {
      if (backend === 'chrome-ai') {
        const chromeAI = getChromeAI();
        const caps = await chromeAI!.languageModel!.capabilities();
        if (caps.available === 'no') {
          // Chrome AI not available, fall back to WebLLM
          if (hasWebGPU()) {
            setState(s => ({ ...s, backend: 'webllm', loadText: 'Loading WebLLM model…' }));
            await loadWebLLM((progress, text) => {
              setState(s => ({ ...s, loadProgress: progress, loadText: text }));
            });
          } else {
            throw new Error('Chrome AI not available and no WebGPU');
          }
        } else {
          // Chrome AI is ready (or will download via the browser)
          setState(s => ({ ...s, loadProgress: 1, loadText: 'Ready' }));
        }
      } else {
        // WebLLM
        await loadWebLLM((progress, text) => {
          setState(s => ({ ...s, loadProgress: progress, loadText: text }));
        });
      }
      setState(s => ({ ...s, status: 'ready', loadProgress: 1, loadText: 'Ready' }));
    } catch (err: any) {
      setState(s => ({ ...s, status: 'error', error: err?.message || 'Failed to load AI model' }));
      throw err;
    }
  }, [detect]);

  const generate = useCallback(async (
    system: string,
    user: string,
    opts: { maxTokens?: number; temperature?: number } = {},
  ): Promise<string> => {
    await ensureLoaded();

    const backend = stateRef.current.backend;

    if (backend === 'chrome-ai') {
      const chromeAI = getChromeAI();
      if (chromeAI?.languageModel) {
        const session = await chromeAI.languageModel.create({
          temperature: opts.temperature ?? 0.7,
          initialPrompts: [{ role: 'system', content: system } as any],
        });
        try {
          const result = await session.prompt(user);
          return result;
        } finally {
          session.destroy();
        }
      }
    }

    // WebLLM
    if (webllmEngine) {
      const reply = await webllmEngine.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2048,
      });
      return reply.choices[0]?.message?.content || '';
    }

    throw new Error('No LLM backend loaded');
  }, [ensureLoaded]);

  const available = detect() !== 'none';

  return { state, detect, ensureLoaded, generate, available };
}
