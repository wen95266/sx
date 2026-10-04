import React, { useState } from 'react';
import { Card } from '../types/game';
import { getCardSvgPath, getCardBackSvgPath } from '../utils/cardAssets';

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
  const [backSvgFailed, setBackSvgFailed] = useState(false);
  const isRed = card.color === 'red';

  const sizeClasses = {
    sm: 'w-10 h-14 text-xs rounded-md',
    md: 'w-14 h-20 text-sm rounded-lg',
    lg: 'w-18 h-26 text-base rounded-xl'
  }[size];

  if (showBack) {
    const backSvgUrl = getCardBackSvgPath();
    return (
      <div
        className={`${sizeClasses} relative rounded-lg shadow-md flex items-center justify-center select-none shrink-0 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/40`}
      >
        {!backSvgFailed ? (
          <img
            src={backSvgUrl}
            alt="Card Back"
            onError={() => setBackSvgFailed(true)}
            className="w-full h-full object-cover pointer-events-none rounded-lg"
          />
        ) : (
          <div className="absolute inset-1 border border-blue-400/20 rounded flex items-center justify-center">
            <div className="w-4 h-6 border border-amber-500/30 rotate-45 flex items-center justify-center">
              <span className="text-[10px] text-amber-400/60 font-serif">13</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Exact path matching user's uploaded SVG card file:
  // e.g. /cards/ace_of_spades.svg, /cards/10_of_hearts.svg, etc.
  const customSvgUrl = getCardSvgPath(card);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses}
        relative flex flex-col justify-between p-0.5 shrink-0 select-none font-semibold transition-all duration-150
        bg-white text-slate-900 overflow-hidden rounded-md md:rounded-lg
        border ${selected ? 'border-amber-400 ring-2 ring-amber-400 -translate-y-2 shadow-lg shadow-amber-500/30' : 'border-slate-300 shadow-md hover:border-slate-400'}
        ${dimmed ? 'opacity-40 grayscale' : 'opacity-100'}
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
    >
      {/* 1. High-Resolution Vector SVG Card Image */}
      {!svgFailed && (
        <img
          src={customSvgUrl}
          alt={`${card.suit}_${card.label}`}
          onError={() => setSvgFailed(true)}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-md md:rounded-lg"
        />
      )}

      {/* 2. Seamless Vector CSS Fallback (only shown if SVG fails to load) */}
      {svgFailed && (
        <div className="w-full h-full p-1 flex flex-col justify-between">
          {/* Top Left Rank & Suit */}
          <div className={`flex flex-col items-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            <span className="font-mono font-bold">{card.label}</span>
            <span className="text-[10px] leading-tight">{card.suitSymbol}</span>
          </div>

          {/* Center Watermark */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              isRed ? 'text-rose-600/15' : 'text-slate-900/15'
            }`}
          >
            <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'}>
              {card.suitSymbol}
            </span>
          </div>

          {/* Bottom Right Inverted */}
          <div className={`flex flex-col items-center leading-none rotate-180 self-end ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            <span className="font-mono font-bold">{card.label}</span>
            <span className="text-[10px] leading-tight">{card.suitSymbol}</span>
          </div>
        </div>
      )}
    </button>
  );
};
