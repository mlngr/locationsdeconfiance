import React from 'react';

interface DpeBadgeProps {
  rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  size?: 'sm' | 'md';
}

const dpeColors = {
  A: 'bg-green-600',
  B: 'bg-green-500', 
  C: 'bg-lime-500',
  D: 'bg-yellow-500',
  E: 'bg-orange-500',
  F: 'bg-red-500',
  G: 'bg-red-600'
};

export default function DpeBadge({ rating, size = 'sm' }: DpeBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${dpeColors[rating]} ${sizeClasses}`}
      title={`DPE: ${rating}`}
    >
      DPE {rating}
    </span>
  );
}