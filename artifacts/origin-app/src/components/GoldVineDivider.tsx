import React from 'react';

export function GoldVineDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full py-8 flex justify-center items-center opacity-60 ${className}`}>
      <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20 Q 50 10, 100 20 T 200 20 T 300 20 T 400 20" className="gold-stroke" strokeWidth="1" fill="none" />
        {/* Leaf flourishes */}
        <path d="M100 20 Q 105 10, 115 15 Q 105 20, 100 20 Z" className="gold-stroke fill-[#C4A35A]" strokeWidth="0.5" />
        <path d="M200 20 Q 195 30, 185 25 Q 195 20, 200 20 Z" className="gold-stroke fill-[#C4A35A]" strokeWidth="0.5" />
        <path d="M300 20 Q 305 10, 315 15 Q 305 20, 300 20 Z" className="gold-stroke fill-[#C4A35A]" strokeWidth="0.5" />
        <circle cx="200" cy="20" r="3" className="gold-stroke fill-transparent" strokeWidth="1" />
        <circle cx="200" cy="20" r="1" className="fill-[#C4A35A]" />
      </svg>
    </div>
  );
}
