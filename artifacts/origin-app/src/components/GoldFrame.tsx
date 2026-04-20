import React from 'react';

export function GoldFrame({ 
  children, 
  className = '',
  cornerSize = 40
}: { 
  children: React.ReactNode, 
  className?: string,
  cornerSize?: number
}) {
  return (
    <div className={`relative p-8 ${className}`}>
      {/* Top Left */}
      <svg className="absolute top-0 left-0" width={cornerSize} height={cornerSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 40 L0 0 L40 0" className="gold-stroke" strokeWidth="1.5" fill="none" />
        <path d="M5 40 L5 5 L40 5" className="gold-stroke" strokeWidth="0.5" fill="none" />
        <circle cx="0" cy="0" r="2" fill="#C4A35A" />
      </svg>
      
      {/* Top Right */}
      <svg className="absolute top-0 right-0" width={cornerSize} height={cornerSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L40 0 L40 40" className="gold-stroke" strokeWidth="1.5" fill="none" />
        <path d="M0 5 L35 5 L35 40" className="gold-stroke" strokeWidth="0.5" fill="none" />
        <circle cx="40" cy="0" r="2" fill="#C4A35A" />
      </svg>
      
      {/* Bottom Left */}
      <svg className="absolute bottom-0 left-0" width={cornerSize} height={cornerSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L0 40 L40 40" className="gold-stroke" strokeWidth="1.5" fill="none" />
        <path d="M5 0 L5 35 L40 35" className="gold-stroke" strokeWidth="0.5" fill="none" />
        <circle cx="0" cy="40" r="2" fill="#C4A35A" />
      </svg>
      
      {/* Bottom Right */}
      <svg className="absolute bottom-0 right-0" width={cornerSize} height={cornerSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 0 L40 40 L0 40" className="gold-stroke" strokeWidth="1.5" fill="none" />
        <path d="M35 0 L35 35 L0 35" className="gold-stroke" strokeWidth="0.5" fill="none" />
        <circle cx="40" cy="40" r="2" fill="#C4A35A" />
      </svg>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
