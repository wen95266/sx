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
  EmojiReaction,
  ConnectionStatus
} from '../types/game';
import {
  createDeck,
  shuffleDeck,
  sortCards,
  evaluateDun,
  validateDaoPai,
  evaluateSpecialHand,
  calculateSmartArrangements,
  calculateGameSettlement,
  compareDuns
} from '../utils/cardLogic';
import { SoundEffects } from '../utils/audio';
import { CardItem } from './CardItem';
import { AuthModal } from './AuthModal';
import { BotConfigGuideModal } from './BotConfigGuideModal';
import {
  getStoredUser,
  recordGameResult,
  UserProfile
} from '../utils/authStorage';
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
  ArrowRightLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  ShieldCheck,
  Bot,
  HelpCircle,
  Eye,
  Sliders,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

const QUICK_PHRASES = [
  '手气真好，这把看我全垒打！🔥',
  '催催催，理牌中别急！⏱️',
  '谁敢跟我比尾道？🎴',
  '手气背，差点倒牌相公了...😅',
  '打得不错，承让承让！🤝',
  '吃我一记打枪！💥',
  '天胡！至尊青龙在此！🐉',
  '给大佬递茶 🍵'
];

const EMOJI_LIST = ['🀄', '💥', '👑', '🎯', '🍺', '🔥', '👏', '💸', '😭', '🍵', '💣'];

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

interface DanmuItem {
  id: string;
  sender: string;
  text: string;
  avatar?: string;
  color: string;
  topPercent: number;
}

