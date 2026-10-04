export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 2 - 14 (14 = Ace)
  label: string; // '2', '3', ..., '10', 'J', 'Q', 'K', 'A'
  suitSymbol: string; // ♠, ♥, ♣, ♦
  color: 'red' | 'black';
}

export type HandType =
  | 'HIGH_CARD'       // 乌龙
  | 'ONE_PAIR'        // 对子
  | 'TWO_PAIRS'       // 两对
  | 'THREE_OF_A_KIND' // 三条 / 冲三
  | 'STRAIGHT'        // 顺子
  | 'FLUSH'           // 同花
  | 'FULL_HOUSE'      // 葫芦 / 中墩葫芦
  | 'FOUR_OF_A_KIND'  // 铁支 / 炸弹
  | 'STRAIGHT_FLUSH'  // 同花顺
  | 'FIVE_OF_A_KIND'; // 五同

export interface DunEvaluation {
  type: HandType;
  typeName: string;
  scoreRank: number; // 1 to 9
  primaryRanks: number[]; // For tie-breaking
  bonusPoints: number; // e.g., Head 3-of-a-kind (+3), Mid full house (+2), Mid 4-of-kind (+8), etc.
}

export type SpecialHandType =
  | 'SUPREME_DRAGON'     // 至尊青龙 (同花一条龙)
  | 'DRAGON'             // 一条龙 (A-K)
  | 'TWELVE_ROYALS'      // 十二皇族 (全是J/Q/K/A)
  | 'THREE_STRAIGHT_FLUSH' // 三同花顺
  | 'THREE_QUADS'        // 三分天下 (3个铁支)
  | 'ALL_HIGH'           // 全大 (8-A)
  | 'ALL_LOW'            // 全小 (2-8)
  | 'ALL_ONE_COLOR'      // 凑一色 (全红/全黑)
  | 'FOUR_TRIPLES'       // 四套三条
  | 'FIVE_PAIRS_TRIPLE'  // 五对三条
  | 'SIX_PAIRS'          // 六对半
  | 'THREE_FLUSHES'      // 三同花
  | 'THREE_STRAIGHTS';   // 三顺子

export interface SpecialHandEvaluation {
  isSpecial: boolean;
  type?: SpecialHandType;
  name?: string;
  points: number;
  description?: string;
}

export interface PlayerHandArrangement {
  head: Card[];   // 3 cards (前墩)
  middle: Card[]; // 5 cards (中墩)
  tail: Card[];   // 5 cards (后墩)
  isDaoPai: boolean; // 是否倒牌 (违规: 前>中 或 中>后)
  daoPaiReason?: string;
  specialHand?: SpecialHandEvaluation;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isAi: boolean;
  cards: Card[]; // All 13 dealt cards
  arrangement: PlayerHandArrangement;
  isReady: boolean;
  totalScore: number;
  roundScore: number;
  roundDetails: {
    headScore: number;
    middleScore: number;
    tailScore: number;
    bonusScore: number;
    gunShotCount: number;
    isGrandSlam: boolean;
    specialHandPoints: number;
  };
}

export type GamePhase =
  | 'LOBBY'        // 准备 / 组桌
  | 'DEALING'      // 发牌动画
  | 'ARRANGING'    // 玩家理牌 (倒计时 / 智能推荐)
  | 'SHOWDOWN_HEAD'// 头道比牌
  | 'SHOWDOWN_MID' // 中道比牌
  | 'SHOWDOWN_TAIL'// 尾道比牌
  | 'SHOWDOWN_GUN' // 打枪判定
  | 'ROUND_RESULT' // 本局总结算
  | 'GAME_OVER';

export interface GunShotPair {
  shooterId: string;
  shooterName: string;
  targetId: string;
  targetName: string;
  multiplier: number; // 2x
}

export interface PairMatchResult {
  p1Id: string;
  p2Id: string;
  headWinner: string | 'TIE';
  middleWinner: string | 'TIE';
  tailWinner: string | 'TIE';
  p1Points: number;
  p2Points: number;
  isGunShot: boolean;
  gunShooterId?: string;
}

export interface SettlementSummary {
  pairMatches: PairMatchResult[];
  gunShots: GunShotPair[];
  grandSlamPlayerId?: string;
  grandSlamPlayerName?: string;
  scores: Record<string, number>;
  specialWins: { playerId: string; name: string; typeName: string; points: number }[];
}

export interface AutoArrangeOption {
  id: string;
  title: string;
  summary: string;
  strategy?: 'balanced' | 'aggressive' | 'middle_boost' | 'head_three';
  head: Card[];
  middle: Card[];
  tail: Card[];
  headEval: DunEvaluation;
  midEval: DunEvaluation;
  tailEval: DunEvaluation;
  expectedScore: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  text: string;
  time: string;
  isSystem?: boolean;
  type?: 'text' | 'emoji' | 'system';
}

export interface EmojiReaction {
  id: string;
  playerId: string;
  emoji: string;
}

export type NetworkMode = 'online' | 'local';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface OnlineRoomInfo {
  roomId: string;
  roomName: string;
  playersCount: number;
  maxPlayers: number;
  phase: GamePhase;
}
