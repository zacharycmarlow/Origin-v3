import React from 'react';

export function GoldCompassRose({ className = '', active = false }: { className?: string, active?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-8 h-8 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" className="gold-stroke" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="50" cy="50" r="35" className="gold-stroke" strokeWidth="0.5" />
      <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" className="gold-stroke" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" className="gold-stroke" strokeWidth="0.75" />
      <circle cx="50" cy="50" r="3" className={active ? "fill-[#4AC4B4] teal-glow" : "fill-[#C4A35A]"} transition="all 0.4s ease" />
    </svg>
  );
}
