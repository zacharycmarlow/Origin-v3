import { useRef, useState, useCallback, forwardRef } from 'react';
import { toPng } from 'html-to-image';

/* ═══════════════════════════════════════════════════════════════
   ShareCard — Metamyth-branded shareable image generator.

   Uses html-to-image (MIT, 5.2M weekly downloads) to render a DOM
   node to PNG. Every share card includes the Metamyth compass logo,
   gold rule divider, and "Origin · A Metamyth Journey" footer.

   Custom code: ~2% (card layout + branding overlay).
   ═══════════════════════════════════════════════════════════════ */

interface ShareCardProps {
  /** The text content to display on the card. */
  text: string;
  /** Optional title (e.g. chapter title, reading type). */
  title?: string;
  /** Optional eyebrow text (e.g. "Chapter III · The Reason"). */
  eyebrow?: string;
  /** Background color — defaults to dark. */
  bgColor?: string;
  /** Accent color — defaults to Metamyth gold. */
  accentColor?: string;
}

const METAMYTH_GOLD = '#c89838';

/* The Metamyth compass logo as inline SVG */
function MetamythLogo({ size = 28, color = METAMYTH_GOLD }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth=".6" />
      <circle cx="60" cy="60" r="40" fill="none" stroke={color} strokeWidth=".4" opacity=".6" />
      <circle cx="60" cy="60" r="26" fill="none" stroke={color} strokeWidth=".4" opacity=".4" />
      <circle cx="60" cy="60" r="3" fill={color} />
      <line x1="60" y1="6" x2="60" y2="34" stroke={color} strokeWidth=".6" />
      <line x1="60" y1="86" x2="60" y2="114" stroke={color} strokeWidth=".6" />
      <line x1="6" y1="60" x2="34" y2="60" stroke={color} strokeWidth=".6" />
      <line x1="86" y1="60" x2="114" y2="60" stroke={color} strokeWidth=".6" />
    </svg>
  );
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { text, title, eyebrow, bgColor = '#1a1510', accentColor = METAMYTH_GOLD },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        background: bgColor,
        color: '#e8dcc6',
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top: eyebrow + logo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {eyebrow && (
            <div style={{ fontSize: 20, color: accentColor, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.8 }}>
              {eyebrow}
            </div>
          )}
          {title && (
            <h2 style={{ fontSize: 36, fontWeight: 400, margin: 0, color: '#e8dcc6', lineHeight: 1.2 }}>
              {title}
            </h2>
          )}
        </div>
        <MetamythLogo size={48} color={accentColor} />
      </div>

      {/* Middle: the text */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 0' }}>
        <p style={{ fontSize: 32, lineHeight: 1.6, margin: 0, color: '#e8dcc6', fontStyle: 'italic' }}>
          {text}
        </p>
      </div>

      {/* Bottom: gold rule + branding */}
      <div>
        <div style={{ height: 1, background: accentColor, opacity: 0.4, marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: accentColor, letterSpacing: '0.1em' }}>
            Origin · A Metamyth Journey
          </span>
          <MetamythLogo size={24} color={accentColor} />
        </div>
      </div>
    </div>
  );
});

/* Hook to generate a share card PNG from text */
export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async (props: ShareCardProps) => {
    setGenerating(true);
    try {
      // Render the card off-screen, then capture
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(container);
      const { createElement } = await import('react');

      await new Promise<void>((resolve) => {
        root.render(createElement(ShareCard, { ...props, ref: cardRef }));
        setTimeout(resolve, 100);
      });

      const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
        cacheBust: true,
        pixelRatio: 1,
      });

      root.unmount();
      document.body.removeChild(container);
      return dataUrl;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generate, generating };
}

/* Helper: share via Web Share API (zero custom code) */
export async function shareImage(dataUrl: string, text: string, title: string): Promise<boolean> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'origin-share.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, title });
      return true;
    }
    // Fallback: download the image
    const link = document.createElement('a');
    link.download = 'origin-share.png';
    link.href = dataUrl;
    link.click();
    return false;
  } catch (err) {
    // User cancelled or share failed
    return false;
  }
}
