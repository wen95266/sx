import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Card,
  GamePhase,
  Player,
  AutoArrangeOption,
  DunEvaluation,
  SettlementSummary,
  ChatMessage,
  EmojiReaction
} from '../types/game';
import {
  createDeck,
  shuffleDeck,
  sortCards,
  evaluateDun,
  validateDaoPai,
  evaluateSpecialHand,
  calculateSmartArrangements,
  calculateGameSettlement
} from '../utils/cardLogic';
import { SoundEffects } from '../utils/audio';
import { CardItem } from './CardItem';
import {
  Sparkles,
  Zap,
  RotateCcw,
  AlertTriangle,
  Trophy,
  Volume2,
  VolumeX,
  Clock,
  Swords,
  Layers,
  Crown,
  MessageCircle,
  Send,
  X,
  Flame,
  Gauge,
  Smile,
  Wand2,
  ArrowRightLeft
} from 'lucide-react';

const QUICK_PHRASES = [
  '手气真好，这把看我全垒打！🔥',
  '催催催，理牌中别急！⏱️',
  '谁敢跟我比尾道？🎴',
  '手气背，差点倒牌相公了...😅',
  '打得不错，承让承让！🤝',
  '吃我一记打枪！💥'
];

const EMOJI_LIST = ['🀄', '💥', '👑', '🎯', '🍺', '🔥', '👏', '💸', '😭'];

const BOT_QUOTES = {
  deal: [
    '这把牌有说道，谁也别想轻易过我！',
    '我的手牌还不错，你们小心点。',
    '又是散牌，看来得靠头道搏一把了。'
  ],
  ready: [
    '已经摆好了，速战速决！',
    '就等你们了，快点呀！',
    '精心调整的阵容，稳赢不输。'
  ],
  gunshot: [
    '💥 哈哈！三道全吃，打枪！',
    '哎呀！竟然被你打枪了，水数翻倍太伤了！',
    '枪响了，这把是大顺风！'
  ],
  grandSlam: [
    '🏆 全垒打通杀全场！简直神仙手气！',
    '独霸全场，全场水数统统翻四倍！'
  ]
};

