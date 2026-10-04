import {
  Card,
  DunEvaluation,
  GunShotPair,
  HandType,
  PairMatchResult,
  Player,
  PlayerHandArrangement,
  SettlementSummary,
  SpecialHandEvaluation,
  Suit,
  AutoArrangeOption
} from '../types/game';

// Card Helpers
export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦'
};

export const RANK_LABELS: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        label: RANK_LABELS[rank],
        suitSymbol: SUIT_SYMBOLS[suit],
        color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    const suitOrder: Record<Suit, number> = { spades: 4, hearts: 3, clubs: 2, diamonds: 1 };
    return suitOrder[b.suit] - suitOrder[a.suit];
  });
}

// Evaluate a 3-card (Head) or 5-card (Mid/Tail) Dun
export function evaluateDun(cards: Card[], isHead: boolean): DunEvaluation {
  if (!cards || (isHead && cards.length !== 3) || (!isHead && cards.length !== 5)) {
    return {
      type: 'HIGH_CARD',
      typeName: '未排满',
      scoreRank: 0,
      primaryRanks: [],
      bonusPoints: 0
    };
  }

  const sorted = sortCards(cards);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  // Group by rank count
  const rankCountMap: Record<number, number> = {};
  ranks.forEach(r => { rankCountMap[r] = (rankCountMap[r] || 0) + 1; });
  
  const rankCounts = Object.entries(rankCountMap)
    .map(([rankStr, count]) => ({ rank: Number(rankStr), count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : b.rank - a.rank));

  // Check 3-card Dun (Head)
  if (isHead) {
    if (rankCounts[0].count === 3) {
      return {
        type: 'THREE_OF_A_KIND',
        typeName: '三条(冲三)',
        scoreRank: 4,
        primaryRanks: [rankCounts[0].rank],
        bonusPoints: 3 // Head 3 of a kind bonus
      };
    }
    if (rankCounts[0].count === 2) {
      return {
        type: 'ONE_PAIR',
        typeName: `对${RANK_LABELS[rankCounts[0].rank]}`,
        scoreRank: 2,
        primaryRanks: [rankCounts[0].rank, rankCounts[1].rank],
        bonusPoints: 0
      };
    }
    return {
      type: 'HIGH_CARD',
      typeName: `乌龙 (${RANK_LABELS[ranks[0]]})`,
      scoreRank: 1,
      primaryRanks: ranks,
      bonusPoints: 0
    };
  }

  // 5-Card Dun (Middle or Tail)
  const isAllSameSuit = suits.every(s => s === suits[0]);
  
  // Check Straight
  let isStraight = false;
  let straightHighRank = 0;
  
  // Normal consecutive check
  const isConsecutive = ranks.every((r, idx) => idx === 0 || ranks[idx - 1] - r === 1);
  if (isConsecutive) {
    isStraight = true;
    straightHighRank = ranks[0];
  } else if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
    // Wheel straight: A-2-3-4-5 (5-high straight)
    isStraight = true;
    straightHighRank = 5;
  }

  // 1. Straight Flush (同花顺)
  if (isAllSameSuit && isStraight) {
    return {
      type: 'STRAIGHT_FLUSH',
      typeName: `同花顺 (${RANK_LABELS[straightHighRank]}高)`,
      scoreRank: 9,
      primaryRanks: [straightHighRank],
      bonusPoints: 5 // Tail SF +5, Mid SF +10 in settlement
    };
  }

  // 2. Four of a Kind (铁支 / 炸弹)
  if (rankCounts[0].count === 4) {
    return {
      type: 'FOUR_OF_A_KIND',
      typeName: `铁支 (${RANK_LABELS[rankCounts[0].rank]})`,
      scoreRank: 8,
      primaryRanks: [rankCounts[0].rank, rankCounts[1].rank],
      bonusPoints: 4 // Tail Quads +4, Mid Quads +8
    };
  }

  // 3. Full House (葫芦)
  if (rankCounts[0].count === 3 && rankCounts[1].count === 2) {
    return {
      type: 'FULL_HOUSE',
      typeName: `葫芦 (${RANK_LABELS[rankCounts[0].rank]}带${RANK_LABELS[rankCounts[1].rank]})`,
      scoreRank: 7,
      primaryRanks: [rankCounts[0].rank, rankCounts[1].rank],
      bonusPoints: 0 // Middle Full House gets +2 in settlement
    };
  }

  // 4. Flush (同花)
  if (isAllSameSuit) {
    return {
      type: 'FLUSH',
      typeName: `同花 (${RANK_LABELS[ranks[0]]}高)`,
      scoreRank: 6,
      primaryRanks: ranks,
      bonusPoints: 0
    };
  }

  // 5. Straight (顺子)
  if (isStraight) {
    return {
      type: 'STRAIGHT',
      typeName: `顺子 (${RANK_LABELS[straightHighRank]}高)`,
      scoreRank: 5,
      primaryRanks: [straightHighRank],
      bonusPoints: 0
    };
  }

  // 6. Three of a Kind (三条)
  if (rankCounts[0].count === 3) {
    return {
      type: 'THREE_OF_A_KIND',
      typeName: `三条 (${RANK_LABELS[rankCounts[0].rank]})`,
      scoreRank: 4,
      primaryRanks: [rankCounts[0].rank, rankCounts[1].rank, rankCounts[2].rank],
      bonusPoints: 0
    };
  }

  // 7. Two Pairs (两对)
  if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
    const highPair = Math.max(rankCounts[0].rank, rankCounts[1].rank);
    const lowPair = Math.min(rankCounts[0].rank, rankCounts[1].rank);
    return {
      type: 'TWO_PAIRS',
      typeName: `两对 (${RANK_LABELS[highPair]}&${RANK_LABELS[lowPair]})`,
      scoreRank: 3,
      primaryRanks: [highPair, lowPair, rankCounts[2].rank],
      bonusPoints: 0
    };
  }

  // 8. One Pair (对子)
  if (rankCounts[0].count === 2) {
    return {
      type: 'ONE_PAIR',
      typeName: `对子 (${RANK_LABELS[rankCounts[0].rank]})`,
      scoreRank: 2,
      primaryRanks: [rankCounts[0].rank, ...ranks.filter(r => r !== rankCounts[0].rank)],
      bonusPoints: 0
    };
  }

  // 9. High Card (乌龙)
  return {
    type: 'HIGH_CARD',
    typeName: `乌龙 (${RANK_LABELS[ranks[0]]}高)`,
    scoreRank: 1,
    primaryRanks: ranks,
    bonusPoints: 0
  };
}

