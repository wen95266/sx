import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Card,
  GamePhase,
  Player,
  AutoArrangeOption,
  DunEvaluation,
  SettlementSummary,
  ChatMessage,
  EmojiReaction,
  SpeechBubble,
  LobbyRoom
} from '../types/game';
import {
  createDeck,
  shuffleDeck,
  sortCards,
  evaluateDun,
  validateDaoPai,
  calculateSmartArrangements,
  calculateGameSettlement
} from '../utils/cardLogic';
import { SoundEffects } from '../utils/audio';
import { CardItem } from './CardItem';
import {
  getStoredUser,
  recordGameResult,
  UserProfile
} from '../utils/authStorage';
import {
  ArrowLeft,
  Flame,
  Coins,
  MessageCircle,
  Mic,
  Volume2,
  Send,
  Sparkles,
  CheckCircle2,
  X,
  RotateCcw,
  Trophy,
  Smile
} from 'lucide-react';

interface GameTableProps {
  currentRoom?: LobbyRoom;
  onBackToLobby: () => void;
}

const EMOJI_OPTIONS = ['🔥', '👍', '😎', '🤣', '😭', '🤯', '👑', '💸'];

const QUICK_PHRASES = [
  '快点出牌啊，我等得花儿都谢了！⏱️',
  '思考这么久，难道拿了十三水？🤔',
  '这把牌太神，我都不好意思赢你们！😎',
  '准备好水数，这把我要通杀全场！💥',
  '手下留情，别打我枪啊大佬！😭',
  '给个机会，下把一定逆天翻盘！✨'
];