export const GameTable: React.FC = () => {
  // Sound & Speed toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameSpeed, setGameSpeed] = useState<'normal' | 'fast'>('normal');

  // Game state
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player_me',
      name: '我 (Termux玩家)',
      avatar: '🧑‍💻',
      isAi: false,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      isReady: false,
      totalScore: 100,
      roundScore: 0,
      roundDetails: {
        headScore: 0, middleScore: 0, tailScore: 0, bonusScore: 0,
        gunShotCount: 0, isGrandSlam: false, specialHandPoints: 0
      }
    },
    {
      id: 'bot_west',
      name: '西门吹水 (AI)',
      avatar: '🤖',
      isAi: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      isReady: true,
      totalScore: 100,
      roundScore: 0,
      roundDetails: {
        headScore: 0, middleScore: 0, tailScore: 0, bonusScore: 0,
        gunShotCount: 0, isGrandSlam: false, specialHandPoints: 0
      }
    },
    {
      id: 'bot_north',
      name: '北冥神手 (AI)',
      avatar: '🥷',
      isAi: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      isReady: true,
      totalScore: 100,
      roundScore: 0,
      roundDetails: {
        headScore: 0, middleScore: 0, tailScore: 0, bonusScore: 0,
        gunShotCount: 0, isGrandSlam: false, specialHandPoints: 0
      }
    },
    {
      id: 'bot_east',
      name: '东方雀圣 (AI)',
      avatar: '🧙',
      isAi: true,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      isReady: true,
      totalScore: 100,
      roundScore: 0,
      roundDetails: {
        headScore: 0, middleScore: 0, tailScore: 0, bonusScore: 0,
        gunShotCount: 0, isGrandSlam: false, specialHandPoints: 0
      }
    }
  ]);

  // Player manual arrangement
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [headCards, setHeadCards] = useState<Card[]>([]);
  const [midCards, setMidCards] = useState<Card[]>([]);
  const [tailCards, setTailCards] = useState<Card[]>([]);
  const [unplacedCards, setUnplacedCards] = useState<Card[]>([]);
  const [activeTargetDun, setActiveTargetDun] = useState<'head' | 'mid' | 'tail'>('tail');

  // Solver options & active strategy
  const [smartOptions, setSmartOptions] = useState<AutoArrangeOption[]>([]);
  const [specialHandInfo, setSpecialHandInfo] = useState<ReturnType<typeof evaluateSpecialHand>>({ isSpecial: false, points: 0 });

  // Dao-pai warning
  const [daoPaiCheck, setDaoPaiCheck] = useState<{ isDaoPai: boolean; reason?: string }>({ isDaoPai: false });

  // Countdown timer
  const [countdown, setCountdown] = useState(30);

  // Settlement summary
  const [settlement, setSettlement] = useState<SettlementSummary | null>(null);

  // Showdown step tracker
  const [showdownStep, setShowdownStep] = useState<number>(0);

  // Chat & Emoji Reactions
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init_sys',
      senderId: 'system',
      senderName: '系统',
      text: '欢迎进入十三水多人局！发牌后可点击快捷短语或表情与同桌切磋。',
      time: '14:30',
      isSystem: true
    }
  ]);
  const [activeReactions, setActiveReactions] = useState<EmojiReaction[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addChatMessage = useCallback((senderId: string, senderName: string, text: string, avatar?: string, isSystem = false) => {
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `chat_${Date.now()}_${Math.random()}`,
        senderId,
        senderName,
        avatar,
        text,
        time: timeStr,
        isSystem
      }
    ]);
    if (soundEnabled && !isSystem) {
      SoundEffects.playMessagePop();
    }
  }, [soundEnabled]);

  // Trigger floating emoji reaction
  const triggerReaction = (playerId: string, emoji: string) => {
    if (soundEnabled) SoundEffects.playEmojiReaction();
    const id = `react_${Date.now()}_${Math.random()}`;
    setActiveReactions((prev) => [...prev, { id, playerId, emoji }]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  };

  // Reset & Start new round
  const startNewRound = useCallback(() => {
    if (soundEnabled) SoundEffects.playDealCard();

    const deck = shuffleDeck(createDeck());
    const hands: Card[][] = [
      sortCards(deck.slice(0, 13)),
      sortCards(deck.slice(13, 26)),
      sortCards(deck.slice(26, 39)),
      sortCards(deck.slice(39, 52))
    ];

    const myHand = hands[0];
    const smart = calculateSmartArrangements(myHand);
    setSmartOptions(smart);

    const special = evaluateSpecialHand(myHand);
    setSpecialHandInfo(special);

    // AI players arrangements
    const updatedPlayers = players.map((p, idx) => {
      const hand = hands[idx];
      const pSpecial = evaluateSpecialHand(hand);
      const pOptions = calculateSmartArrangements(hand);
      const chosen = pOptions.length > 0 ? pOptions[0] : null;

      return {
        ...p,
        cards: hand,
        isReady: true,
        arrangement: {
          head: chosen ? chosen.head : hand.slice(0, 3),
          middle: chosen ? chosen.middle : hand.slice(3, 8),
          tail: chosen ? chosen.tail : hand.slice(8, 13),
          isDaoPai: false,
          specialHand: pSpecial.isSpecial ? pSpecial : undefined
        }
      };
    });

    setPlayers(updatedPlayers);
    setUnplacedCards(myHand);
    setHeadCards([]);
    setMidCards([]);
    setTailCards([]);
    setSelectedCards([]);
    setActiveTargetDun('tail');
    setDaoPaiCheck({ isDaoPai: false });
    setCountdown(30);
    setSettlement(null);
    setShowdownStep(0);
    setPhase('ARRANGING');

    addChatMessage('system', '系统', '第 1 局发牌完毕，理牌倒计时 30 秒开始！', undefined, true);

    // Default to the first smart recommendation for user convenience
    if (smart.length > 0) {
      const best = smart[0];
      setHeadCards(best.head);
      setMidCards(best.middle);
      setTailCards(best.tail);
      setUnplacedCards([]);
    }

    // Bot random deal banter
    setTimeout(() => {
      const randomBot = updatedPlayers[1 + Math.floor(Math.random() * 3)];
      const quote = BOT_QUOTES.deal[Math.floor(Math.random() * BOT_QUOTES.deal.length)];
      addChatMessage(randomBot.id, randomBot.name, quote, randomBot.avatar);
      triggerReaction(randomBot.id, '🀄');
    }, 1200);
  }, [players, soundEnabled, addChatMessage]);

  // Real-time Dao-Pai check
  useEffect(() => {
    if (headCards.length === 3 && midCards.length === 5 && tailCards.length === 5) {
      const result = validateDaoPai(headCards, midCards, tailCards);
      setDaoPaiCheck(result);
      if (result.isDaoPai && soundEnabled) {
        SoundEffects.playWarning();
      }
    } else {
      setDaoPaiCheck({ isDaoPai: false });
    }
  }, [headCards, midCards, tailCards, soundEnabled]);

  // Auto-Fix Dao-Pai foul
  const handleAutoFixDaoPai = () => {
    if (smartOptions.length > 0) {
      if (soundEnabled) SoundEffects.playCardClick();
      const best = smartOptions[0];
      setHeadCards(best.head);
      setMidCards(best.middle);
      setTailCards(best.tail);
      setUnplacedCards([]);
      setSelectedCards([]);
      addChatMessage('system', '系统', '✓ 已自动为您修正为合规摆牌方案！', undefined, true);
    }
  };

  // Countdown timer in ARRANGING phase
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
  }, [phase]);

  // Apply Smart Option
  const applySmartOption = (opt: AutoArrangeOption) => {
    if (soundEnabled) SoundEffects.playCardClick();
    setHeadCards(opt.head);
    setMidCards(opt.middle);
    setTailCards(opt.tail);
    setUnplacedCards([]);
    setSelectedCards([]);
  };

  // Click card in pool to toggle selection
  const handleToggleSelectCard = (cardId: string) => {
    if (soundEnabled) SoundEffects.playCardClick();
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Place selected cards into active Dun
  const handlePlaceToDun = (target: 'head' | 'mid' | 'tail') => {
    if (selectedCards.length === 0) return;
    if (soundEnabled) SoundEffects.playCardClick();

    const targetMax = target === 'head' ? 3 : 5;
    const currentTargetCards = target === 'head' ? headCards : target === 'mid' ? midCards : tailCards;

    const availableSlots = targetMax - currentTargetCards.length;
    if (availableSlots <= 0) return;

    const cardsToMove = unplacedCards.filter((c) => selectedCards.includes(c.id)).slice(0, availableSlots);
    const remainingUnplaced = unplacedCards.filter((c) => !cardsToMove.some((m) => m.id === c.id));

    if (target === 'head') setHeadCards(sortCards([...headCards, ...cardsToMove]));
    if (target === 'mid') setMidCards(sortCards([...midCards, ...cardsToMove]));
    if (target === 'tail') setTailCards(sortCards([...tailCards, ...cardsToMove]));

    setUnplacedCards(remainingUnplaced);
    setSelectedCards([]);
  };

  // Remove card from a Dun back to unplaced pool
  const handleRemoveFromDun = (card: Card, source: 'head' | 'mid' | 'tail') => {
    if (soundEnabled) SoundEffects.playCardClick();
    if (source === 'head') setHeadCards(headCards.filter((c) => c.id !== card.id));
    if (source === 'mid') setMidCards(midCards.filter((c) => c.id !== card.id));
    if (source === 'tail') setTailCards(tailCards.filter((c) => c.id !== card.id));

    setUnplacedCards(sortCards([...unplacedCards, card]));
  };

  // Clear all Duns back to pool
  const handleResetArrangement = () => {
    if (soundEnabled) SoundEffects.playCardClick();
    const all = sortCards([...headCards, ...midCards, ...tailCards, ...unplacedCards]);
    setUnplacedCards(all);
    setHeadCards([]);
    setMidCards([]);
    setTailCards([]);
    setSelectedCards([]);
  };

  // Submit hand & start Showdown
  const handleSubmitHand = () => {
    if (soundEnabled) SoundEffects.playShowdownDing(true);

    const isComplete = headCards.length === 3 && midCards.length === 5 && tailCards.length === 5;
    const isFoul = daoPaiCheck.isDaoPai;

    const updatedPlayers = players.map((p) => {
      if (p.id === 'player_me') {
        return {
          ...p,
          arrangement: {
            head: headCards,
            middle: midCards,
            tail: tailCards,
            isDaoPai: !isComplete || isFoul,
            daoPaiReason: isFoul ? daoPaiCheck.reason : !isComplete ? '手牌未摆满' : undefined,
            specialHand: specialHandInfo.isSpecial ? specialHandInfo : undefined
          }
        };
      }
      return p;
    });

    const result = calculateGameSettlement(updatedPlayers);
    setSettlement(result);

    // Apply scores
    const finalPlayers = updatedPlayers.map((p) => ({
      ...p,
      roundScore: result.scores[p.id] || 0,
      totalScore: p.totalScore + (result.scores[p.id] || 0)
    }));

    setPlayers(finalPlayers);
    setPhase('SHOWDOWN_HEAD');
    setShowdownStep(1);

    addChatMessage('system', '系统', '所有人已完成理牌，比牌正式开始！', undefined, true);
  };

  // Step through Showdown with gameSpeed adaptation
  useEffect(() => {
    const stepDelay = gameSpeed === 'fast' ? 900 : 1600;

    if (phase === 'SHOWDOWN_HEAD') {
      const t1 = setTimeout(() => {
        if (soundEnabled) SoundEffects.playShowdownDing(false);
        setPhase('SHOWDOWN_MID');
        setShowdownStep(2);
      }, stepDelay);
      return () => clearTimeout(t1);
    }
    if (phase === 'SHOWDOWN_MID') {
      const t2 = setTimeout(() => {
        if (soundEnabled) SoundEffects.playShowdownDing(false);
        setPhase('SHOWDOWN_TAIL');
        setShowdownStep(3);
      }, stepDelay);
      return () => clearTimeout(t2);
    }
    if (phase === 'SHOWDOWN_TAIL') {
      const t3 = setTimeout(() => {
        if (settlement && settlement.gunShots.length > 0) {
          if (soundEnabled) SoundEffects.playGunShot();
          setPhase('SHOWDOWN_GUN');
          setShowdownStep(4);
          // Bot gunshot reaction
          const shooter = settlement.gunShots[0].shooterName;
          addChatMessage('system', '系统', `💥 ${shooter} 达成打枪！`, undefined, true);
        } else {
          setPhase('ROUND_RESULT');
          setShowdownStep(5);
        }
      }, stepDelay);
      return () => clearTimeout(t3);
    }
    if (phase === 'SHOWDOWN_GUN') {
      const t4 = setTimeout(() => {
        if (settlement?.grandSlamPlayerId) {
          if (soundEnabled) SoundEffects.playFanfare();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          addChatMessage('system', '系统', `🏆 全垒打！${settlement.grandSlamPlayerName} 独霸全场！`, undefined, true);
        }
        setPhase('ROUND_RESULT');
        setShowdownStep(5);
      }, stepDelay + 200);
      return () => clearTimeout(t4);
    }
  }, [phase, settlement, soundEnabled, gameSpeed, addChatMessage]);

  // Handle user send chat
  const handleSendUserChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage('player_me', '我 (Termux玩家)', chatInput.trim(), '🧑‍💻');
    setChatInput('');

    // Trigger AI bots to reply with 40% probability
    if (Math.random() < 0.6) {
      setTimeout(() => {
        const randomBot = players[1 + Math.floor(Math.random() * 3)];
        const replyQuotes = ['看牌看牌，手上见真章！', '哈哈，别急，好戏在后头。', '谁赢谁输还不一定呢！', '稳住，我们能赢！'];
        const reply = replyQuotes[Math.floor(Math.random() * replyQuotes.length)];
        addChatMessage(randomBot.id, randomBot.name, reply, randomBot.avatar);
      }, 1000);
    }
  };

  // Evaluations for my current Duns
  const myHeadEval: DunEvaluation = evaluateDun(headCards, true);
  const myMidEval: DunEvaluation = evaluateDun(midCards, false);
  const myTailEval: DunEvaluation = evaluateDun(tailCards, false);

  const me = players[0];
  const botWest = players[1];
  const botNorth = players[2];
  const botEast = players[3];

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-between p-3 md:p-6 bg-slate-950 overflow-hidden">
      {/* Background Felt Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/60 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar HUD */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10 py-1">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-200 font-medium">四人标准十三水局</span>
          </div>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">打枪翻倍 x2</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">全垒打通杀 x4</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Game Speed Toggle */}
          <button
            onClick={() => setGameSpeed(gameSpeed === 'normal' ? 'fast' : 'normal')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="切换比牌动画速度"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{gameSpeed === 'normal' ? '标准速度' : '极速比牌'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? '静音' : '开启音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              showChat
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>互动聊天</span>
            {chatMessages.length > 1 && !showChat && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="relative w-full max-w-5xl flex-1 flex flex-col justify-between items-center my-1 py-1 z-10">
        {/* Top Player (Bot North) */}
        <div className="relative flex flex-col items-center">
          {/* Floating Emoji Bubble */}
          {activeReactions.filter((r) => r.playerId === botNorth.id).map((r) => (
            <div
              key={r.id}
              className="absolute -top-10 text-3xl animate-bounce pointer-events-none drop-shadow-md z-30"
            >
              {r.emoji}
            </div>
          ))}

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
            <span>{botNorth.avatar}</span>
            <span className="font-semibold text-slate-200">{botNorth.name}</span>
            <span className="text-amber-400 font-mono font-bold">{botNorth.totalScore} 水</span>
          </div>

          {/* North Cards Display */}
          <div className="mt-1">
            {phase === 'LOBBY' ? (
              <div className="text-xs text-slate-500 italic">等待开局...</div>
            ) : phase === 'ARRANGING' ? (
              <div className="flex gap-1">
                {Array.from({ length: 13 }).map((_, i) => (
                  <div key={i} className="w-3 h-7 bg-slate-800/80 border border-slate-700 rounded-sm -ml-1 first:ml-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 items-center bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">头道 ({evaluateDun(botNorth.arrangement.head, true).typeName})</span>
                  <div className="flex gap-1 mt-0.5">
                    {botNorth.arrangement.head.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">中道 ({evaluateDun(botNorth.arrangement.middle, false).typeName})</span>
                  <div className="flex gap-1 mt-0.5">
                    {botNorth.arrangement.middle.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">尾道 ({evaluateDun(botNorth.arrangement.tail, false).typeName})</span>
                  <div className="flex gap-1 mt-0.5">
                    {botNorth.arrangement.tail.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Field: Left Player, Table Center, Right Player */}
        <div className="w-full flex items-center justify-between px-2">
          {/* West Player (Bot West) */}
          <div className="relative flex flex-col items-start w-48 md:w-52">
            {activeReactions.filter((r) => r.playerId === botWest.id).map((r) => (
              <div
                key={r.id}
                className="absolute -top-8 left-4 text-3xl animate-bounce pointer-events-none drop-shadow-md z-30"
              >
                {r.emoji}
              </div>
            ))}

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span>{botWest.avatar}</span>
              <span className="font-semibold text-slate-200">{botWest.name}</span>
              <span className="text-amber-400 font-mono font-bold">{botWest.totalScore} 水</span>
            </div>
            {phase !== 'LOBBY' && phase !== 'ARRANGING' && (
              <div className="mt-2 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">头: {evaluateDun(botWest.arrangement.head, true).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botWest.arrangement.head.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">中: {evaluateDun(botWest.arrangement.middle, false).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botWest.arrangement.middle.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">尾: {evaluateDun(botWest.arrangement.tail, false).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botWest.arrangement.tail.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Table Felt & Action Prompt */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] px-2 md:px-4">
            {phase === 'LOBBY' && (
              <div className="text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">十三水 4 人对战桌已就绪</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  支持 AI 极速智能理牌、福建经典打枪翻倍、全垒打通杀与互动语音短语聊天。
                </p>
                <button
                  onClick={startNewRound}
                  className="mt-1 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>立即发牌开局</span>
                </button>
              </div>
            )}

            {phase === 'ARRANGING' && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>理牌倒计时: {countdown}s</span>
                </div>
                <span className="text-xs text-slate-400">
                  请按规则摆好 <span className="text-slate-200 font-semibold">头道 (3张)</span>、
                  <span className="text-slate-200 font-semibold">中道 (5张)</span>、
                  <span className="text-slate-200 font-semibold">尾道 (5张)</span>
                </span>
              </div>
            )}

            {phase.startsWith('SHOWDOWN') && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <Swords className="w-5 h-5 animate-bounce" />
                  <span>
                    {showdownStep === 1 && '比牌阶段 1/4: 头道对决 (前墩)'}
                    {showdownStep === 2 && '比牌阶段 2/4: 中道对决 (中墩)'}
                    {showdownStep === 3 && '比牌阶段 3/4: 尾道对决 (后墩)'}
                    {showdownStep === 4 && '比牌阶段 4/4: 打枪与全垒打结算'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">正在依次结算各墩水数与翻倍加成...</span>
              </div>
            )}

            {phase === 'ROUND_RESULT' && settlement && (
              <div className="flex flex-col items-center gap-3 bg-slate-900/95 border border-slate-700/80 p-4 md:p-5 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base">
                  <Trophy className="w-5 h-5" />
                  <span>本局结算总账单</span>
                </div>

                {/* Special Hand Victory Prompt */}
                {settlement.specialWins.length > 0 && (
                  <div className="w-full p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>
                      {settlement.specialWins.map((sw) => `${sw.name} [${sw.typeName} +${sw.points}水]`).join('、')}
                    </span>
                  </div>
                )}

                {/* Gunshot and Grand Slam Prompts */}
                {settlement.gunShots.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {settlement.gunShots.map((gs, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded text-[11px]"
                      >
                        💥 {gs.shooterName} 打枪 {gs.targetName} (水数翻倍)
                      </span>
                    ))}
                  </div>
                )}

                {settlement.grandSlamPlayerName && (
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold animate-pulse">
                    🏆 全垒打通杀！{settlement.grandSlamPlayerName} 独霸全场！
                  </div>
                )}

                {/* Score Matrix Breakdown */}
                <div className="w-full grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  {players.map((p) => {
                    const score = settlement.scores[p.id] || 0;
                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded-lg border ${
                          p.id === 'player_me'
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : 'bg-slate-800/60 border-slate-700/60'
                        }`}
                      >
                        <div className="font-semibold truncate text-slate-200">{p.name}</div>
                        <div
                          className={`font-mono font-bold text-sm mt-1 ${
                            score > 0 ? 'text-emerald-400' : score < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {score > 0 ? `+${score}` : score} 水
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={startNewRound}
                  className="w-full py-2.5 mt-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>再来一局</span>
                </button>
              </div>
            )}
          </div>

          {/* East Player (Bot East) */}
          <div className="relative flex flex-col items-end w-48 md:w-52">
            {activeReactions.filter((r) => r.playerId === botEast.id).map((r) => (
              <div
                key={r.id}
                className="absolute -top-8 right-4 text-3xl animate-bounce pointer-events-none drop-shadow-md z-30"
              >
                {r.emoji}
              </div>
            ))}

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span>{botEast.avatar}</span>
              <span className="font-semibold text-slate-200">{botEast.name}</span>
              <span className="text-amber-400 font-mono font-bold">{botEast.totalScore} 水</span>
            </div>
            {phase !== 'LOBBY' && phase !== 'ARRANGING' && (
              <div className="mt-2 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">头: {evaluateDun(botEast.arrangement.head, true).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botEast.arrangement.head.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">中: {evaluateDun(botEast.arrangement.middle, false).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botEast.arrangement.middle.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">尾: {evaluateDun(botEast.arrangement.tail, false).typeName}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {botEast.arrangement.tail.map((c) => (
                      <CardItem key={c.id} card={c} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Area: Arranging Duns & Hand Cards */}
        <div className="relative w-full flex flex-col items-center gap-3">
          {/* Floating Emoji Bubble for Player */}
          {activeReactions.filter((r) => r.playerId === me.id).map((r) => (
            <div
              key={r.id}
              className="absolute -top-12 text-4xl animate-bounce pointer-events-none drop-shadow-md z-30"
            >
              {r.emoji}
            </div>
          ))}

          {phase === 'ARRANGING' && (
            <>
              {/* Special Hand Alert Banner */}
              {specialHandInfo.isSpecial && (
                <div className="w-full max-w-3xl flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-amber-300">天胡特殊牌型: {specialHandInfo.name}</span>
                      <span className="text-[11px] text-amber-200/80 ml-2">({specialHandInfo.description})</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitHand}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-colors shadow"
                  >
                    直接出牌 (+{specialHandInfo.points}水)
                  </button>
                </div>
              )}

              {/* Dao-Pai Warning Banner with Auto-Fix */}
              {daoPaiCheck.isDaoPai && (
                <div className="w-full max-w-3xl flex items-center justify-between p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span className="font-semibold">{daoPaiCheck.reason}</span>
                  </div>
                  <button
                    onClick={handleAutoFixDaoPai}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>一键自动纠错</span>
                  </button>
                </div>
              )}

              {/* Smart Recommendation Buttons */}
              {smartOptions.length > 0 && (
                <div className="w-full max-w-3xl flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      AI 智能最优理牌方案推荐
                    </span>
                    <span>点击直接套用组合</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {smartOptions.slice(0, 3).map((opt, idx) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => applySmartOption(opt)}
                        className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-800/90 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-amber-400">方案 {idx + 1}</span>
                          <span className="text-[10px] text-slate-400 font-mono">战力: {opt.expectedScore}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 leading-relaxed group-hover:text-amber-200">
                          <div>头: <span className="font-medium text-slate-200">{opt.headEval.typeName}</span></div>
                          <div>中: <span className="font-medium text-slate-200">{opt.midEval.typeName}</span></div>
                          <div>尾: <span className="font-medium text-slate-200">{opt.tailEval.typeName}</span></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 Duns Placement Slots */}
              <div className="w-full max-w-3xl grid grid-cols-3 gap-3">
                {/* Head Dun (前墩 3 cards) */}
                <div
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[125px] ${
                    activeTargetDun === 'head' ? 'border-amber-400 bg-slate-900/90 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">头道 (3张)</span>
                    <span className="text-amber-400 font-medium text-[11px]">
                      {headCards.length === 3 ? myHeadEval.typeName : `${headCards.length}/3`}
                    </span>
                  </div>
                  <div className="flex gap-1.5 my-1.5 min-h-[80px] items-center justify-center flex-wrap">
                    {headCards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        size="sm"
                        onClick={() => handleRemoveFromDun(c, 'head')}
                      />
                    ))}
                    {headCards.length < 3 && (
                      <button
                        onClick={() => handlePlaceToDun('head')}
                        className="w-10 h-14 border border-dashed border-slate-700 hover:border-amber-400 rounded-md flex items-center justify-center text-slate-500 hover:text-amber-400 text-xs cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTargetDun('head')}
                    className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                      activeTargetDun === 'head' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    设为放入目标
                  </button>
                </div>

                {/* Middle Dun (中墩 5 cards) */}
                <div
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[125px] ${
                    activeTargetDun === 'mid' ? 'border-amber-400 bg-slate-900/90 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">中道 (5张)</span>
                    <span className="text-amber-400 font-medium text-[11px]">
                      {midCards.length === 5 ? myMidEval.typeName : `${midCards.length}/5`}
                    </span>
                  </div>
                  <div className="flex gap-1 my-1.5 min-h-[80px] items-center justify-center flex-wrap">
                    {midCards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        size="sm"
                        onClick={() => handleRemoveFromDun(c, 'mid')}
                      />
                    ))}
                    {midCards.length < 5 && (
                      <button
                        onClick={() => handlePlaceToDun('mid')}
                        className="w-10 h-14 border border-dashed border-slate-700 hover:border-amber-400 rounded-md flex items-center justify-center text-slate-500 hover:text-amber-400 text-xs cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTargetDun('mid')}
                    className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                      activeTargetDun === 'mid' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    设为放入目标
                  </button>
                </div>

                {/* Tail Dun (尾道 5 cards) */}
                <div
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[125px] ${
                    activeTargetDun === 'tail' ? 'border-amber-400 bg-slate-900/90 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">尾道 (5张)</span>
                    <span className="text-amber-400 font-medium text-[11px]">
                      {tailCards.length === 5 ? myTailEval.typeName : `${tailCards.length}/5`}
                    </span>
                  </div>
                  <div className="flex gap-1 my-1.5 min-h-[80px] items-center justify-center flex-wrap">
                    {tailCards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        size="sm"
                        onClick={() => handleRemoveFromDun(c, 'tail')}
                      />
                    ))}
                    {tailCards.length < 5 && (
                      <button
                        onClick={() => handlePlaceToDun('tail')}
                        className="w-10 h-14 border border-dashed border-slate-700 hover:border-amber-400 rounded-md flex items-center justify-center text-slate-500 hover:text-amber-400 text-xs cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTargetDun('tail')}
                    className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                      activeTargetDun === 'tail' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    设为放入目标
                  </button>
                </div>
              </div>

              {/* Unplaced Cards Pool */}
              {unplacedCards.length > 0 && (
                <div className="w-full max-w-3xl flex flex-col items-center p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>手牌待分配区 ({unplacedCards.length}张)</span>
                    <div className="flex items-center gap-2">
                      {selectedCards.length > 0 && (
                        <button
                          onClick={() => handlePlaceToDun(activeTargetDun)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs cursor-pointer transition-colors"
                        >
                          放入{activeTargetDun === 'head' ? '头道' : activeTargetDun === 'mid' ? '中道' : '尾道'} ({selectedCards.length})
                        </button>
                      )}
                      <button
                        onClick={handleResetArrangement}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        重置所有牌
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {unplacedCards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        selected={selectedCards.includes(c.id)}
                        onClick={() => handleToggleSelectCard(c.id)}
                        size="md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={handleResetArrangement}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                >
                  清空重排
                </button>
                <button
                  onClick={handleSubmitHand}
                  disabled={daoPaiCheck.isDaoPai || unplacedCards.length > 0}
                  className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                    daoPaiCheck.isDaoPai || unplacedCards.length > 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>确认出牌 (锁定摆牌)</span>
                </button>
              </div>
            </>
          )}

          {/* User Score HUD & Emoji Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs w-full max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-base">{me.avatar}</span>
              <span className="font-semibold text-slate-200">{me.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">总分:</span>
              <span className="text-amber-400 font-mono font-bold">{me.totalScore} 水</span>
            </div>

            {/* Quick interactive emoji bar */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(me.id, emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm cursor-pointer"
                  title="发送互动表情"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Sliding In-Game Chat Drawer */}
      {showChat && (
        <div className="fixed bottom-14 right-4 md:right-8 w-80 md:w-96 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col h-[420px] backdrop-blur-md">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">牌桌实时互动聊天</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Phrases Horizontal Scroll */}
          <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addChatMessage('player_me', '我 (Termux玩家)', phrase, '🧑‍💻');
                }}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] whitespace-nowrap cursor-pointer transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat Message History */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.isSystem
                    ? 'items-center my-1'
                    : msg.senderId === 'player_me'
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                {msg.isSystem ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/60 text-slate-400 text-[10px] text-center">
                    {msg.text}
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1">
                      {msg.avatar} {msg.senderName} · {msg.time}
                    </span>
                    <div
                      className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.senderId === 'player_me'
                          ? 'bg-amber-400 text-slate-950 font-medium rounded-br-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendUserChat}
            className="flex items-center gap-2 p-2.5 border-t border-slate-800 bg-slate-900 rounded-b-2xl"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="发送弹幕或对战发言..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
