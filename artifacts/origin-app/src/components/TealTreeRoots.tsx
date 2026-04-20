import React from 'react';

export function TealTreeRoots({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 300" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 300 Q110 250 90 200 T120 120 Q140 80 160 40" stroke="#4AC4B4" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M90 200 Q70 170 50 140 T20 90" stroke="#4AC4B4" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M120 120 Q100 90 90 60 T80 20" stroke="#4AC4B4" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M50 140 Q40 120 60 100" stroke="#4AC4B4" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
      
      {/* Nodes */}
      <circle cx="160" cy="40" r="4" fill="#4AC4B4" className="teal-glow" />
      <circle cx="20" cy="90" r="3" fill="#4AC4B4" className="teal-glow" />
      <circle cx="80" cy="20" r="2.5" fill="#4AC4B4" className="teal-glow" />
      <circle cx="60" cy="100" r="2" fill="#4AC4B4" className="teal-glow" />
      <circle cx="120" cy="120" r="3.5" fill="#4AC4B4" className="teal-glow" opacity="0.8"/>
      <circle cx="50" cy="140" r="2.5" fill="#4AC4B4" className="teal-glow" opacity="0.6"/>
      <circle cx="90" cy="200" r="4" fill="#4AC4B4" className="teal-glow" opacity="0.5"/>
    </svg>
  );
}
