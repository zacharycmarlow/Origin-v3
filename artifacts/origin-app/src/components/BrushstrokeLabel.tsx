import React from 'react';

export function BrushstrokeLabel({ 
  children, 
  active = false,
  className = '',
  onClick
}: { 
  children: React.ReactNode, 
  active?: boolean,
  className?: string,
  onClick?: () => void
}) {
  return (
    <div 
      className={`relative group cursor-pointer inline-flex items-center justify-center py-3 px-8 ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 overflow-hidden w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute w-[120%] h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 30 Q 50 15, 100 25 T 190 20 Q 185 40, 160 45 T 80 50 Q 20 45, 10 30 Z" 
            fill={active ? "rgba(64, 196, 180, 0.25)" : "rgba(64, 196, 180, 0.05)"}
            className="transition-all duration-500 group-hover:fill-[rgba(64,196,180,0.15)]"
          />
          {active && (
            <path 
              d="M20 32 Q 60 20, 100 28 T 180 25 Q 175 35, 150 40 T 70 42 Q 25 38, 20 32 Z" 
              fill="rgba(64, 196, 180, 0.15)"
              className="teal-glow"
            />
          )}
        </svg>
      </div>
      <span className={`relative z-10 font-display text-sm tracking-[0.2em] transition-colors duration-300 ${active ? 'text-[#3DB8A8] teal-text-glow' : 'text-[#C4A35A] group-hover:text-[#D4B56A]'}`}>
        {children}
      </span>
    </div>
  );
}