export const GameTable: React.FC = () => {
  // Current user authentication
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);

  // Connection & Reconnection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [pingMs, setPingMs] = useState(24);
  const [isSimulatingReconnect, setIsSimulatingReconnect] = useState(false);

  // Sound & Speed toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameSpeed, setGameSpeed] = useState<'normal' | 'fast'>('normal');

  // Danmu (Barrage) system
  const [danmuEnabled, setDanmuEnabled] = useState(true);
  const [activeDanmus, setActiveDanmus] = useState<DanmuItem[]>([]);

  // Show detailed score modal
  const [showDetailedScoreModal, setShowDetailedScoreModal] = useState(false);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player_me',
      name: currentUser.nickname,
      avatar: currentUser.avatar,
      isAi: false,
      cards: [],
      arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
      isReady: false,
      totalScore: currentUser.chips,
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
      totalScore: 1000,
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
      totalScore: 1000,
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
      totalScore: 1000,
      roundScore: 0,
      roundDetails: {
        headScore: 0, middleScore: 0, tailScore: 0, bonusScore: 0,
        gunShotCount: 0, isGrandSlam: false, specialHandPoints: 0
      }
    }
  ]);

  // Sync current user info when changed in AuthModal
  useEffect(() => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === 'player_me'
          ? {
              ...p,
              name: currentUser.nickname,
              avatar: currentUser.avatar,
              totalScore: currentUser.chips
            }
          : p
      )
    );
  }, [currentUser]);

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
      text: '欢迎进入十三水多人联机牌桌！已为您加载本地高精度 SVG 扑克牌资源。',
      time: '14:30',
      isSystem: true
    }
  ]);
  const [activeReactions, setActiveReactions] = useState<EmojiReaction[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Periodic heartbeat & ping jitter
  useEffect(() => {
    const timer = setInterval(() => {
      if (connectionStatus === 'connected') {
        setPingMs(Math.floor(18 + Math.random() * 15));
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [connectionStatus]);

  // Send danmu
  const pushDanmu = useCallback((sender: string, text: string, avatar?: string) => {
    if (!danmuEnabled) return;
    const colors = ['#f59e0b', '#38bdf8', '#4ade80', '#ec4899', '#a855f7'];
    const newDanmu: DanmuItem = {
      id: `danmu_${Date.now()}_${Math.random()}`,
      sender,
      text,
      avatar,
      color: colors[Math.floor(Math.random() * colors.length)],
      topPercent: 12 + Math.random() * 65
    };
    setActiveDanmus((prev) => [...prev, newDanmu]);
    setTimeout(() => {
      setActiveDanmus((prev) => prev.filter((d) => d.id !== newDanmu.id));
    }, 6000);
  }, [danmuEnabled]);

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
    pushDanmu(senderName, text, avatar);
    if (soundEnabled && !isSystem) {
      SoundEffects.playMessagePop();
    }
  }, [soundEnabled, pushDanmu]);

  // Trigger floating emoji reaction
  const triggerReaction = (playerId: string, emoji: string) => {
    if (soundEnabled) SoundEffects.playEmojiReaction();
    const id = `react_${Date.now()}_${Math.random()}`;
    setActiveReactions((prev) => [...prev, { id, playerId, emoji }]);
    pushDanmu(players.find(p => p.id === playerId)?.name || '玩家', emoji);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  };

  // Disconnect & Reconnect Simulation & Recovery
  const handleSimulateDisconnect = () => {
    setIsSimulatingReconnect(true);
    setConnectionStatus('disconnected');
    addChatMessage('system', '网络状态', '⚠️ 检测到网络异常波动，连接暂时断开，准备自动重连...', undefined, true);

    // Save current active round snapshot into sessionStorage for session recovery
    const snapshot = {
      phase,
      unplacedCards,
      headCards,
      midCards,
      tailCards,
      countdown
    };
    try {
      sessionStorage.setItem('shisanshui_active_session', JSON.stringify(snapshot));
    } catch {
      // ignore
    }

    // Auto reconnect retry
    setReconnectAttempt(1);
    setTimeout(() => {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('connected');
        setReconnectAttempt(0);
        setIsSimulatingReconnect(false);
        addChatMessage('system', '网络状态', '🟢 断线重连成功！牌桌会话已完整恢复，继续对局。', undefined, true);
        if (soundEnabled) SoundEffects.playCardClick();
      }, 1500);
    }, 2000);
  };

  const handleManualReconnect = () => {
    setConnectionStatus('connecting');
    setReconnectAttempt(prev => prev + 1);
    setTimeout(() => {
      setConnectionStatus('connected');
      setReconnectAttempt(0);
      addChatMessage('system', '网络状态', '🟢 手动重连成功！数据同步完毕。', undefined, true);
    }, 1200);
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
        isReady: idx !== 0,
        roundScore: 0,
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
    setSettlement(null);
    setShowdownStep(0);
    setCountdown(30);
    setPhase('ARRANGING');

    addChatMessage('system', '发牌官', '第 ' + (currentUser.totalGames + 1) + ' 局发牌完毕！请在30秒内完成三道理牌。', undefined, true);

    // Random bot quote
    setTimeout(() => {
      const randomQuote = BOT_QUOTES.deal[Math.floor(Math.random() * BOT_QUOTES.deal.length)];
      addChatMessage('bot_west', '西门吹水 (AI)', randomQuote, '🤖');
    }, 1000);
  }, [soundEnabled, players, addChatMessage, currentUser.totalGames]);

  // Timer countdown in ARRANGING phase
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
  }, [phase, unplacedCards, headCards, midCards, tailCards]);

  // Validate Dao-Pai (相公/倒水)
  useEffect(() => {
    if (headCards.length === 3 && midCards.length === 5 && tailCards.length === 5) {
      const check = validateDaoPai(headCards, midCards, tailCards);
      setDaoPaiCheck(check);
    } else {
      setDaoPaiCheck({ isDaoPai: false });
    }
  }, [headCards, midCards, tailCards]);

  // Card placement handlers
  const handleCardClick = (card: Card) => {
    if (phase !== 'ARRANGING') return;
    if (soundEnabled) SoundEffects.playCardClick();

    if (unplacedCards.some((c) => c.id === card.id)) {
      if (selectedCards.includes(card.id)) {
        setSelectedCards((prev) => prev.filter((id) => id !== card.id));
      } else {
        setSelectedCards((prev) => [...prev, card.id]);
      }
      return;
    }

    if (headCards.some((c) => c.id === card.id)) {
      setHeadCards((prev) => prev.filter((c) => c.id !== card.id));
      setUnplacedCards((prev) => sortCards([...prev, card]));
      return;
    }
    if (midCards.some((c) => c.id === card.id)) {
      setMidCards((prev) => prev.filter((c) => c.id !== card.id));
      setUnplacedCards((prev) => sortCards([...prev, card]));
      return;
    }
    if (tailCards.some((c) => c.id === card.id)) {
      setTailCards((prev) => prev.filter((c) => c.id !== card.id));
      setUnplacedCards((prev) => sortCards([...prev, card]));
      return;
    }
  };

  const handlePlaceSelected = (dun: 'head' | 'mid' | 'tail') => {
    if (selectedCards.length === 0) return;
    if (soundEnabled) SoundEffects.playCardClick();

    const toPlace = unplacedCards.filter((c) => selectedCards.includes(c.id));
    const maxCapacity = dun === 'head' ? 3 : 5;
    const currentDun = dun === 'head' ? headCards : dun === 'mid' ? midCards : tailCards;
    const availableSlots = maxCapacity - currentDun.length;

    if (availableSlots <= 0) return;

    const actualPlace = toPlace.slice(0, availableSlots);
    const actualIds = new Set(actualPlace.map((c) => c.id));

    if (dun === 'head') setHeadCards((prev) => sortCards([...prev, ...actualPlace]));
    if (dun === 'mid') setMidCards((prev) => sortCards([...prev, ...actualPlace]));
    if (dun === 'tail') setTailCards((prev) => sortCards([...prev, ...actualPlace]));

    setUnplacedCards((prev) => prev.filter((c) => !actualIds.has(c.id)));
    setSelectedCards((prev) => prev.filter((id) => !actualIds.has(id)));
  };

  const applySmartOption = (opt: AutoArrangeOption) => {
    if (soundEnabled) SoundEffects.playCardClick();
    setHeadCards(opt.head);
    setMidCards(opt.middle);
    setTailCards(opt.tail);
    setUnplacedCards([]);
    setSelectedCards([]);
  };

  const handleResetArrangement = () => {
    if (soundEnabled) SoundEffects.playCardClick();
    const all = [...unplacedCards, ...headCards, ...midCards, ...tailCards];
    setUnplacedCards(sortCards(all));
    setHeadCards([]);
    setMidCards([]);
    setTailCards([]);
    setSelectedCards([]);
  };

  const handleAutoFixDaoPai = () => {
    if (smartOptions.length > 0) {
      applySmartOption(smartOptions[0]);
    }
  };

  // Submit cards & trigger step-by-step showdown
  const handleSubmitHand = () => {
    let finalHead = headCards;
    let finalMid = midCards;
    let finalTail = tailCards;

    if (unplacedCards.length > 0 && smartOptions.length > 0) {
      finalHead = smartOptions[0].head;
      finalMid = smartOptions[0].middle;
      finalTail = smartOptions[0].tail;
      setHeadCards(finalHead);
      setMidCards(finalMid);
      setTailCards(finalTail);
      setUnplacedCards([]);
    }

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
            daoPaiReason: daoPaiResult.reason,
            specialHand: specialHandInfo.isSpecial ? specialHandInfo : undefined
          }
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setPhase('SHOWDOWN_HEAD');
    setShowdownStep(1);

    if (soundEnabled) SoundEffects.playCardClick();

    // Step 1: Head Showdown (前墩 3张比牌)
    setTimeout(() => {
      setPhase('SHOWDOWN_MID');
      setShowdownStep(2);

      // Step 2: Middle Showdown (中墩 5张比牌)
      setTimeout(() => {
        setPhase('SHOWDOWN_TAIL');
        setShowdownStep(3);

        // Step 3: Tail Showdown (后墩 5张比牌)
        setTimeout(() => {
          setPhase('SHOWDOWN_GUN');
          setShowdownStep(4);

          // Step 4: Gunshot & Settlement (打枪与全垒打结算)
          const result = calculateGameSettlement(updatedPlayers);
          setSettlement(result);

          // Update scores & persistence
          const finalPlayers = updatedPlayers.map((p) => {
            const delta = result.scores[p.id] || 0;
            return {
              ...p,
              totalScore: p.totalScore + delta,
              roundScore: delta
            };
          });
          setPlayers(finalPlayers);

          const myDelta = result.scores['player_me'] || 0;
          const isWin = myDelta > 0;
          const myGunshots = result.gunShots.filter((g) => g.shooterId === 'player_me').length;
          const isGrandSlam = result.grandSlamPlayerId === 'player_me';
          const isSpecial = Boolean(specialHandInfo.isSpecial);

          // Record stats to auth storage
          const updatedUser = recordGameResult(myDelta, isWin, myGunshots, isGrandSlam, isSpecial);
          setCurrentUser(updatedUser);

          // Audio and visual celebrations
          if (soundEnabled) {
            if (isGrandSlam) {
              SoundEffects.playFanfare();
              confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            } else if (result.gunShots.length > 0) {
              SoundEffects.playGunShot();
            } else if (isWin) {
              SoundEffects.playFanfare();
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
            }
          }

          // Broadcast announcement
          if (isGrandSlam) {
            addChatMessage('system', '全服公告', '👑 惊天全垒打！恭喜 ' + currentUser.nickname + ' 通杀全场，水数翻四倍！', undefined, true);
          } else if (myGunshots > 0) {
            addChatMessage('system', '比牌播报', '💥 ' + currentUser.nickname + ' 达成打枪，三道全胜！', undefined, true);
          }

          setPhase('ROUND_RESULT');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    addChatMessage('player_me', currentUser.nickname, text, currentUser.avatar);
    setChatInput('');
  };

  const me = players.find((p) => p.id === 'player_me') || players[0];
  const botNorth = players.find((p) => p.id === 'bot_north') || players[2];
  const botWest = players.find((p) => p.id === 'bot_west') || players[1];
  const botEast = players.find((p) => p.id === 'bot_east') || players[3];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none relative overflow-hidden">
      {/* Top Floating Danmu Overlay */}
      {danmuEnabled && (
        <div className="absolute inset-x-0 top-16 bottom-24 pointer-events-none z-20 overflow-hidden">
          {activeDanmus.map((danmu) => (
            <div
              key={danmu.id}
              className="absolute whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-danmu flex items-center gap-1.5 backdrop-blur-xs border border-white/20"
              style={{
                top: `${danmu.topPercent}%`,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: danmu.color
              }}
            >
              {danmu.avatar && <span>{danmu.avatar}</span>}
              <span className="opacity-75">{danmu.sender}:</span>
              <span>{danmu.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top Table Control Bar */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800/90 px-3 md:px-6 flex items-center justify-between z-30 shadow-md">
        {/* Left: User Profile & Connection Pill */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl cursor-pointer transition-colors"
            title="点击管理玩家账号、切换头像与查看战绩"
          >
            <span className="text-lg">{currentUser.avatar}</span>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                <span>{currentUser.nickname}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {currentUser.chips.toLocaleString()}水
                </span>
              </div>
            </div>
          </button>

          {/* Network Connection Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[11px]">
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">已连接</span>
                <span className="text-[9px] opacity-75">{pingMs}ms</span>
              </span>
            ) : connectionStatus === 'connecting' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.8 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[11px] animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>正在重连...</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleManualReconnect}
                className="flex items-center gap-1 px-2 py-0.8 bg-rose-500/20 border border-rose-500/50 text-rose-300 rounded-full text-[11px] cursor-pointer hover:bg-rose-500/30"
              >
                <WifiOff className="w-3 h-3" />
                <span>断开 [立即重连]</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Phase Badge & Quick Action */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full font-mono font-medium">
            {phase === 'LOBBY' && '🎴 等待开局'}
            {phase === 'ARRANGING' && `⏱️ 理牌中 (${countdown}s)`}
            {phase.startsWith('SHOWDOWN') && '⚔️ 比牌对决中'}
            {phase === 'ROUND_RESULT' && '🏆 本局结算完成'}
          </span>
        </div>

        {/* Right: Quick Tools & Bot Guide Link */}
        <div className="flex items-center gap-1.5">
          {/* Bot ID & Token Guide Button */}
          <button
            type="button"
            onClick={() => setShowBotGuideModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            title="查看 Bot 的 ID 与 Token 配置在何处及配置方法"
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Bot 配置在哪？</span>
          </button>

          {/* Simulate Disconnect & Reconnect Button for testing */}
          <button
            type="button"
            onClick={handleSimulateDisconnect}
            disabled={isSimulatingReconnect}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer transition-colors"
            title="测试断线自动重连与恢复牌局"
          >
            <Radio className={`w-4 h-4 ${isSimulatingReconnect ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
          </button>

          {/* Danmu Toggle */}
          <button
            type="button"
            onClick={() => setDanmuEnabled(!danmuEnabled)}
            className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              danmuEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
            title="开/关 牌桌实时弹幕"
          >
            弹幕: {danmuEnabled ? '开' : '关'}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            title={soundEnabled ? '音效已开' : '音效已静音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Chat Toggle Button */}
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            className="relative p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            title="展开/收起 互动聊天抽屉"
          >
            <MessageCircle className="w-4 h-4 text-sky-400" />
            {chatMessages.length > 1 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Main Poker Table Area (Green Felt Casino Style) */}
      <div className="flex-1 relative flex flex-col justify-between p-2 md:p-4 bg-radial from-emerald-950 via-slate-950 to-slate-950">
        {/* Table Felt Glow & Edge Accent */}
        <div className="absolute inset-4 rounded-3xl border-2 border-emerald-600/30 pointer-events-none shadow-2xl shadow-emerald-950/40" />

        {/* Top Player (North - Bot North) */}
        <div className="relative flex flex-col items-center z-10">
          {activeReactions.filter((r) => r.playerId === botNorth.id).map((r) => (
            <div
              key={r.id}
              className="absolute -top-10 text-3xl animate-bounce pointer-events-none drop-shadow-md z-30"
            >
              {r.emoji}
            </div>
          ))}

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs">
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
                  <div key={i} className="w-3.5 h-8 bg-slate-800/80 border border-slate-700 rounded-sm -ml-1 first:ml-0" />
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

        {/* Center Field: Left Player, Center Table, Right Player */}
        <div className="w-full flex items-center justify-between px-2 z-10">
          {/* West Player (Bot West) */}
          <div className="relative flex flex-col items-start w-44 md:w-52">
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
                <h3 className="text-base md:text-lg font-semibold text-slate-100">十三水 4 人对战桌已就绪</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  已加载 SVG 扑克牌资源。支持智能一键理牌、福建打枪翻倍、全垒打通杀与断线自动重连。
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={startNewRound}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>立即发牌开局</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBotGuideModal(true)}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-medium rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bot配置与Token指南</span>
                  </button>
                </div>
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
              <div className="flex flex-col items-center gap-2 text-center bg-slate-950/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <Swords className="w-5 h-5 animate-bounce" />
                  <span>
                    {showdownStep === 1 && '比牌阶段 1/4: 头道对决 (前墩 3张)'}
                    {showdownStep === 2 && '比牌阶段 2/4: 中道对决 (中墩 5张)'}
                    {showdownStep === 3 && '比牌阶段 3/4: 尾道对决 (后墩 5张)'}
                    {showdownStep === 4 && '比牌阶段 4/4: 打枪与全垒打结算'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">正在依次结算各墩水数与翻倍加成...</span>
              </div>
            )}

            {phase === 'ROUND_RESULT' && settlement && (
              <div className="flex flex-col items-center gap-3 bg-slate-900/95 border border-slate-700/80 p-4 md:p-5 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base">
                    <Trophy className="w-5 h-5" />
                    <span>本局比牌结算账单</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetailedScoreModal(true)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer underline"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>查看完整计分详情</span>
                  </button>
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

                <div className="w-full flex gap-2 mt-1">
                  <button
                    onClick={startNewRound}
                    className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>再来一局</span>
                  </button>
                  <button
                    onClick={() => setShowDetailedScoreModal(true)}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    <span>详情看板</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* East Player (Bot East) */}
          <div className="relative flex flex-col items-end w-44 md:w-52">
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
        <div className="relative w-full flex flex-col items-center gap-3 z-10">
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
                  onClick={() => setActiveTargetDun('head')}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-bold text-slate-200">前墩 (头道 3张)</span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      {evaluateDun(headCards, true).typeName}
                    </span>
                  </div>
                  <div className="flex gap-1.5 my-2">
                    {headCards.map((c) => (
                      <CardItem key={c.id} card={c} onClick={() => handleCardClick(c)} size="md" />
                    ))}
                    {Array.from({ length: 3 - headCards.length }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePlaceSelected('head')}
                        className="w-14 h-20 border-2 border-dashed border-slate-700/80 rounded-lg flex items-center justify-center text-slate-600 hover:border-amber-500/50 hover:text-amber-400 text-xs font-medium cursor-pointer"
                      >
                        +
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceSelected('head');
                    }}
                    disabled={selectedCards.length === 0 || headCards.length >= 3}
                    className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer transition-colors text-slate-300 font-medium"
                  >
                    放入选中牌
                  </button>
                </div>

                {/* Middle Dun (中墩 5 cards) */}
                <div
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[125px] ${
                    activeTargetDun === 'mid' ? 'border-amber-400 bg-slate-900/90 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-900/60'
                  }`}
                  onClick={() => setActiveTargetDun('mid')}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-bold text-slate-200">中墩 (中道 5张)</span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      {evaluateDun(midCards, false).typeName}
                    </span>
                  </div>
                  <div className="flex gap-1.5 my-2">
                    {midCards.map((c) => (
                      <CardItem key={c.id} card={c} onClick={() => handleCardClick(c)} size="md" />
                    ))}
                    {Array.from({ length: 5 - midCards.length }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePlaceSelected('mid')}
                        className="w-14 h-20 border-2 border-dashed border-slate-700/80 rounded-lg flex items-center justify-center text-slate-600 hover:border-amber-500/50 hover:text-amber-400 text-xs font-medium cursor-pointer"
                      >
                        +
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceSelected('mid');
                    }}
                    disabled={selectedCards.length === 0 || midCards.length >= 5}
                    className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer transition-colors text-slate-300 font-medium"
                  >
                    放入选中牌
                  </button>
                </div>

                {/* Tail Dun (后墩 5 cards) */}
                <div
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[125px] ${
                    activeTargetDun === 'tail' ? 'border-amber-400 bg-slate-900/90 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-900/60'
                  }`}
                  onClick={() => setActiveTargetDun('tail')}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <span className="font-bold text-slate-200">后墩 (尾道 5张)</span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      {evaluateDun(tailCards, false).typeName}
                    </span>
                  </div>
                  <div className="flex gap-1.5 my-2">
                    {tailCards.map((c) => (
                      <CardItem key={c.id} card={c} onClick={() => handleCardClick(c)} size="md" />
                    ))}
                    {Array.from({ length: 5 - tailCards.length }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePlaceSelected('tail')}
                        className="w-14 h-20 border-2 border-dashed border-slate-700/80 rounded-lg flex items-center justify-center text-slate-600 hover:border-amber-500/50 hover:text-amber-400 text-xs font-medium cursor-pointer"
                      >
                        +
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceSelected('tail');
                    }}
                    disabled={selectedCards.length === 0 || tailCards.length >= 5}
                    className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer transition-colors text-slate-300 font-medium"
                  >
                    放入选中牌
                  </button>
                </div>
              </div>

              {/* Unplaced Cards Pool (手牌池) */}
              <div className="w-full max-w-3xl flex flex-col gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">待理手牌 ({unplacedCards.length}/13)</span>
                    {selectedCards.length > 0 && (
                      <span className="text-amber-400 text-[11px]">已选中 {selectedCards.length} 张</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetArrangement}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重置手牌</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitHand}
                      disabled={daoPaiCheck.isDaoPai || headCards.length !== 3 || midCards.length !== 5 || tailCards.length !== 5}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-md transition-all flex items-center gap-1"
                    >
                      <span>锁定并出牌</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto py-1 px-1 min-h-[90px] items-center">
                  {unplacedCards.length === 0 ? (
                    <div className="w-full text-center text-xs text-slate-500 italic py-4">
                      全部 13 张手牌已排入头道、中道、尾道，确认无倒牌违规后点击右上方「锁定并出牌」
                    </div>
                  ) : (
                    unplacedCards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        selected={selectedCards.includes(c.id)}
                        onClick={() => handleCardClick(c)}
                        size="md"
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Player Identity Card */}
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs shadow-md">
            <span className="text-lg">{me.avatar}</span>
            <span className="font-bold text-white">{me.name} (您)</span>
            <span className="text-amber-400 font-mono font-bold">{me.totalScore} 水</span>
            {me.roundScore !== 0 && (
              <span className={`font-mono text-[11px] ${me.roundScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({me.roundScore > 0 ? `+${me.roundScore}` : me.roundScore})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating In-Game Emoji & Chat Quick Bar (Bottom) */}
      <div className="h-11 bg-slate-900 border-t border-slate-800 px-3 md:px-6 flex items-center justify-between text-xs z-30">
        {/* Left: Emoji Reaction Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-[10px] text-slate-400 hidden sm:inline mr-1">表情互动:</span>
          {EMOJI_LIST.map((emo) => (
            <button
              key={emo}
              type="button"
              onClick={() => triggerReaction(me.id, emo)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded-lg text-base cursor-pointer transition-transform hover:scale-125"
            >
              {emo}
            </button>
          ))}
        </div>

        {/* Right: Quick Phrases Bar */}
        <div className="flex items-center gap-1.5">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addChatMessage('player_me', currentUser.nickname, e.target.value, currentUser.avatar);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-950 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="" disabled>💬 快捷挑衅与常用短语...</option>
            {QUICK_PHRASES.map((phrase, idx) => (
              <option key={idx} value={phrase}>{phrase}</option>
            ))}
          </select>
        </div>
      </div>

      {/* In-Game Chat Drawer (Toggleable) */}
      {showChat && (
        <div className="absolute right-2 bottom-12 top-14 w-80 md:w-96 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-40 backdrop-blur-md overflow-hidden animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-sky-400" />
              <span>局内实时聊天与弹幕</span>
            </span>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 text-xs">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.senderId === 'player_me'
                    ? 'self-end items-end'
                    : m.isSystem
                    ? 'self-center items-center max-w-[95%]'
                    : 'self-start items-start'
                }`}
              >
                {m.isSystem ? (
                  <div className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 rounded-full text-[10px] text-slate-400 text-center">
                    {m.text}
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1">
                      {m.senderName} • {m.time}
                    </span>
                    <div
                      className={`p-2.5 rounded-2xl leading-relaxed ${
                        m.senderId === 'player_me'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendChat} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="输入聊天内容或弹幕..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Detailed Scoring Settlement Matrix Modal (比牌计分全息看板) */}
      {showDetailedScoreModal && settlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5" />
                <span>十三水比牌计分详情核算表 (福建标准规则)</span>
              </div>
              <button
                onClick={() => setShowDetailedScoreModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* Special Hand Overview */}
              {settlement.specialWins.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span>天胡特殊牌型直接清算</span>
                  </h4>
                  {settlement.specialWins.map((sw, idx) => (
                    <div key={idx} className="text-slate-300">
                      • <span className="font-bold text-white">{sw.name}</span> 拿到 [{sw.typeName}]，其他 3 家各自赔付 {sw.points} 水，合计净赢 +{sw.points * 3} 水。
                    </div>
                  ))}
                </div>
              )}

              {/* Pairwise Matches Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">1v1 两两比牌详情明细:</h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <th className="p-2.5">对决双方</th>
                        <th className="p-2.5">头道(前墩)</th>
                        <th className="p-2.5">中道(中墩)</th>
                        <th className="p-2.5">尾道(后墩)</th>
                        <th className="p-2.5">打枪翻倍</th>
                        <th className="p-2.5 text-right">分值清算</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {settlement.pairMatches.map((m, idx) => {
                        const p1 = players.find((p) => p.id === m.p1Id);
                        const p2 = players.find((p) => p.id === m.p2Id);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-sans font-medium text-white">
                              {p1?.name} vs {p2?.name}
                            </td>
                            <td className="p-2.5">
                              {m.headWinner === 'TIE' ? '平局' : m.headWinner === m.p1Id ? `${p1?.name}胜` : `${p2?.name}胜`}
                            </td>
                            <td className="p-2.5">
                              {m.middleWinner === 'TIE' ? '平局' : m.middleWinner === m.p1Id ? `${p1?.name}胜` : `${p2?.name}胜`}
                            </td>
                            <td className="p-2.5">
                              {m.tailWinner === 'TIE' ? '平局' : m.tailWinner === m.p1Id ? `${p1?.name}胜` : `${p2?.name}胜`}
                            </td>
                            <td className="p-2.5">
                              {m.isGunShot ? (
                                <span className="text-rose-400 font-bold">💥 打枪 x2</span>
                              ) : (
                                <span className="text-slate-500">无</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-bold">
                              <span className={m.p1Points > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {m.p1Points > 0 ? `+${m.p1Points}` : m.p1Points}
                              </span>
                              {' / '}
                              <span className={m.p2Points > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {m.p2Points > 0 ? `+${m.p2Points}` : m.p2Points}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Water Formula Explanation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px] text-slate-400">
                <div className="font-bold text-slate-200">十三水官方标准计分公式:</div>
                <div>• <span className="text-amber-300">基础水数</span>: 每道胜者 +1 水，负者 -1 水，平局 0 水。</div>
                <div>• <span className="text-sky-300">前墩特殊加水</span>: 三条(冲三) +3 水。</div>
                <div>• <span className="text-purple-300">中墩特殊加水</span>: 葫芦 +2 水、铁支(炸弹) +8 水、同花顺 +10 水。</div>
                <div>• <span className="text-emerald-300">后墩特殊加水</span>: 铁支 +4 水、同花顺 +5 水。</div>
                <div>• <span className="text-rose-300">打枪 (Gunshot)</span>: 一方三道全赢另一方，两人之间水数加倍 (x2)。</div>
                <div>• <span className="text-amber-400">全垒打 (Grand Slam)</span>: 一人打枪同桌全部 3 名对手，总水数再翻倍 (x4)。</div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
              <button
                onClick={() => setShowDetailedScoreModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                关闭看板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Auth & Profile Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUserChange={(updated) => setCurrentUser(updated)}
      />

      {/* Bot Configuration Guide Modal */}
      <BotConfigGuideModal
        isOpen={showBotGuideModal}
        onClose={() => setShowBotGuideModal(false)}
      />
    </div>
  );
};
