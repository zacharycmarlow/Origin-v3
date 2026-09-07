import { type ReactNode } from 'react';
import { useBrowserLLM } from '../hooks/useBrowserLLM';
import { setBrowserLLM } from './readings';

/* ═══════════════════════════════════════════════════════════════
   BrowserLLMProvider — wires the useBrowserLLM hook into the
   readings API module so it can fall back to in-browser AI.

   Wrap the app with this provider. It has no UI — it just connects
   the hook's result to the module-level singleton in readings.ts.
   ═══════════════════════════════════════════════════════════════ */

export function BrowserLLMProvider({ children }: { children: ReactNode }) {
  const llm = useBrowserLLM();
  setBrowserLLM(llm);
  return <>{children}</>;
}