// Compare two Duns. Returns > 0 if dunA > dunB, < 0 if dunA < dunB, 0 if equal.
export function compareDuns(dunA: DunEvaluation, dunB: DunEvaluation): number {
  if (dunA.scoreRank !== dunB.scoreRank) {
    return dunA.scoreRank - dunB.scoreRank;
  }
  const len = Math.min(dunA.primaryRanks.length, dunB.primaryRanks.length);
  for (let i = 0; i < len; i++) {
    if (dunA.primaryRanks[i] !== dunB.primaryRanks[i]) {
      return dunA.primaryRanks[i] - dunB.primaryRanks[i];
    }
  }
  return 0;
}

// Check Dao-Pai (倒牌): Head <= Mid <= Tail
export function validateDaoPai(head: Card[], middle: Card[], tail: Card[]): { isDaoPai: boolean; reason?: string } {
  if (head.length !== 3 || middle.length !== 5 || tail.length !== 5) {
    return { isDaoPai: false }; // Not completed yet
  }

  const headEval = evaluateDun(head, true);
  const midEval = evaluateDun(middle, false);
  const tailEval = evaluateDun(tail, false);

  if (compareDuns(headEval, midEval) > 0) {
    return {
      isDaoPai: true,
      reason: `前墩 [${headEval.typeName}] 大于 中墩 [${midEval.typeName}]，发生倒牌违规！`
    };
  }

  if (compareDuns(midEval, tailEval) > 0) {
    return {
      isDaoPai: true,
      reason: `中墩 [${midEval.typeName}] 大于 尾墩 [${tailEval.typeName}]，发生倒牌违规！`
    };
  }

  return { isDaoPai: false };
}

