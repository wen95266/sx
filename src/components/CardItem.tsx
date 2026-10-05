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

  // Significantly enlarged card dimensions for rich mobile touch & display
  const sizeClasses = {
    sm: 'w-12 h-17 text-xs rounded-md',
    md: 'w-[68px] h-[98px] sm:w-[80px] sm:h-[114px] text-sm rounded-xl',
    lg: 'w-[82px] h-[116px] sm:w-[96px] sm:h-[136px] text-base rounded-2xl'
  }[size];

  if (showBack) {
    const backSvgUrl = getCardBackSvgPath();
    return (
      <div
        className={`${sizeClasses} relative rounded-xl shadow-lg flex items-center justify-center select-none shrink-0 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/40`}
      >
        {!backSvgFailed ? (
          <img
            src={backSvgUrl}
            alt="Card Back"
            onError={() => setBackSvgFailed(true)}
            className="w-full h-full object-cover pointer-events-none rounded-xl"
          />
        ) : (
          <div className="absolute inset-1 border border-blue-400/20 rounded-lg flex items-center justify-center">
            <div className="w-5 h-7 border border-amber-500/30 rotate-45 flex items-center justify-center">
              <span className="text-[11px] text-amber-400/60 font-serif font-bold">13</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Exact path matching user's uploaded SVG card file:
  const customSvgUrl = getCardSvgPath(card);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses}
        relative flex flex-col justify-between p-0.5 shrink-0 select-none font-semibold transition-all duration-150
        bg-white text-slate-900 overflow-hidden rounded-xl
        border-2 ${selected ? 'border-amber-400 ring-4 ring-amber-400/50 -translate-y-3 shadow-xl shadow-amber-500/40' : 'border-slate-300/90 shadow-md hover:border-slate-400'}
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
          className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-xl"
        />
      )}

      {/* 2. Seamless Vector CSS Fallback */}
      {svgFailed && (
        <div className="w-full h-full p-1.5 flex flex-col justify-between">
          {/* Top Left Rank & Suit */}
          <div className={`flex flex-col items-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            <span className="font-mono font-bold text-sm sm:text-base">{card.label}</span>
            <span className="text-xs leading-tight">{card.suitSymbol}</span>
          </div>

          {/* Center Watermark */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              isRed ? 'text-rose-600/15' : 'text-slate-900/15'
            }`}
          >
            <span className={size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-5xl'}>
              {card.suitSymbol}
            </span>
          </div>

          {/* Bottom Right Inverted Rank */}
          <div className={`flex flex-col items-center leading-none self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            <span className="font-mono font-bold text-xs sm:text-sm">{card.label}</span>
            <span className="text-[10px] leading-tight">{card.suitSymbol}</span>
          </div>
        </div>
      )}
    </button>
  );
};
