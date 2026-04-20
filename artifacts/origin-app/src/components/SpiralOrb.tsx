import React from 'react';

export function SpiralOrb({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className} group cursor-pointer`}>
      <div className="absolute inset-0 rounded-full teal-glow opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer gold ring */}
        <circle cx="100" cy="100" r="95" className="gold-stroke" strokeWidth="2" strokeDasharray="8 4" />
        <circle cx="100" cy="100" r="90" className="gold-stroke" strokeWidth="0.5" />
        
        {/* Teal background wash */}
        <circle cx="100" cy="100" r="88" fill="url(#tealGrad)" opacity="0.4" />
        
        {/* Inner spiral */}
        <g className="spiral-spin origin-center">
          <path d="M100 100 
                   C100 90, 110 90, 110 100 
                   C110 115, 85 115, 85 100 
                   C85 80, 120 80, 120 100 
                   C120 125, 75 125, 75 100
                   C75 70, 135 70, 135 100
                   C135 135, 60 135, 60 100
                   C60 60, 150 60, 150 100
                   C150 150, 45 150, 45 100
                   C45 45, 165 45, 165 100" 
                stroke="#4AC4B4" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>
        
        {/* Center glowing core */}
        <circle cx="100" cy="100" r="10" fill="#4AC4B4" className="teal-glow" />
        
        <defs>
          <radialGradient id="tealGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4AC4B4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4AC4B4" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