// Special Hand (特殊牌型) Recognition
export function evaluateSpecialHand(cards: Card[]): SpecialHandEvaluation {
  if (!cards || cards.length !== 13) {
    return { isSpecial: false, points: 0 };
  }

  const sorted = sortCards(cards);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  // 1. 至尊青龙 (Supreme Dragon): 13 cards A-K same suit
  const isAllSameSuit = suits.every(s => s === suits[0]);
  const isAtoK = ranks.length === 13 && ranks[0] === 14 && ranks[12] === 2 &&
    new Set(ranks).size === 13;

  if (isAllSameSuit && isAtoK) {
    return {
      isSpecial: true,
      type: 'SUPREME_DRAGON',
      name: '至尊青龙 (同花十三水)',
      points: 108,
      description: '十三张同花色A至K，至高无上牌型'
    };
  }

  // 2. 一条龙 (Dragon): 13 cards A-K
  if (isAtoK) {
    return {
      isSpecial: true,
      type: 'DRAGON',
      name: '一条龙 (A-K)',
      points: 36,
      description: '十三张不重复A至K'
    };
  }

  // 3. 十二皇族 (Twelve Royals): All J, Q, K, A
  const royalCount = ranks.filter(r => r >= 11).length;
  if (royalCount >= 12) {
    return {
      isSpecial: true,
      type: 'TWELVE_ROYALS',
      name: '十二皇族',
      points: 24,
      description: '十三张牌中有12张以上为J、Q、K、A'
    };
  }

  // Rank counts
  const rankCountMap: Record<number, number> = {};
  ranks.forEach(r => { rankCountMap[r] = (rankCountMap[r] || 0) + 1; });
  const counts = Object.values(rankCountMap).sort((a, b) => b - a);

  // 4. 三分天下 (Three Quads): 3 sets of 4-of-a-kind + 1 single
  if (counts[0] === 4 && counts[1] === 4 && counts[2] === 4) {
    return {
      isSpecial: true,
      type: 'THREE_QUADS',
      name: '三分天下 (三炸弹)',
      points: 20,
      description: '包含三副铁支(炸弹)'
    };
  }

  // 5. 全大 (All High): All >= 8
  if (ranks.every(r => r >= 8)) {
    return {
      isSpecial: true,
      type: 'ALL_HIGH',
      name: '全大 (8-A)',
      points: 10,
      description: '十三张牌点数皆为8至A'
    };
  }

  // 6. 全小 (All Low): All <= 8
  if (ranks.every(r => r <= 8)) {
    return {
      isSpecial: true,
      type: 'ALL_LOW',
      name: '全小 (2-8)',
      points: 10,
      description: '十三张牌点数皆为2至8'
    };
  }

  // 7. 凑一色 (All One Color): All red or all black
  const isAllRed = cards.every(c => c.suit === 'hearts' || c.suit === 'diamonds');
  const isAllBlack = cards.every(c => c.suit === 'spades' || c.suit === 'clubs');
  if (isAllRed || isAllBlack) {
    return {
      isSpecial: true,
      type: 'ALL_ONE_COLOR',
      name: isAllRed ? '凑一色 (全红)' : '凑一色 (全黑)',
      points: 10,
      description: '十三张牌均为同一颜色'
    };
  }

  // 8. 四套三条 (Four Triples): 4 triples + 1 single
  if (counts[0] === 3 && counts[1] === 3 && counts[2] === 3 && counts[3] === 3) {
    return {
      isSpecial: true,
      type: 'FOUR_TRIPLES',
      name: '四套三条',
      points: 8,
      description: '四组三条加一张单牌'
    };
  }

  // 9. 五对三条 (Five Pairs + 1 Triple)
  if (counts[0] === 3 && counts.filter(c => c === 2).length === 5) {
    return {
      isSpecial: true,
      type: 'FIVE_PAIRS_TRIPLE',
      name: '五对三条',
      points: 6,
      description: '五组对子加一组三条'
    };
  }

  // 10. 六对半 (Six Pairs): 6 pairs + 1 single
  if (counts.filter(c => c === 2).length === 6 || (counts[0] === 4 && counts.filter(c => c === 2).length === 4)) {
    return {
      isSpecial: true,
      type: 'SIX_PAIRS',
      name: '六对半',
      points: 4,
      description: '六对牌加一张单牌'
    };
  }

  return { isSpecial: false, points: 0 };
}