export const GameTable: React.FC<GameTableProps> = ({
  currentRoom,
  onBackToLobby
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [roundNumber, setRoundNumber] = useState(28);

  // Game Phases
  const [phase, setPhase] = useState<GamePhase>('ARRANGING');
  const [countdown, setCountdown] = useState(30);

  // 8 Player Seats
  const [activeSeatId, setActiveSeatId] = useState('player_me');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player_me',
      name: '我',
      avatar: '😎',
      isAi: false,
      totalScore: 0,
      roundScore: 0,
      isReady: false,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot1',
      name: '智多星',
      avatar: '🤖',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot2',
      name: '玩家3',
      avatar: '🐲',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot3',
      name: '玩家4',
      avatar: '🦊',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot4',
      name: '玩家5',
      avatar: '🐰',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot5',
      name: '玩家6',
      avatar: '🐼',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot6',
      name: '玩家7',
      avatar: '🦅',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    },
    {
      id: 'player_bot7',
      name: '玩家8',
      avatar: '🐟',
      isAi: true,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      roundDetails: {
        headScore: 0,
        middleScore: 0,
        tailScore: 0,
        bonusScore: 0,
        gunShotCount: 0,
        isGrandSlam: false,
        specialHandPoints: 0
      }
    }
  ]);

  // Card Duns
  const [headCards, setHeadCards] = useState<Card[]>([]);
  const [midCards, setMidCards] = useState<Card[]>([]);
  const [tailCards, setTailCards] = useState<Card[]>([]);
  const [smartOptions, setSmartOptions] = useState<AutoArrangeOption[]>([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);

  // Settlement & Showdown
  const [settlement, setSettlement] = useState<SettlementSummary | null>(null);

  // Chat, Floating Danmu & Bubbles
  const [chatInput, setChatInput] = useState('');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [activeReactions, setActiveReactions] = useState<EmojiReaction[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);

  // Sound switch
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Deal 13 Cards to everyone & Auto Compute Best Hand
  const startNewRound = useCallback(() => {
    if (soundEnabled) SoundEffects.playDealCard();

    const deck = shuffleDeck(createDeck());
    const handMe = sortCards(deck.slice(0, 13));
    const handBot1 = sortCards(deck.slice(13, 26));
    const handBot2 = sortCards(deck.slice(26, 39));
    const handBot3 = sortCards(deck.slice(39, 52));

    const options = calculateSmartArrangements(handMe);
    setSmartOptions(options);
    setCurrentOptionIndex(0);

    if (options.length > 0) {
      setHeadCards(options[0].head);
      setMidCards(options[0].middle);
      setTailCards(options[0].tail);
    } else {
      setHeadCards(handMe.slice(0, 3));
      setMidCards(handMe.slice(3, 8));
      setTailCards(handMe.slice(8, 13));
    }

    // Set bot arrangements
    const updatedPlayers = players.map((p, idx) => {
      let hand = handMe;
      if (idx === 1) hand = handBot1;
      if (idx === 2) hand = handBot2;
      if (idx === 3) hand = handBot3;

      const pOpts = calculateSmartArrangements(hand);
      const chosen = pOpts[0] || {
        head: hand.slice(0, 3),
        middle: hand.slice(3, 8),
        tail: hand.slice(8, 13)
      };

      return {
        ...p,
        cards: hand,
        isReady: idx !== 0,
        roundScore: 0,
        arrangement: {
          head: chosen.head,
          middle: chosen.middle,
          tail: chosen.tail,
          isDaoPai: false
        }
      };
    });

    setPlayers(updatedPlayers);
    setSettlement(null);
    setCountdown(30);
    setPhase('ARRANGING');
    setRoundNumber((prev) => prev + 1);
  }, [soundEnabled, players]);

  // Initial Deal on Mount
  useEffect(() => {
    startNewRound();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'ARRANGING') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitHand();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, headCards, midCards, tailCards]);

  // Cycle Through Smart Hand Combinations
  const handleCycleSmartHand = () => {
    if (smartOptions.length === 0) return;
    if (soundEnabled) SoundEffects.playCardClick();

    const nextIndex = (currentOptionIndex + 1) % smartOptions.length;
    setCurrentOptionIndex(nextIndex);
    const opt = smartOptions[nextIndex];

    setHeadCards(opt.head);
    setMidCards(opt.middle);
    setTailCards(opt.tail);
  };

  // Submit Hand & Trigger Showdown
  const handleSubmitHand = () => {
    if (soundEnabled) SoundEffects.playCardClick();

    const finalHead = headCards.length === 3 ? headCards : smartOptions[0]?.head || headCards;
    const finalMid = midCards.length === 5 ? midCards : smartOptions[0]?.middle || midCards;
    const finalTail = tailCards.length === 5 ? tailCards : smartOptions[0]?.tail || tailCards;

    const daoPaiResult = validateDaoPai(finalHead, finalMid, finalTail);

    const updatedPlayers = players.map((p) => {
      if (p.id === 'player_me') {
        return {
          ...p,
          isReady: true,
          arrangement: {
            head: finalHead,
            middle: finalMid,
            tail: finalTail,
            isDaoPai: daoPaiResult.isDaoPai,
            daoPaiReason: daoPaiResult.reason
          }
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setPhase('SHOWDOWN_HEAD');

    // Step 1: Head Showdown (前墩)
    setTimeout(() => {
      setPhase('SHOWDOWN_MID');

      // Step 2: Middle Showdown (中墩)
      setTimeout(() => {
        setPhase('SHOWDOWN_TAIL');

        // Step 3: Tail Showdown (后墩)
        setTimeout(() => {
          const activeFour = updatedPlayers.slice(0, 4);
          const result = calculateGameSettlement(activeFour);

          setSettlement(result);
          setPhase('ROUND_RESULT');

          const myDelta = result.scores['player_me'] || 0;
          const updatedUser = recordGameResult(myDelta, myDelta > 0, 0, false, false);
          setCurrentUser(updatedUser);

          if (myDelta > 0) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            if (soundEnabled) SoundEffects.playFanfare();
          } else {
            if (soundEnabled) SoundEffects.playWarning();
          }
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Send message or quick phrase
  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || chatInput.trim();
    if (!content) return;

    const bubble: SpeechBubble = {
      id: `bubble_${Date.now()}`,
      playerId: 'player_me',
      text: content,
      createdAt: Date.now()
    };
    setSpeechBubbles((prev) => [...prev, bubble]);
    setChatInput('');
    if (soundEnabled) SoundEffects.playMessagePop();

    setTimeout(() => {
      setSpeechBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    }, 3500);
  };

  // Trigger Emoji Reaction
  const handleSendEmoji = (emoji: string) => {
    const rx: EmojiReaction = {
      id: `emoji_${Date.now()}`,
      playerId: 'player_me',
      emoji
    };
    setActiveReactions((prev) => [...prev, rx]);
    if (soundEnabled) SoundEffects.playEmojiReaction();
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== rx.id));
    }, 2500);
  };

  // Dun Evaluations
  const headEval: DunEvaluation = evaluateDun(headCards, true);
  const midEval: DunEvaluation = evaluateDun(midCards, false);
  const tailEval: DunEvaluation = evaluateDun(tailCards, false);

  const getDunLabel = (evalResult: DunEvaluation, cards: Card[], isHead = false) => {
    if (cards.length === 0) return '未选牌';

    const rankLabels = cards.map((c) => c.label);
    if (evalResult.type === 'ONE_PAIR') {
      const pairRank = evalResult.primaryRanks[0];
      const pairLabel = cards.find((c) => c.rank === pairRank)?.label || '';
      const singles = cards.filter((c) => c.rank !== pairRank).map((c) => c.label).join(' ');
      return `[对子 (一对)] 对 ${pairLabel} ${singles ? `(单张 ${singles})` : ''}`;
    }
    if (evalResult.type === 'FLUSH') {
      const topRank = evalResult.primaryRanks[0];
      const topLabel = cards.find((c) => c.rank === topRank)?.label || '';
      return `[同花 (五张同色)] 同花 (${cards[0]?.suitSymbol || ''} ${topLabel}高)`;
    }
    if (evalResult.type === 'FULL_HOUSE') {
      const tripRank = evalResult.primaryRanks[0];
      const pairRank = evalResult.primaryRanks[1];
      const tripLabel = cards.find((c) => c.rank === tripRank)?.label || '';
      const pairLabel = cards.find((c) => c.rank === pairRank)?.label || '';
      return `[葫芦 (三带二)] 葫芦 (${tripLabel}带${pairLabel})`;
    }
    if (evalResult.type === 'STRAIGHT') {
      const topRank = evalResult.primaryRanks[0];
      const topLabel = cards.find((c) => c.rank === topRank)?.label || '';
      return `[顺子 (五张连续)] 顺子 (${topLabel}高)`;
    }
    if (evalResult.type === 'THREE_OF_A_KIND') {
      const tripRank = evalResult.primaryRanks[0];
      const tripLabel = cards.find((c) => c.rank === tripRank)?.label || '';
      return `[三条 (三张同点)] 冲三 (${tripLabel}条)`;
    }
    if (evalResult.type === 'TWO_PAIRS') {
      const p1 = cards.find((c) => c.rank === evalResult.primaryRanks[0])?.label || '';
      const p2 = cards.find((c) => c.rank === evalResult.primaryRanks[1])?.label || '';
      return `[两对 (双对子)] 两对 (${p1}和${p2})`;
    }
    if (evalResult.type === 'FOUR_OF_A_KIND') {
      const quadRank = evalResult.primaryRanks[0];
      const quadLabel = cards.find((c) => c.rank === quadRank)?.label || '';
      return `[铁支 (四张同点)] 铁支 (${quadLabel})`;
    }
    if (evalResult.type === 'STRAIGHT_FLUSH') {
      return `[同花顺 (五张同花顺)] 同花顺 (${cards[0]?.suitSymbol || ''})`;
    }
    return `[${evalResult.typeName}] ${rankLabels[0] || ''}高`;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* 1. TOP HEADER BAR */}
      <header className="px-3.5 py-2.5 bg-[#0F172A] border-b border-slate-800/80 flex items-center justify-between z-30 shadow-md">
        {/* Left: Back Arrow + Flame Icon + Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToLobby}
            className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
            title="返回游戏大厅"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Flame className="w-4 h-4 fill-current" />
          </div>

          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>实时对战场</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">
              第 <strong className="text-amber-400 font-mono">{roundNumber}</strong> 局
            </span>
          </div>
        </div>

        {/* Right: Chip Count Pill + Chat Button */}
        <div className="flex items-center gap-2">
          {/* Gold Chip Pill */}
          <div className="px-3 py-1 bg-slate-950 border border-amber-500/40 rounded-full flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold shadow-xs">
            <Coins className="w-3.5 h-3.5" />
            <span>{currentUser.chips.toLocaleString()}</span>
          </div>

          {/* Purple Chat Button */}
          <button
            onClick={() => setShowChatDrawer(true)}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-md active:scale-95"
            title="局内聊天"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HORIZONTAL 8 PLAYER SEATS RIBBON */}
      <div className="px-3 py-2 bg-[#090E1A] border-b border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-2 z-20">
        {players.map((seat) => {
          const isSelected = activeSeatId === seat.id;
          const isMe = seat.id === 'player_me';

          return (
            <button
              key={seat.id}
              onClick={() => setActiveSeatId(seat.id)}
              className={`flex flex-col items-center justify-center min-w-[58px] py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="text-lg leading-tight mb-0.5">{seat.avatar}</div>
              <div
                className={`text-[11px] font-medium truncate max-w-[50px] ${
                  isSelected ? 'text-amber-300 font-bold' : isMe ? 'text-slate-200' : 'text-slate-400'
                }`}
              >
                {seat.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN TABLE BODY: THREE STACKED DUN SECTIONS (前墩 / 中墩 / 后墩) */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 flex flex-col justify-between gap-2.5 overflow-y-auto pb-28">
        {/* Floating Speech Bubbles & Emojis */}
        {speechBubbles.map((b) => (
          <div
            key={b.id}
            className="p-2 bg-indigo-900/90 text-white border border-indigo-500 rounded-xl text-xs font-bold shadow-xl animate-in fade-in flex items-center gap-2 my-1"
          >
            <span>💬</span>
            <span>{b.text}</span>
          </div>
        ))}

        {/* SECTION 1: 前墩 (Head Dun 3/3) */}
        <div className="bg-[#0F172A]/90 border border-slate-800/90 rounded-2xl p-3 shadow-lg flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="font-bold text-slate-200">前墩</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                {headCards.length}/3
              </span>
            </div>
            <div className="text-sky-400 text-xs font-bold font-mono truncate max-w-[240px]">
              {getDunLabel(headEval, headCards, true)}
            </div>
          </div>

          {/* Playing Cards Row (Overlapping Layout) */}
          <div className="flex items-center justify-start pl-1 py-1">
            <div className="flex -space-x-8 sm:-space-x-6">
              {headCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-2 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: 中墩 (Middle Dun 5/5) */}
        <div className="bg-[#0F172A]/90 border border-slate-800/90 rounded-2xl p-3 shadow-lg flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="font-bold text-slate-200">中墩</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                {midCards.length}/5
              </span>
            </div>
            <div className="text-sky-400 text-xs font-bold font-mono truncate max-w-[240px]">
              {getDunLabel(midEval, midCards, false)}
            </div>
          </div>

          {/* Playing Cards Row (Overlapping Layout) */}
          <div className="flex items-center justify-start pl-1 py-1">
            <div className="flex -space-x-9 sm:-space-x-7">
              {midCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-2 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: 后墩 (Tail Dun 5/5) */}
        <div className="bg-[#0F172A]/90 border border-slate-800/90 rounded-2xl p-3 shadow-lg flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-bold text-slate-200">后墩</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                {tailCards.length}/5
              </span>
            </div>
            <div className="text-purple-400 text-xs font-bold font-mono truncate max-w-[240px]">
              {getDunLabel(tailEval, tailCards, false)}
            </div>
          </div>

          {/* Playing Cards Row (Overlapping Layout) */}
          <div className="flex items-center justify-start pl-1 py-1">
            <div className="flex -space-x-9 sm:-space-x-7">
              {tailCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-2 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settlement Showdown Results Overlay (if finished) */}
        {phase === 'ROUND_RESULT' && settlement && (
          <div className="p-4 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white">本局比牌结算</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {settlement.scores['player_me'] > 0
                  ? `+${settlement.scores['player_me']} 水 获胜！🎉`
                  : `${settlement.scores['player_me']} 水`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {players.slice(0, 4).map((p) => {
                const s = settlement.scores[p.id] || 0;
                return (
                  <div key={p.id} className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                    <div
                      className={`font-mono font-bold text-xs mt-1 ${
                        s > 0 ? 'text-emerald-400' : s < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {s > 0 ? `+${s}` : s}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={startNewRound}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再战一局</span>
            </button>
          </div>
        )}
      </main>

      {/* 4. FIXED BOTTOM SECTION: CHAT INPUT + ACTION BUTTONS */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-3 bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800/80 flex flex-col gap-2.5 z-40">
        {/* Row 1: Chat Input Row */}
        <div className="flex items-center gap-2 relative">
          {/* Mic Button */}
          <button
            onClick={() => handleSendMessage('【语音消息 🎙️ 0:02】')}
            className="w-8 h-8 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="语音输入"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Speaker Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="音效开关"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Rounded Chat Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex items-center gap-1"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="输入聊天内容..."
              className="w-full bg-[#0F172A] border border-slate-700/80 rounded-full px-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Floating Chat Trigger Button */}
          <button
            onClick={() => setShowChatDrawer(true)}
            className="absolute -top-14 right-2 w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="快捷短语与表情"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Row 2: Dual Action Buttons (变换牌型 + 提交牌型) */}
        <div className="flex items-center gap-3">
          {/* Button 1: 变换牌型 (Cycle combinations) */}
          <button
            onClick={handleCycleSmartHand}
            disabled={phase !== 'ARRANGING'}
            className="flex-1 py-3 px-4 bg-[#0F172A] hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-400 font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>变换牌型</span>
          </button>

          {/* Button 2: 提交牌型 (13/13) */}
          <button
            onClick={handleSubmitHand}
            disabled={phase !== 'ARRANGING'}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>提交牌型 (13/13)</span>
          </button>
        </div>
      </footer>

      {/* 5. CHAT DRAWER & EMOJI QUICK PICKER MODAL */}
      {showChatDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end justify-center p-3 animate-in fade-in">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-lg w-full p-4 shadow-2xl flex flex-col gap-3 max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-400" />
                <span>快捷短语与表情挑衅</span>
              </span>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emoji Bar */}
            <div className="flex items-center justify-between gap-1 p-2 bg-slate-950 rounded-2xl">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    handleSendEmoji(em);
                    setShowChatDrawer(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Quick Phrases */}
            <div className="space-y-1.5 overflow-y-auto max-h-48 text-xs">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSendMessage(phrase);
                    setShowChatDrawer(false);
                  }}
                  className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
