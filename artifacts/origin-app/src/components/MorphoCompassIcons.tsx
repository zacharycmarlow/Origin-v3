export function ButterflyIcon({ size = 22, glowing = false }: { size?: number; glowing?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{
        filter: glowing
          ? 'drop-shadow(0 0 6px rgba(79, 240, 214, 0.7)) drop-shadow(0 0 12px rgba(79, 240, 214, 0.35))'
          : undefined,
        transition: 'filter 600ms ease',
      }}
    >
      {/* Body */}
      <line x1="16" y1="6" x2="16" y2="26" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="1.1" fill="currentColor" />
      {/* Antennae */}
      <path d="M16 7 Q14 4 12 3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M16 7 Q18 4 20 3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
      {/* Upper wings */}
      <path d="M16 11 Q8 5 3 11 Q3 17 11 16 Q15 15 16 13 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="0.7" />
      <path d="M16 11 Q24 5 29 11 Q29 17 21 16 Q17 15 16 13 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="0.7" />
      {/* Lower wings */}
      <path d="M16 16 Q10 18 7 24 Q12 26 15 22 Q16 20 16 18 Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="0.6" />
      <path d="M16 16 Q22 18 25 24 Q20 26 17 22 Q16 20 16 18 Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="0.6" />
      {/* Wing dots */}
      <circle cx="8" cy="11" r="0.9" fill="currentColor" fillOpacity="0.6" />
      <circle cx="24" cy="11" r="0.9" fill="currentColor" fillOpacity="0.6" />
    </svg>
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
