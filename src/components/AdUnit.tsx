import React from 'react';

interface AdUnitProps {
  slot: 'header' | 'sidebar' | 'in-article' | 'footer';
  className?: string;
}

export default function AdUnit({ slot, className = '' }: AdUnitProps) {
  // In a real app, this would integrate with Google AdSense or similar
  return (
    <div className={`bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs uppercase tracking-widest overflow-hidden ${className}`}
      style={{ minHeight: slot === 'header' ? '90px' : slot === 'sidebar' ? '250px' : '100px' }}
    >
      <span className="mb-1">Advertisement ({slot})</span>
      <div className="w-8 h-0.5 bg-gray-300"></div>
    </div>
  );
}
