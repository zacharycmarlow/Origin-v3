import { useEffect, useRef, useState, useId, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════
   Portal — inline hypertext marks + overlays.

   Three portal types share the same interaction contract:
     PortalEty   → glowing word (etymology) → CrystalOverlay
     PortalCode  → highlighter phrase (code) → LabOverlay
     PortalLore  → underscribbled sentence  → PageOverlay

   Every portal:
   - Wraps its `children` (the span of prose it decorates).
   - Draws its mark (highlighter/underline) ONCE when it crosses the
     reading line — via IntersectionObserver on this element, watched
     within the containing scroll area (defaults to viewport).
   - Opens its overlay on click / Enter / Space. Overlays render
     through React.createPortal to document.body so they can escape
     any transformed ancestors (the beat's fixed layer).
   - Traces its own visited state so the mark shows a small gold dot
     after the reader has been through it once.
   ═══════════════════════════════════════════════════════════════ */

type BaseProps = {
  children: ReactNode;
  /** Optional stable id for persisting visited state across sessions. */
  storageKey?: string;
};

/* Find the closest ancestor that actually scrolls. Portals live inside
   the beat's fixed .beat-content layer (which is overflow-y: auto), NOT
   inside the outer .beat-stage scroller. If we let the observer default
   to the viewport, it never fires — the viewport doesn't move when the
   reader scrolls WITHIN the beat. */
function findScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

/* ─── Shared: draw-on-read observer + visited toggle ──────────────── */
function usePortalMark(el: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = el.current;
    if (!node || node.dataset.drawn === 'true') return;
    const root = findScrollableAncestor(node);
    const io = new IntersectionObserver(
      entries => {
        const e = entries[0];
        if (e && e.isIntersecting && e.intersectionRatio > 0.65) {
          node.dataset.drawn = 'true';
          io.disconnect();
        }
      },
      { root, rootMargin: '-30% 0px -25% 0px', threshold: [0, 0.35, 0.65, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [el]);
}

/* ─── Overlays (rendered through document.body via createPortal) ─── */

function CrystalOverlay({ open, onClose, word, chain, note }: {
  open: boolean; onClose: () => void;
  word: string;
  chain: Array<{ lang: string; form: string; gloss: string }>;
  note?: string;
}) {
  useOverlayEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="portal-overlay portal-overlay-ety" data-open="true" role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="portal-overlay-close" aria-label="Close" onClick={onClose}>×</button>
      <div className="p-ety-root">
        <div className="p-ety-word">{word}</div>
        {chain.map((c, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className="p-ety-arrow" aria-hidden="true">↞</div>
            <div className="p-ety-source">
              <span className="p-ety-lang">{c.lang}</span>
              <span className="p-ety-form">{c.form}</span>
              <span className="p-ety-gloss">{c.gloss}</span>
            </div>
          </div>
        ))}
        {note && <div className="p-ety-note">{note}</div>}
      </div>
    </div>,
    document.body,
  );
}

export interface ExploreRef { who: string; what: string; where?: string; note?: string; }

function LabOverlay({ open, onClose, kind, cite, title, body, explore }: {
  open: boolean; onClose: () => void;
  kind?: string; cite?: string;
  title: string;
  body: string;
  explore?: ExploreRef[];
}) {
  useOverlayEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="portal-overlay portal-overlay-code" data-open="true" role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="portal-overlay-close" aria-label="Close" onClick={onClose}>×</button>
      <div className="p-code-scroll">
        {(kind || cite) && (
          <div className="p-code-crown">
            {kind && <span className="p-code-kind">◇ &nbsp;{kind}</span>}
            {cite && <span className="p-code-cite">{cite}</span>}
          </div>
        )}
        <h3 className="p-code-title">{title}</h3>
        {body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
        {explore && explore.length > 0 && (
          <div className="p-code-explore">
            <div className="p-code-explore-label">Explore</div>
            {explore.map((ref, i) => (
              <div className="p-code-ref" key={i}>
                <div className="p-code-ref-head">
                  <span className="p-code-ref-who">{ref.who}</span>
                  {ref.where && <span className="p-code-ref-where">{ref.where}</span>}
                </div>
                <div className="p-code-ref-what">{ref.what}</div>
                {ref.note && <div className="p-code-ref-note">{ref.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function PageOverlay({ open, onClose, kind, cite, essence, body }: {
  open: boolean; onClose: () => void;
  kind?: string; cite?: string;
  essence: string;
  body: string;
}) {
  useOverlayEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="portal-overlay portal-overlay-lore" data-open="true" role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="portal-overlay-close" aria-label="Close" onClick={onClose}>×</button>
      <div className="p-lore-mat">
        {(kind || cite) && (
          <div className="p-lore-crown">
            {kind && <span>❋ &nbsp;{kind}</span>}
            {cite && <span>{cite}</span>}
          </div>
        )}
        <div className="p-lore-highlight">{essence}</div>
        {body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </div>,
    document.body,
  );
}

/** Escape key handler shared by every overlay. */
function useOverlayEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/* ─── ETYMOLOGY — the glowing word ─────────────────────────────── */
export function PortalEty({
  children,
  word,
  chain,
  note,
  storageKey,
}: BaseProps & {
  word: string;
  chain: Array<{ lang: string; form: string; gloss: string }>;
  note?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(() =>
    storageKey ? !!localStorage.getItem(`portal:${storageKey}`) : false,
  );

  const activate = () => {
    setOpen(true);
    if (!visited) {
      setVisited(true);
      if (storageKey) localStorage.setItem(`portal:${storageKey}`, '1');
    }
  };

  return (
    <>
      <span
        ref={el}
        className="portal ety"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        data-visited={visited || undefined}
        onClick={activate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
      >
        {children}
      </span>
      <CrystalOverlay open={open} onClose={() => setOpen(false)} word={word} chain={chain} note={note} />
    </>
  );
}

/* ─── CODE — the highlighter ───────────────────────────────────── */
export function PortalCode({
  children,
  title,
  body,
  kind = 'code',
  cite,
  explore,
  storageKey,
}: BaseProps & {
  title: string;
  body: string;
  kind?: string;
  cite?: string;
  explore?: ExploreRef[];
}) {
  const el = useRef<HTMLSpanElement>(null);
  usePortalMark(el);
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(() =>
    storageKey ? !!localStorage.getItem(`portal:${storageKey}`) : false,
  );

  const activate = () => {
    setOpen(true);
    if (!visited) {
      setVisited(true);
      if (storageKey) localStorage.setItem(`portal:${storageKey}`, '1');
    }
  };

  return (
    <>
      <span
        ref={el}
        className="portal code"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        data-visited={visited || undefined}
        onClick={activate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
      >
        {children}
      </span>
      <LabOverlay open={open} onClose={() => setOpen(false)} kind={kind} cite={cite} title={title} body={body} explore={explore} />
    </>
  );
}

/* ─── LORE — the underscribbled sentence ───────────────────────── */
/** Builds a realistic hand-drawn pen underline for a lore mark.
 *  One confident cubic Bezier per portal, seeded deterministically so
 *  redraws stay identical, and so no two portals share a curve. */
function buildUnderscribble(el: HTMLElement) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const width = el.getBoundingClientRect().width;
  const H = 10;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'lore-underscribble');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `0 0 ${Math.round(width)} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  // Deterministic per-element pseudorandom (LCG on element identifier)
  const seedStr = (el.dataset.seed || el.textContent || 'lore').slice(0, 32);
  const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 7);
  const rand = (n: number) => (((seed * 9301 + n * 49297) % 233280) / 233280);
  const jitter = (n: number, amp: number) => (rand(n) - 0.5) * 2 * amp;

  const startX = 1;
  const endX = width - 1 + jitter(9, 4);
  const baseY = H * 0.5;

  const c1x = startX + width * (0.28 + jitter(1, 0.04));
  const c1y = baseY + 1.2 + jitter(2, 0.5);
  const c2x = startX + width * (0.72 + jitter(3, 0.04));
  const c2y = baseY - 0.7 + jitter(4, 0.5);
  const d =
    `M ${startX.toFixed(1)} ${(baseY + jitter(5, 0.4)).toFixed(1)} ` +
    `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ` +
    `${c2x.toFixed(1)} ${c2y.toFixed(1)}, ` +
    `${endX.toFixed(1)} ${(baseY + jitter(6, 0.6)).toFixed(1)}`;

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.appendChild(path);
  el.appendChild(svg);

  // getTotalLength() can return 0 or throw the first frame after append —
  // wait for a real, non-zero measurement (usually the very next frame).
  const setLen = () => {
    try {
      const len = path.getTotalLength ? path.getTotalLength() : 0;
      if (len > 0) {
        el.style.setProperty('--path-length', len.toFixed(0));
        return true;
      }
    } catch { /* svg not yet measurable */ }
    return false;
  };
  requestAnimationFrame(() => {
    if (!setLen()) requestAnimationFrame(() => { if (!setLen()) setTimeout(setLen, 60); });
  });
}

export function PortalLore({
  children,
  essence,
  body,
  kind = 'lore',
  cite,
  storageKey,
}: BaseProps & {
  essence: string;
  body: string;
  kind?: string;
  cite?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const seed = useId();
  usePortalMark(el);

  // Build the underscribble once when the span mounts.
  useEffect(() => {
    const node = el.current;
    if (!node || node.querySelector('.lore-underscribble')) return;
    node.dataset.seed = seed;
    buildUnderscribble(node);
  }, [seed]);

  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(() =>
    storageKey ? !!localStorage.getItem(`portal:${storageKey}`) : false,
  );

  const activate = () => {
    setOpen(true);
    if (!visited) {
      setVisited(true);
      if (storageKey) localStorage.setItem(`portal:${storageKey}`, '1');
    }
  };

  return (
    <>
      <span
        ref={el}
        className="portal lore"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        data-visited={visited || undefined}
        onClick={activate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
      >
        {children}
      </span>
      <PageOverlay open={open} onClose={() => setOpen(false)} kind={kind} cite={cite} essence={essence} body={body} />
    </>
  );
}
