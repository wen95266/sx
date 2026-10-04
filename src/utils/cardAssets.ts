import { Card, Suit } from '../types/game';

/**
 * Maps card suit and rank to standard SVG file names
 * Matches the uploaded files in /cards/ directory:
 * e.g. "ace_of_spades.svg", "10_of_hearts.svg", "king_of_clubs.svg", "back.svg"
 */
export function getCardSvgPath(card: Card): string {
  const rankMap: Record<number, string> = {
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'jack',
    12: 'queen',
    13: 'king',
    14: 'ace'
  };

  const rankStr = rankMap[card.rank] || card.label.toLowerCase();
  const suitStr = card.suit.toLowerCase();

  return `/cards/${rankStr}_of_${suitStr}.svg`;
}

/**
 * Returns alternative fallback paths in case the user named them differently
 */
export function getAlternativeCardSvgPaths(card: Card): string[] {
  const primary = getCardSvgPath(card);
  const suitStr = card.suit.toLowerCase();
  const labelStr = card.label;

  return [
    primary,                               // e.g. /cards/ace_of_spades.svg
    `/cards/${suitStr}_${labelStr}.svg`,   // e.g. /cards/spades_A.svg
    `/cards/${suitStr}_${card.rank}.svg`,  // e.g. /cards/spades_14.svg
    `/cards/${card.id}.svg`                // e.g. /cards/spades_14.svg
  ];
}

/**
 * Card back SVG file path
 */
export function getCardBackSvgPath(): string {
  return '/cards/back.svg';
}

export interface CardAssetMeta {
  id: string;
  suit: Suit;
  rank: number;
  label: string;
  suitSymbol: string;
  chineseName: string;
  fileName: string;
}

const SUIT_NAMES: Record<Suit, { name: string; symbol: string }> = {
  spades: { name: '黑桃', symbol: '♠' },
  hearts: { name: '红桃', symbol: '♥' },
  clubs: { name: '梅花', symbol: '♣' },
  diamonds: { name: '方块', symbol: '♦' }
};

const RANK_LABELS: Record<number, { label: string; text: string; rankSlug: string }> = {
  2: { label: '2', text: '2', rankSlug: '2' },
  3: { label: '3', text: '3', rankSlug: '3' },
  4: { label: '4', text: '4', rankSlug: '4' },
  5: { label: '5', text: '5', rankSlug: '5' },
  6: { label: '6', text: '6', rankSlug: '6' },
  7: { label: '7', text: '7', rankSlug: '7' },
  8: { label: '8', text: '8', rankSlug: '8' },
  9: { label: '9', text: '9', rankSlug: '9' },
  10: { label: '10', text: '10', rankSlug: '10' },
  11: { label: 'J', text: 'J', rankSlug: 'jack' },
  12: { label: 'Q', text: 'Q', rankSlug: 'queen' },
  13: { label: 'K', text: 'K', rankSlug: 'king' },
  14: { label: 'A', text: 'A', rankSlug: 'ace' }
};

/**
 * Returns full list of 52 poker cards metadata with file names
 */
export function getAll52CardAssets(): CardAssetMeta[] {
  const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
  const list: CardAssetMeta[] = [];

  for (const s of suits) {
    for (let r = 2; r <= 14; r++) {
      const rInfo = RANK_LABELS[r];
      const sInfo = SUIT_NAMES[s];
      list.push({
        id: `${s}_${r}`,
        suit: s,
        rank: r,
        label: rInfo.label,
        suitSymbol: sInfo.symbol,
        chineseName: `${sInfo.name}${rInfo.text}`,
        fileName: `${rInfo.rankSlug}_of_${s}.svg`
      });
    }
  }

  return list;
}
