"use client";

interface DpeBadgeProps {
  rating: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DPE_COLORS: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-green-400',
  C: 'bg-yellow-400',
  D: 'bg-yellow-500',
  E: 'bg-orange-400',
  F: 'bg-orange-500',
  G: 'bg-red-500',
};

export default function DpeBadge({ rating, className = "", size = 'md' }: DpeBadgeProps) {
  if (!rating) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[20px]',
    md: 'text-sm px-2 py-1 min-w-[24px]',
    lg: 'text-base px-3 py-1.5 min-w-[28px]',
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center rounded font-bold text-white
        ${DPE_COLORS[rating] || 'bg-gray-400'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {rating}
    </span>
  );
}