// Generate Combinations Helper
function getCombinations<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  function backtrack(start: number, current: T[]) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

// Smart Auto-Arranger / Solver for 13 cards
export function calculateSmartArrangements(cards: Card[]): AutoArrangeOption[] {
  if (!cards || cards.length !== 13) return [];

  const options: AutoArrangeOption[] = [];
  const cardMap = new Map<string, Card>();
  cards.forEach(c => cardMap.set(c.id, c));

  // Try top 5-card combinations for Tail
  const tailCombos = getCombinations(cards, 5);
  
  // Sort tail combos by strength descending
  const evaluatedTails = tailCombos.map(tail => ({
    cards: tail,
    eval: evaluateDun(tail, false)
  })).sort((a, b) => compareDuns(b.eval, a.eval));

  // Pick top distinctive tail combinations
  const selectedTails = evaluatedTails.slice(0, 15);

  for (const tailItem of selectedTails) {
    const tailIds = new Set(tailItem.cards.map(c => c.id));
    const remaining8 = cards.filter(c => !tailIds.has(c.id));
    
    // Choose 5 for Middle
    const midCombos = getCombinations(remaining8, 5);
    const evaluatedMids = midCombos.map(mid => ({
      cards: mid,
      eval: evaluateDun(mid, false)
    })).filter(m => compareDuns(tailItem.eval, m.eval) >= 0) // Tail >= Mid
      .sort((a, b) => compareDuns(b.eval, a.eval));

    for (const midItem of evaluatedMids.slice(0, 3)) {
      const midIds = new Set(midItem.cards.map(c => c.id));
      const headCards = remaining8.filter(c => !midIds.has(c.id));
      const headEval = evaluateDun(headCards, true);

      // Validate Head <= Mid
      if (compareDuns(midItem.eval, headEval) >= 0) {
        // Calculate Expected Hand Quality Score
        let expectedScore = tailItem.eval.scoreRank * 100 + midItem.eval.scoreRank * 20 + headEval.scoreRank * 5;
        if (headEval.type === 'THREE_OF_A_KIND') expectedScore += 30; // 冲三 bonus
        if (midItem.eval.type === 'FULL_HOUSE') expectedScore += 25; // 中墩葫芦
        if (midItem.eval.type === 'FOUR_OF_A_KIND') expectedScore += 60; // 中墩铁支
        if (midItem.eval.type === 'STRAIGHT_FLUSH') expectedScore += 80;

        const title = `${tailItem.eval.typeName} (尾) + ${midItem.eval.typeName} (中) + ${headEval.typeName} (头)`;
        const summary = `后墩: ${tailItem.eval.typeName} | 中墩: ${midItem.eval.typeName} | 前墩: ${headEval.typeName}`;

        options.push({
          id: `opt_${options.length}_${tailItem.eval.scoreRank}_${midItem.eval.scoreRank}`,
          title,
          summary,
          head: sortCards(headCards),
          middle: sortCards(midItem.cards),
          tail: sortCards(tailItem.cards),
          headEval,
          midEval: midItem.eval,
          tailEval: tailItem.eval,
          expectedScore
        });

        if (options.length >= 10) break;
      }
    }
    if (options.length >= 10) break;
  }

  // Sort by expected score and deduplicate
  options.sort((a, b) => b.expectedScore - a.expectedScore);
  
  // Return top 4 distinctive recommendations
  const uniqueOptions: AutoArrangeOption[] = [];
  const seenSummaries = new Set<string>();
  for (const opt of options) {
    if (!seenSummaries.has(opt.summary)) {
      seenSummaries.add(opt.summary);
      uniqueOptions.push(opt);
      if (uniqueOptions.length >= 4) break;
    }
  }

  return uniqueOptions;
}

