import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Card,
  GamePhase,
  Player,
  AutoArrangeOption,
  DunEvaluation,
  SettlementSummary,
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
  UserProfile,
  saveMatchSession,
  getMatchSession,
  clearMatchSession,
  ActiveMatchSession
} from '../utils/authStorage';
import {
  ArrowLeft,
  Flame,
  Coins,
  MessageCircle,
  Mic,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  CheckCircle2,
  X,
  RotateCcw,
  Trophy,
  Smile,
  Wifi,
  WifiOff,
  RefreshCw,
  Radio,
  Play,
  Square
} from 'lucide-react';

interface GameTableProps {
  currentRoom?: LobbyRoom;
  onBackToLobby: () => void;
}

const EMOJI_OPTIONS = ['🔥', '👍', '😎', '🤣', '😭', '🤯', '👑', '💸'];

const QUICK_PHRASES = [
  '⚡ 快点出牌啊，我等得花儿都谢了！',
  '🤔 思考这么久，难道拿了十三水？',
  '😎 这把牌太神，我都不好意思赢你们！',
  '💥 准备好水数，这把我要通杀全场！',
  '😭 手下留情，别打我枪啊大佬！',
  '✨ 给个机会，下把一定逆天翻盘！'
];

const PRESET_VOICE_LINES = [
  { label: '🔥 准备好水数，通杀全场！', text: '准备好水数，这把我要通杀全场！', sec: 2 },
  { label: '⏱️ 快点出牌，花儿都谢了！', text: '快点出牌啊，我等得花儿都谢了！', sec: 2 },
  { label: '😭 大佬手下留情别打枪！', text: '手下留情，别打我枪啊大佬！', sec: 2 },
  { label: '✨ 给个机会，下把逆天翻盘！', text: '给个机会，下把一定逆天翻盘！', sec: 2 }
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

  // Network & Reconnect Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnectTip, setReconnectTip] = useState<string | null>(null);

  // 8 Player Seats
  const [activeSeatId, setActiveSeatId] = useState('player_me');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player_me',
      name: currentUser.nickname || '我',
      avatar: currentUser.avatar || '😎',
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

  // Real Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [playingBubbleId, setPlayingBubbleId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        name: idx === 0 ? currentUser.nickname || '我' : p.name,
        avatar: idx === 0 ? currentUser.avatar || '😎' : p.avatar,
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
  }, [soundEnabled, players, currentUser]);

  // Initial Mount: Detect Disconnection & Auto Recover Session
  useEffect(() => {
    const saved = getMatchSession();
    if (saved && saved.headCards && saved.headCards.length > 0) {
      setHeadCards(saved.headCards);
      setMidCards(saved.midCards);
      setTailCards(saved.tailCards);
      setSmartOptions(saved.smartOptions || []);
      setCurrentOptionIndex(saved.currentOptionIndex || 0);
      setPlayers(saved.players || players);
      setPhase(saved.phase || 'ARRANGING');
      setCountdown(saved.countdown > 0 ? saved.countdown : 15);
      setRoundNumber(saved.roundNumber || 28);
      setReconnectTip('⚡ 已自动断线重连，恢复对局界面与牌型！');
      setTimeout(() => setReconnectTip(null), 3500);
    } else {
      startNewRound();
    }
  }, []);

  // Real-time Match Session Persistence
  useEffect(() => {
    if (headCards.length > 0 && phase !== 'GAME_OVER') {
      const sessionData: ActiveMatchSession = {
        room: currentRoom,
        roundNumber,
        phase,
        countdown,
        players,
        headCards,
        midCards,
        tailCards,
        smartOptions,
        currentOptionIndex,
        timestamp: Date.now()
      };
      saveMatchSession(sessionData);
    }
  }, [headCards, midCards, tailCards, phase, countdown, roundNumber, players, smartOptions, currentOptionIndex, currentRoom]);

  // Online / Offline Network Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectTip('✓ 网络连接已恢复，实时战局同步中！');
      if (soundEnabled) SoundEffects.playMessagePop();
      setTimeout(() => setReconnectTip(null), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnectTip('⚠️ 网络已断开，正在保持战局等待重连...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [soundEnabled]);

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
    if (soundEnabled) SoundEffects.playShowdownDing(false);

    // Step 1: Head Showdown (前墩)
    setTimeout(() => {
      setPhase('SHOWDOWN_MID');
      if (soundEnabled) SoundEffects.playShowdownDing(false);

      // Step 2: Middle Showdown (中墩)
      setTimeout(() => {
        setPhase('SHOWDOWN_TAIL');
        if (soundEnabled) SoundEffects.playShowdownDing(true);

        // Step 3: Tail Showdown (后墩)
        setTimeout(() => {
          const activeFour = updatedPlayers.slice(0, 4);
          const result = calculateGameSettlement(activeFour);

          setSettlement(result);
          setPhase('ROUND_RESULT');

          const myDelta = result.scores['player_me'] || 0;
          const hasGunShot = result.gunShots && result.gunShots.length > 0;
          const hasSlam = Boolean(result.grandSlamPlayerId);

          if (hasSlam && soundEnabled) {
            SoundEffects.playGunShot();
            setTimeout(() => SoundEffects.playFanfare(), 400);
          } else if (hasGunShot && soundEnabled) {
            SoundEffects.playGunShot();
          }

          const updatedUser = recordGameResult(myDelta, myDelta > 0, 0, false, false);
          setCurrentUser(updatedUser);

          if (myDelta > 0) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            if (soundEnabled && !hasSlam) SoundEffects.playFanfare();
          } else {
            if (soundEnabled && !hasGunShot) SoundEffects.playWarning();
          }
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Send message or quick phrase with Mandarin TTS voice
  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || chatInput.trim();
    if (!content) return;

    const bubble: SpeechBubble = {
      id: `bubble_${Date.now()}`,
      playerId: 'player_me',
      text: content,
      type: 'text',
      createdAt: Date.now()
    };
    setSpeechBubbles((prev) => [...prev, bubble]);
    setChatInput('');

    if (soundEnabled) {
      SoundEffects.playMessagePop();
      SoundEffects.speakMandarin(content);
    }

    setTimeout(() => {
      setSpeechBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    }, 4500);
  };

  // Send Voice Message (Real Mic Audio or Spoken Voice)
  const handleSendVoice = (voiceText: string, audioUrl?: string, duration = 2) => {
    const bubble: SpeechBubble = {
      id: `bubble_${Date.now()}`,
      playerId: 'player_me',
      text: voiceText,
      type: 'voice',
      audioUrl,
      duration,
      createdAt: Date.now()
    };
    setSpeechBubbles((prev) => [...prev, bubble]);

    if (soundEnabled) {
      SoundEffects.playVoiceMessage(audioUrl, voiceText);
    }

    setTimeout(() => {
      setSpeechBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    }, 5500);
  };

  // Start Real Microphone Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to voice picker if browser denies getUserMedia
        setShowVoicePicker(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const finalSec = Math.max(1, recordSeconds);
        handleSendVoice(`【对讲语音】0:0${finalSec}`, audioUrl, finalSec);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone access unavailable, showing voice lines picker:', err);
      setShowVoicePicker(true);
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Click voice bubble to replay audio
  const handlePlayBubble = (b: SpeechBubble) => {
    setPlayingBubbleId(b.id);
    SoundEffects.playVoiceMessage(b.audioUrl, b.text);
    setTimeout(() => setPlayingBubbleId(null), (b.duration || 2) * 1000 + 300);
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
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#0B1120] text-slate-100 flex flex-col font-sans select-none relative overflow-hidden justify-between">
      {/* 1. TOP HEADER BAR */}
      <header className="px-3 py-1.5 bg-[#0F172A] border-b border-slate-800/80 flex items-center justify-between z-30 shadow-md shrink-0">
        {/* Left: Back Arrow + Flame Icon + Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              clearMatchSession();
              onBackToLobby();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
            title="返回游戏大厅"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>

          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <span>对战场</span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] sm:text-xs text-slate-300">
              第 <strong className="text-amber-400 font-mono">{roundNumber}</strong> 局
            </span>
          </div>
        </div>

        {/* Right: Network Status + Chip Count Pill + Chat Button */}
        <div className="flex items-center gap-2">
          {/* Network indicator */}
          <div className={`p-1 rounded-full ${isOnline ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`} title={isOnline ? '网络正常' : '网络断开'}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </div>

          {/* Gold Chip Pill */}
          <div className="px-2.5 py-1 bg-slate-950 border border-amber-500/40 rounded-full flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold shadow-xs">
            <Coins className="w-3.5 h-3.5" />
            <span>{currentUser.chips.toLocaleString()}</span>
          </div>

          {/* Purple Chat Button (Opens integrated chat drawer) */}
          <button
            onClick={() => setShowChatDrawer(true)}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-md active:scale-95"
            title="快捷短语、语音与表情"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Reconnect & Alert Banner (紧凑单行，绝不增加垂直高度) */}
      {reconnectTip && (
        <div className="px-3 py-1 bg-gradient-to-r from-indigo-900/90 to-slate-900/90 border-b border-indigo-500/50 text-indigo-200 text-[11px] font-medium flex items-center justify-between gap-2 z-30 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
            <span className="truncate">{reconnectTip}</span>
          </div>
          <button onClick={() => setReconnectTip(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. HORIZONTAL 8 PLAYER SEATS RIBBON */}
      <div className="px-2 py-1 bg-[#090E1A] border-b border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 z-20 shrink-0">
        {players.map((seat) => {
          const isSelected = activeSeatId === seat.id;
          const isMe = seat.id === 'player_me';

          return (
            <button
              key={seat.id}
              onClick={() => setActiveSeatId(seat.id)}
              className={`flex flex-col items-center justify-center min-w-[48px] py-0.5 px-1 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="text-sm leading-none mb-0.5">{seat.avatar}</div>
              <div
                className={`text-[9px] font-medium truncate max-w-[42px] leading-tight ${
                  isSelected ? 'text-amber-300 font-bold' : isMe ? 'text-slate-200' : 'text-slate-400'
                }`}
              >
                {seat.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN TABLE BODY: ENLARGED DUN SECTIONS (前墩 / 中墩 / 后墩) 绝对不允许滚动 */}
      <main className="flex-1 max-w-lg mx-auto w-full px-2 py-1 flex flex-col justify-between gap-1 overflow-hidden">
        {/* Floating Voice & Text Speech Bubbles (Click to Play Voice Audio) */}
        {speechBubbles.map((b) => {
          const isVoice = b.type === 'voice';
          const isPlaying = playingBubbleId === b.id;

          return (
            <div
              key={b.id}
              onClick={() => handlePlayBubble(b)}
              className={`p-1.5 rounded-xl text-xs font-bold shadow-xl animate-in fade-in flex items-center gap-2 cursor-pointer transition-transform active:scale-95 ${
                isVoice
                  ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
                  : 'bg-indigo-900/90 text-white border border-indigo-500'
              }`}
            >
              {isVoice ? (
                <>
                  <Radio className={`w-3.5 h-3.5 text-emerald-400 ${isPlaying ? 'animate-pulse text-amber-300' : ''}`} />
                  <span>语音 {b.duration || 2}"</span>
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <span className={`inline-block w-1 bg-emerald-400 rounded-full ${isPlaying ? 'h-3 animate-bounce' : 'h-1.5'}`} />
                    <span className={`inline-block w-1 bg-emerald-400 rounded-full ${isPlaying ? 'h-4 animate-bounce delay-75' : 'h-2.5'}`} />
                    <span className={`inline-block w-1 bg-emerald-400 rounded-full ${isPlaying ? 'h-2 animate-bounce delay-150' : 'h-1.5'}`} />
                  </span>
                  <span className="text-[10px] text-emerald-300/80">点击播放 ▶</span>
                </>
              ) : (
                <>
                  <span>💬</span>
                  <span className="truncate">{b.text}</span>
                </>
              )}
            </div>
          );
        })}

        {/* SECTION 1: 前墩 (Head Dun 3/3) */}
        <div className="bg-[#0F172A]/95 border border-slate-800/90 rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50" />
              <span className="font-bold text-slate-100 text-xs">前墩</span>
              <span className="px-1.5 py-0.1 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                {headCards.length}/3
              </span>
            </div>
            <div className="text-sky-400 text-xs font-bold font-mono truncate max-w-[220px]">
              {getDunLabel(headEval, headCards, true)}
            </div>
          </div>

          {/* Playing Cards Row */}
          <div className="flex items-center justify-start pl-1 flex-1 overflow-visible">
            <div className="flex -space-x-7 sm:-space-x-5">
              {headCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-1.5 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: 中墩 (Middle Dun 5/5) */}
        <div className="bg-[#0F172A]/95 border border-slate-800/90 rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50" />
              <span className="font-bold text-slate-100 text-xs">中墩</span>
              <span className="px-1.5 py-0.1 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                {midCards.length}/5
              </span>
            </div>
            <div className="text-sky-400 text-xs font-bold font-mono truncate max-w-[220px]">
              {getDunLabel(midEval, midCards, false)}
            </div>
          </div>

          {/* Playing Cards Row */}
          <div className="flex items-center justify-start pl-1 flex-1 overflow-visible">
            <div className="flex -space-x-8 sm:-space-x-6">
              {midCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-1.5 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: 后墩 (Tail Dun 5/5) */}
        <div className="bg-[#0F172A]/95 border border-slate-800/90 rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-xs shadow-purple-400/50" />
              <span className="font-bold text-slate-100 text-xs">后墩</span>
              <span className="px-1.5 py-0.1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                {tailCards.length}/5
              </span>
            </div>
            <div className="text-purple-400 text-xs font-bold font-mono truncate max-w-[220px]">
              {getDunLabel(tailEval, tailCards, false)}
            </div>
          </div>

          {/* Playing Cards Row */}
          <div className="flex items-center justify-start pl-1 flex-1 overflow-visible">
            <div className="flex -space-x-8 sm:-space-x-6">
              {tailCards.map((card) => (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-1.5 duration-150 drop-shadow-md"
                >
                  <CardItem card={card} size="md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settlement Showdown Results Overlay (if finished) */}
        {phase === 'ROUND_RESULT' && settlement && (
          <div className="absolute inset-x-3 top-14 z-50 p-4 bg-slate-900/95 border-2 border-amber-500/70 rounded-2xl shadow-2xl space-y-2.5 animate-in zoom-in-95 backdrop-blur-sm">
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
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再战一局</span>
            </button>
          </div>
        )}
      </main>

      {/* 4. CLEAN BOTTOM ACTIONS (ONLY DUAL BUTTONS, NO INPUT BAR) */}
      <footer className="w-full max-w-lg mx-auto p-2 bg-[#0F172A] border-t border-slate-800/80 flex items-center gap-2 z-30 shrink-0 shadow-lg">
        {/* Button 1: 变换牌型 (Cycle combinations) */}
        <button
          onClick={handleCycleSmartHand}
          disabled={phase !== 'ARRANGING'}
          className="flex-1 py-2.5 px-3 bg-[#0B1120] hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-400 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>变换牌型</span>
        </button>

        {/* Button 2: 提交牌型 (13/13) */}
        <button
          onClick={handleSubmitHand}
          disabled={phase !== 'ARRANGING'}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>提交牌型 (13/13)</span>
        </button>
      </footer>

      {/* 5. ULTRA-COMPACT BOTTOM-SHEET INTERACTIVE CHAT & VOICE RECORDER DRAWER */}
      {showChatDrawer && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in cursor-pointer"
          onClick={() => {
            if (isRecording) stopRecording();
            setShowChatDrawer(false);
          }}
        >
          {/* Bottom Sheet Drawer Card */}
          <div
            className="bg-[#0F172A] border-t border-slate-700 rounded-t-3xl max-w-lg mx-auto w-full p-3 shadow-2xl flex flex-col gap-2 cursor-default animate-in slide-in-from-bottom-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title + Big Return Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white">局内互动 · 语音对讲与聊天</span>
              </div>
              <button
                onClick={() => {
                  if (isRecording) stopRecording();
                  setShowChatDrawer(false);
                }}
                className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-full border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <span>返回游戏</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Row 1: Real Mic Voice Recorder + Sound Toggle + Text Input + Send Button */}
            <div className="flex items-center gap-1.5">
              {/* Mic voice recording button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="h-8 px-3 bg-rose-600 animate-pulse text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>停止并发送 ({recordSeconds}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="h-8 px-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-medium text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  title="点击开始录音发送语音消息"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>按键语音</span>
                </button>
              )}

              {/* Sound Toggle button */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-8 px-2 border font-medium text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                  soundEnabled
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="音效开关"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? '音效开' : '静音'}</span>
              </button>

              {/* Input + Send */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                  setShowChatDrawer(false);
                }}
                className="flex-1 flex items-center gap-1"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="输入聊天内容..."
                  className="w-full h-8 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Quick Preset Voice Clips (即点即播即发语音) */}
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>经典语音对讲（点击直接语音大声播报）：</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_VOICE_LINES.map((vl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSendVoice(vl.text, undefined, vl.sec);
                      setShowChatDrawer(false);
                    }}
                    className="text-left px-2 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 text-[11px] text-emerald-200 truncate rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <span>🎙️</span>
                    <span className="truncate">{vl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: 8 Emojis Bar */}
            <div className="flex items-center justify-between gap-1 px-2 py-0.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    handleSendEmoji(em);
                    setShowChatDrawer(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform p-0.5 flex items-center justify-center cursor-pointer active:scale-90"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Row 3: Quick Phrases Grid (2 Columns, perfectly fits on screen) */}
            <div className="grid grid-cols-2 gap-1">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSendMessage(phrase);
                    setShowChatDrawer(false);
                  }}
                  className="text-left px-2 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 rounded-xl text-[10px] text-slate-300 hover:text-amber-300 truncate transition-colors cursor-pointer active:scale-95"
                  title={phrase}
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
