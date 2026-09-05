import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Reading registers — sigil-promoted paragraphs.

   In chapters.ts, a paragraph (a `\n\n`-delimited block) beginning
   with a sigil + space is promoted up the typographic ladder:

     "^ "  → R2 weighted line  (the prose leaning in)
     "! "  → R3 hero line      (the book changing voice)

   Promotion IS isolation: sigils only work at paragraph start.
   Quotas live in the editorial rules, not the code:
   hero = 1 per invocation + 1 per threshold, nothing else.
   ═══════════════════════════════════════════════════════════════ */

export const HERO_SIGIL = '! ';
export const WEIGHT_SIGIL = '^ ';

/** Strip register sigils from a paragraph (for AI payloads, plain-text export). */
export function stripSigils(text: string): string {
  return text
    .split('\n\n')
    .map(p => (p.startsWith(HERO_SIGIL) || p.startsWith(WEIGHT_SIGIL) ? p.slice(2) : p))
    .join('\n\n');
}

/** Adds .is-lit once when the element crosses 60% visibility — the breath reveal. */
function useLitOnVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || lit) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lit]);

  return { ref, lit };
}

function HeroLine({ text }: { text: string }) {
  const { ref, lit } = useLitOnVisible<HTMLDivElement>();
  return (
    <div ref={ref} className={`reg-hero${lit ? ' is-lit' : ''}`}>
      <span className="hero-rule" aria-hidden="true" />
      {text}
    </div>
  );
}

/** Renders one paragraph at its register. `dropcap` gilds the first letter. */
export function RegisterPara({ text, dropcap }: { text: string; dropcap?: boolean }) {
  if (text.startsWith(HERO_SIGIL)) return <HeroLine text={text.slice(2)} />;
  if (text.startsWith(WEIGHT_SIGIL)) return <p className="reg-weight">{text.slice(2)}</p>;
  return <p className={dropcap ? 'invocation-dropcap' : undefined}>{text}</p>;
}