// Full 4-Player Settlement Engine (1v1 比牌, 打枪 2倍, 全垒打 4倍, 特殊牌型)
export function calculateGameSettlement(players: Player[]): SettlementSummary {
  const scores: Record<string, number> = {};
  players.forEach(p => { scores[p.id] = 0; });

  const pairMatches: PairMatchResult[] = [];
  const gunShots: GunShotPair[] = [];
  const specialWins: { playerId: string; name: string; typeName: string; points: number }[] = [];

  // Check if any player has Special Hand
  const specialPlayers = players.filter(p => p.arrangement.specialHand?.isSpecial);
  if (specialPlayers.length > 0) {
    // Special hand wins directly against non-special players
    specialPlayers.forEach(sp => {
      const specialHand = sp.arrangement.specialHand!;
      specialWins.push({
        playerId: sp.id,
        name: sp.name,
        typeName: specialHand.name || '特殊牌型',
        points: specialHand.points
      });

      players.forEach(other => {
        if (other.id !== sp.id) {
          const winPoints = specialHand.points;
          scores[sp.id] += winPoints;
          scores[other.id] -= winPoints;
        }
      });
    });

    return {
      pairMatches: [],
      gunShots: [],
      scores,
      specialWins
    };
  }

  // Normal 1v1 Round-Robin Comparison
  // Track wins for Grand Slam detection
  const totalVictories: Record<string, number> = {};
  players.forEach(p => { totalVictories[p.id] = 0; });

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];

      // Handle Dao-Pai foul penalty
      if (p1.arrangement.isDaoPai && !p2.arrangement.isDaoPai) {
        scores[p1.id] -= 12;
        scores[p2.id] += 12;
        pairMatches.push({
          p1Id: p1.id,
          p2Id: p2.id,
          headWinner: p2.id,
          middleWinner: p2.id,
          tailWinner: p2.id,
          p1Points: -12,
          p2Points: 12,
          isGunShot: true,
          gunShooterId: p2.id
        });
        continue;
      }
      if (!p1.arrangement.isDaoPai && p2.arrangement.isDaoPai) {
        scores[p1.id] += 12;
        scores[p2.id] -= 12;
        pairMatches.push({
          p1Id: p1.id,
          p2Id: p2.id,
          headWinner: p1.id,
          middleWinner: p1.id,
          tailWinner: p1.id,
          p1Points: 12,
          p2Points: -12,
          isGunShot: true,
          gunShooterId: p1.id
        });
        continue;
      }

      const p1HeadEval = evaluateDun(p1.arrangement.head, true);
      const p1MidEval = evaluateDun(p1.arrangement.middle, false);
      const p1TailEval = evaluateDun(p1.arrangement.tail, false);

      const p2HeadEval = evaluateDun(p2.arrangement.head, true);
      const p2MidEval = evaluateDun(p2.arrangement.middle, false);
      const p2TailEval = evaluateDun(p2.arrangement.tail, false);

      // Compare Head
      const headComp = compareDuns(p1HeadEval, p2HeadEval);
      const headWinner = headComp > 0 ? p1.id : headComp < 0 ? p2.id : 'TIE';
      let headPts = 0;
      if (headComp > 0) headPts = 1 + (p1HeadEval.bonusPoints || 0);
      else if (headComp < 0) headPts = -(1 + (p2HeadEval.bonusPoints || 0));

      // Compare Middle
      const midComp = compareDuns(p1MidEval, p2MidEval);
      const midWinner = midComp > 0 ? p1.id : midComp < 0 ? p2.id : 'TIE';
      let midPts = 0;
      let midBonus = 0;
      if (midComp > 0) {
        if (p1MidEval.type === 'FULL_HOUSE') midBonus = 2;
        else if (p1MidEval.type === 'FOUR_OF_A_KIND') midBonus = 8;
        else if (p1MidEval.type === 'STRAIGHT_FLUSH') midBonus = 10;
        midPts = 1 + midBonus;
      } else if (midComp < 0) {
        if (p2MidEval.type === 'FULL_HOUSE') midBonus = 2;
        else if (p2MidEval.type === 'FOUR_OF_A_KIND') midBonus = 8;
        else if (p2MidEval.type === 'STRAIGHT_FLUSH') midBonus = 10;
        midPts = -(1 + midBonus);
      }

      // Compare Tail
      const tailComp = compareDuns(p1TailEval, p2TailEval);
      const tailWinner = tailComp > 0 ? p1.id : tailComp < 0 ? p2.id : 'TIE';
      let tailPts = 0;
      let tailBonus = 0;
      if (tailComp > 0) {
        if (p1TailEval.type === 'FOUR_OF_A_KIND') tailBonus = 4;
        else if (p1TailEval.type === 'STRAIGHT_FLUSH') tailBonus = 5;
        tailPts = 1 + tailBonus;
      } else if (tailComp < 0) {
        if (p2TailEval.type === 'FOUR_OF_A_KIND') tailBonus = 4;
        else if (p2TailEval.type === 'STRAIGHT_FLUSH') tailBonus = 5;
        tailPts = -(1 + tailBonus);
      }

      let netPts = headPts + midPts + tailPts;

      // Check Gun Shot (打枪 - 3-0 clean sweep against opponent)
      const p1Sweep = headComp > 0 && midComp > 0 && tailComp > 0;
      const p2Sweep = headComp < 0 && midComp < 0 && tailComp < 0;

      let isGunShot = false;
      let gunShooterId: string | undefined = undefined;

      if (p1Sweep) {
        netPts *= 2; // Double points
        isGunShot = true;
        gunShooterId = p1.id;
        gunShots.push({
          shooterId: p1.id,
          shooterName: p1.name,
          targetId: p2.id,
          targetName: p2.name,
          multiplier: 2
        });
        totalVictories[p1.id] = (totalVictories[p1.id] || 0) + 1;
      } else if (p2Sweep) {
        netPts *= 2; // Double points
        isGunShot = true;
        gunShooterId = p2.id;
        gunShots.push({
          shooterId: p2.id,
          shooterName: p2.name,
          targetId: p1.id,
          targetName: p1.name,
          multiplier: 2
        });
        totalVictories[p2.id] = (totalVictories[p2.id] || 0) + 1;
      }

      scores[p1.id] += netPts;
      scores[p2.id] -= netPts;

      pairMatches.push({
        p1Id: p1.id,
        p2Id: p2.id,
        headWinner,
        middleWinner: midWinner,
        tailWinner,
        p1Points: netPts,
        p2Points: -netPts,
        isGunShot,
        gunShooterId
      });
    }
  }

  // Check Grand Slam (全垒打 / 全胜: 1 player shoots all 3 opponents)
  let grandSlamPlayerId: string | undefined = undefined;
  let grandSlamPlayerName: string | undefined = undefined;

  for (const p of players) {
    if (totalVictories[p.id] === players.length - 1) {
      grandSlamPlayerId = p.id;
      grandSlamPlayerName = p.name;
      // Grand slam multiplies the shooter's winnings by 2x again!
      scores[p.id] *= 2;
      players.forEach(other => {
        if (other.id !== p.id) {
          scores[other.id] *= 2;
        }
      });
      break;
    }
  }

  return {
    pairMatches,
    gunShots,
    grandSlamPlayerId,
    grandSlamPlayerName,
    scores,
    specialWins
  };
}
