/* Morpho — the stained-glass butterfly. One asset, everywhere.
   Drop the artwork at public/morpho.png (transparent background). */
export function ButterflyIcon({ size = 22, glowing = false }: { size?: number; glowing?: boolean }) {
  return (
    <img
      src="/morpho.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
      style={{
        display: 'inline-block',
        objectFit: 'contain',
        verticalAlign: 'middle',
        filter: glowing
          ? 'drop-shadow(0 0 6px rgba(79, 240, 214, 0.7)) drop-shadow(0 0 12px rgba(79, 240, 214, 0.35))'
          : undefined,
        transition: 'filter 600ms ease',
      }}
    />
  );
}

export function CompassIcon({ size = 22, glowing = false }: { size?: number; glowing?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{
        filter: glowing
          ? 'drop-shadow(0 0 6px rgba(245, 228, 161, 0.7)) drop-shadow(0 0 12px rgba(200, 152, 56, 0.4))'
          : undefined,
        transition: 'filter 600ms ease',
      }}
    >
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.55" />
      {/* Cardinal ticks */}
      <line x1="16" y1="3" x2="16" y2="6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="16" y1="26" x2="16" y2="29" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="3" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="26" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      {/* Needle — long N tip, short S tail */}
      <polygon points="16,7 14,17 18,17" fill="currentColor" fillOpacity="0.75" />
      <polygon points="16,25 14.5,17 17.5,17" fill="currentColor" fillOpacity="0.35" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
      <circle cx="16" cy="16" r="0.6" fill="#0a0a0a" />
    </svg>
  );
}
