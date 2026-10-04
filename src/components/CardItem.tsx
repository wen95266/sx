import React, { useState } from 'react';
import { Card } from '../types/game';

interface CardItemProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  showBack?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  selected = false,
  onClick,
  size = 'md',
  dimmed = false,
  showBack = false
}) => {
  const [svgFailed, setSvgFailed] = useState(false);
  const isRed = card.color === 'red';

  const sizeClasses = {
    sm: 'w-10 h-14 text-xs rounded-md',
    md: 'w-14 h-20 text-sm rounded-lg',
    lg: 'w-18 h-26 text-base rounded-xl'
  }[size];

  if (showBack) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/30 shadow-md flex items-center justify-center select-none shrink-0 relative overflow-hidden`}
      >
        <div className="absolute inset-1 border border-blue-400/20 rounded flex items-center justify-center">
          <div className="w-4 h-6 border border-amber-500/30 rotate-45 flex items-center justify-center">
            <span className="text-[10px] text-amber-400/60 font-serif">13</span>
          </div>
        </div>
      </div>
    );
  }

  // Path where user places custom SVG poker cards
  const customSvgUrl = `/cards/${card.suit}_${card.label}.svg`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses}
        relative flex flex-col justify-between p-1.5 shrink-0 select-none font-semibold transition-all duration-150
        bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900
        border ${selected ? 'border-amber-400 ring-2 ring-amber-400 -translate-y-2 shadow-lg shadow-amber-500/20' : 'border-slate-300 shadow-md hover:border-slate-400'}
        ${dimmed ? 'opacity-40 grayscale' : 'opacity-100'}
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
    >
      {/* If custom SVG exists and hasn't errored out, render SVG image */}
      {!svgFailed && (
        <img
          src={customSvgUrl}
          alt={`${card.suit}_${card.label}`}
          onError={() => setSvgFailed(true)}
          className="absolute inset-0 w-full h-full object-contain p-0.5 rounded pointer-events-none"
        />
      )}

      {/* Built-in High-Contrast Vector/CSS Poker Layout (Fallback or Default) */}
      <div className={`flex flex-col items-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'} ${!svgFailed ? 'opacity-0' : 'opacity-100'}`}>
        <span className="font-mono font-bold">{card.label}</span>
        <span className="text-[10px] leading-tight">{card.suitSymbol}</span>
      </div>

      {/* Center Watermark */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          isRed ? 'text-rose-600/15' : 'text-slate-900/15'
        } ${!svgFailed ? 'opacity-0' : 'opacity-100'}`}
      >
        <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'}>
          {card.suitSymbol}
        </span>
      </div>

      {/* Bottom Right Inverted */}
      <div className={`flex flex-col items-center leading-none rotate-180 self-end ${isRed ? 'text-rose-600' : 'text-slate-900'} ${!svgFailed ? 'opacity-0' : 'opacity-100'}`}>
        <span className="font-mono font-bold">{card.label}</span>
        <span className="text-[10px] leading-tight">{card.suitSymbol}</span>
      </div>
    </button>
  );
};
