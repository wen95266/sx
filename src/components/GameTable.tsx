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
  sortCardsBySuit,
  evaluateDun,
  validateDaoPai,
  compareDuns,
  calculateSmartArrangements,
  calculateGameSettlement
} from '../utils/cardLogic';
import { SoundEffects } from '../utils/audio';
import { CardItem } from './CardItem';
import {
  getStoredUser,
  recordGameResult,
  UserProfile,
  addChips,
  saveMatchSession,
  getMatchSession,
  clearMatchSession,
  ActiveMatchSession,
  saveMatchHistoryRecord,
  MatchHistoryRecord,
  ReplayPlayerDun
} from '../utils/authStorage';
import { triggerHaptic } from '../utils/haptics';
import { PointsManagementModal } from './PointsManagementModal';
import { MatchHistoryModal } from './MatchHistoryModal';
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
  Radio,
  Square,
  Users,
  Bot,
  AlertTriangle,
  FastForward,
  Crown,
  ShieldAlert,
  ChevronRight,
  Check,
  History
} from 'lucide-react';

interface GameTableProps {
  currentRoom?: LobbyRoom;
  onBackToLobby: () => void;
  onUpdateUser?: (user: UserProfile) => void;
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
  onBackToLobby,
  onUpdateUser
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [roundNumber, setRoundNumber] = useState(28);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sortBySuit, setSortBySuit] = useState(false);
  const [showBankruptcyBonus, setShowBankruptcyBonus] = useState(false);

  // Game Phases: ARRANGING -> SHOWDOWN_HEAD -> SHOWDOWN_MID -> SHOWDOWN_TAIL -> ROUND_RESULT
  const [phase, setPhase] = useState<GamePhase>('ARRANGING');
  const [countdown, setCountdown] = useState(30);

  // Multi-card selection for manual arranging
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [arrangeError, setArrangeError] = useState<string | null>(null);
  const [showDaoPaiModal, setShowDaoPaiModal] = useState(false);
  const [daoPaiReason, setDaoPaiReason] = useState<string>('');

  // Hosting / Auto-Arrange Mode
  const [isHosting, setIsHosting] = useState(false);

  // Modal: Show all players list popup
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // Network & Reconnect Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnectTip, setReconnectTip] = useState<string | null>(null);

  // Showdown View Mode in ROUND_RESULT: 'all_duns' (三墩全览) or 'matches' (对决明细)
  const [settlementTab, setSettlementTab] = useState<'all_duns' | 'matches'>('all_duns');

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

  // Card Duns for user (unrestricted card count during arranging, total = 13)
  const [headCards, setHeadCards] = useState<Card[]>([]);
  const [midCards, setMidCards] = useState<Card[]>([]);
  const [tailCards, setTailCards] = useState<Card[]>([]);
  const [smartOptions, setSmartOptions] = useState<AutoArrangeOption[]>([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);

  // Settlement & Showdown
  const [settlement, setSettlement] = useState<SettlementSummary | null>(null);

  // Chat, Floating Danmu, Recent Banner Message
  const [chatInput, setChatInput] = useState('');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [activeReactions, setActiveReactions] = useState<EmojiReaction[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [latestChatMessage, setLatestChatMessage] = useState<{ sender: string; text: string } | null>({
    sender: '系统',
    text: '十三水开局成功，祝各位好运连连！'
  });

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

  const is8Players = currentRoom?.maxPlayers === 8;
  const activePlayerCount = is8Players ? 8 : 4;
  const activeParticipants = players.slice(0, activePlayerCount);

  // Toggle card selection
  const handleCardClick = (card: Card) => {
    if (phase !== 'ARRANGING') return;
    if (soundEnabled) SoundEffects.playCardClick();
    setSelectedCardIds((prev) =>
      prev.includes(card.id) ? prev.filter((id) => id !== card.id) : [...prev, card.id]
    );
  };

  // Move selected cards to a target dun
  const handleMoveSelectedToDun = (targetDun: 'head' | 'mid' | 'tail') => {
    if (phase !== 'ARRANGING') return;
    if (selectedCardIds.length === 0) return;

    const allCards = [...headCards, ...midCards, ...tailCards];
    const movingCards = allCards.filter((c) => selectedCardIds.includes(c.id));
    if (movingCards.length === 0) return;

    let newHead = headCards.filter((c) => !selectedCardIds.includes(c.id));
    let newMid = midCards.filter((c) => !selectedCardIds.includes(c.id));
    let newTail = tailCards.filter((c) => !selectedCardIds.includes(c.id));

    if (targetDun === 'head') {
      newHead = [...newHead, ...movingCards];
    } else if (targetDun === 'mid') {
      newMid = [...newMid, ...movingCards];
    } else if (targetDun === 'tail') {
      newTail = [...newTail, ...movingCards];
    }

    setHeadCards(sortCards(newHead));
    setMidCards(sortCards(newMid));
    setTailCards(sortCards(newTail));
    setSelectedCardIds([]);
    setArrangeError(null);

    if (soundEnabled) SoundEffects.playDealCard();
  };

  // Cycle Through Smart Hand Combinations
  const handleCycleSmartHand = useCallback(() => {
    if (smartOptions.length === 0) return;
    if (soundEnabled) SoundEffects.playCardClick();

    const nextIndex = (currentOptionIndex + 1) % smartOptions.length;
    setCurrentOptionIndex(nextIndex);
    const opt = smartOptions[nextIndex];

    setHeadCards(opt.head);
    setMidCards(opt.middle);
    setTailCards(opt.tail);
    setSelectedCardIds([]);
    setArrangeError(null);
  }, [smartOptions, currentOptionIndex, soundEnabled]);

  // Toggle sort between Rank and Suit for all cards
  const handleToggleCardSort = () => {
    if (phase !== 'ARRANGING') return;
    if (soundEnabled) SoundEffects.playCardClick();
    const nextSortBySuit = !sortBySuit;
    setSortBySuit(nextSortBySuit);
    const sorter = nextSortBySuit ? sortCardsBySuit : sortCards;
    setHeadCards((prev) => sorter(prev));
    setMidCards((prev) => sorter(prev));
    setTailCards((prev) => sorter(prev));
  };

  // Reset to initial best smart hand
  const handleResetToBestHand = () => {
    if (phase !== 'ARRANGING') return;
    if (smartOptions.length === 0) return;
    if (soundEnabled) SoundEffects.playDealCard();
    setCurrentOptionIndex(0);
    const opt = smartOptions[0];
    setHeadCards(opt.head);
    setMidCards(opt.middle);
    setTailCards(opt.tail);
    setSelectedCardIds([]);
    setArrangeError(null);
  };

  // Execute actual submission and begin showdown sequence
  const executeSubmitShowdown = useCallback(
    (hCards: Card[], mCards: Card[], tCards: Card[], isDaoPai = false, daoReason?: string) => {
      setSelectedCardIds([]);
      setArrangeError(null);
      setShowDaoPaiModal(false);

      const updatedPlayers = players.map((p) => {
        if (p.id === 'player_me') {
          return {
            ...p,
            isReady: true,
            arrangement: {
              head: hCards,
              middle: mCards,
              tail: tCards,
              isDaoPai,
              daoPaiReason: daoReason
            }
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      setPhase('SHOWDOWN_HEAD');

      if (soundEnabled) {
        SoundEffects.playShowdownDing(false);
        SoundEffects.speakMandarin('前墩比牌！');
      }

      // Step 1: Head Showdown (前墩)
      setTimeout(() => {
        setPhase('SHOWDOWN_MID');
        if (soundEnabled) {
          SoundEffects.playShowdownDing(false);
          SoundEffects.speakMandarin('中墩比牌！');
        }

        // Step 2: Middle Showdown (中墩)
        setTimeout(() => {
          setPhase('SHOWDOWN_TAIL');
          if (soundEnabled) {
            SoundEffects.playShowdownDing(true);
            SoundEffects.speakMandarin('后墩比牌，决胜局！');
          }

          // Step 3: Tail Showdown (后墩)
          setTimeout(() => {
            const participants = updatedPlayers.slice(0, activePlayerCount);
            const result = calculateGameSettlement(participants);

            setSettlement(result);
            setPhase('ROUND_RESULT');

            const myDelta = result.scores['player_me'] || 0;
            const hasGunShot = result.gunShots && result.gunShots.length > 0;
            const hasSlam = Boolean(result.grandSlamPlayerId);

            if (hasSlam && soundEnabled) {
              SoundEffects.playGunShot();
              SoundEffects.speakMandarin('全垒打！通杀全场！');
              setTimeout(() => SoundEffects.playFanfare(), 400);
            } else if (hasGunShot && soundEnabled) {
              SoundEffects.playGunShot();
              SoundEffects.speakMandarin('打枪！');
            } else if (soundEnabled) {
              SoundEffects.speakMandarin('比牌结束，查看结算！');
            }

            const updatedUser = recordGameResult(myDelta, myDelta > 0, 0, false, false);
            setCurrentUser(updatedUser);
            if (onUpdateUser) onUpdateUser(updatedUser);

            // Persist match history record for 战绩复盘
            try {
              const hist: MatchHistoryRecord = {
                id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                roundNumber,
                roomName: currentRoom?.name || (is8Players ? '八人对战场' : '四人对战场'),
                timestamp: Date.now(),
                myScoreDelta: myDelta,
                hasGunShot: Boolean(hasGunShot),
                isGrandSlam: Boolean(hasSlam),
                players: participants.map((p) => {
                  const hEval = evaluateDun(p.arrangement.head, true);
                  const mEval = evaluateDun(p.arrangement.middle, false);
                  const tEval = evaluateDun(p.arrangement.tail, false);
                  return {
                    playerId: p.id,
                    name: p.name,
                    avatar: p.avatar,
                    isMe: p.id === 'player_me',
                    head: p.arrangement.head,
                    middle: p.arrangement.middle,
                    tail: p.arrangement.tail,
                    headTypeName: hEval.typeName,
                    midTypeName: mEval.typeName,
                    tailTypeName: tEval.typeName,
                    score: result.scores[p.id] || 0,
                    isDaoPai: p.arrangement.isDaoPai || false
                  };
                }),
                gunShots: result.gunShots?.map((g) => {
                  const s = participants.find((p) => p.id === g.shooterId);
                  const t = participants.find((p) => p.id === g.targetId);
                  return {
                    shooterName: s?.name || '未知',
                    targetName: t?.name || '未知'
                  };
                }),
                grandSlamPlayerName: hasSlam
                  ? participants.find((p) => p.id === result.grandSlamPlayerId)?.name
                  : undefined
              };
              saveMatchHistoryRecord(hist);
            } catch (err) {
              console.error('Failed to save match history record', err);
            }

            // Check bankruptcy relief bonus
            if (updatedUser.chips < 100) {
              setTimeout(() => {
                setShowBankruptcyBonus(true);
              }, 1200);
            }

            if (myDelta > 0) {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              if (soundEnabled && !hasSlam) SoundEffects.playFanfare();
            } else {
              if (soundEnabled && !hasGunShot) SoundEffects.playWarning();
            }
          }, 2600);
        }, 2600);
      }, 2600);
    },
    [players, activePlayerCount, soundEnabled, roundNumber, currentRoom, is8Players, onUpdateUser]
  );

  // Fast forward directly to final settlement
  const handleSkipShowdown = () => {
    const participants = players.slice(0, activePlayerCount);
    const result = calculateGameSettlement(participants);
    setSettlement(result);
    setPhase('ROUND_RESULT');
    if (soundEnabled) SoundEffects.playShowdownDing(true);

    const myDelta = result.scores['player_me'] || 0;
    const hasGunShot = result.gunShots && result.gunShots.length > 0;
    const hasSlam = Boolean(result.grandSlamPlayerId);
    const updatedUser = recordGameResult(myDelta, myDelta > 0, 0, false, false);
    setCurrentUser(updatedUser);
    if (onUpdateUser) onUpdateUser(updatedUser);

    try {
      const hist: MatchHistoryRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roundNumber,
        roomName: currentRoom?.name || (is8Players ? '八人对战场' : '四人对战场'),
        timestamp: Date.now(),
        myScoreDelta: myDelta,
        hasGunShot: Boolean(hasGunShot),
        isGrandSlam: Boolean(hasSlam),
        players: participants.map((p) => {
          const hEval = evaluateDun(p.arrangement.head, true);
          const mEval = evaluateDun(p.arrangement.middle, false);
          const tEval = evaluateDun(p.arrangement.tail, false);
          return {
            playerId: p.id,
            name: p.name,
            avatar: p.avatar,
            isMe: p.id === 'player_me',
            head: p.arrangement.head,
            middle: p.arrangement.middle,
            tail: p.arrangement.tail,
            headTypeName: hEval.typeName,
            midTypeName: mEval.typeName,
            tailTypeName: tEval.typeName,
            score: result.scores[p.id] || 0,
            isDaoPai: p.arrangement.isDaoPai || false
          };
        }),
        gunShots: result.gunShots?.map((g) => {
          const s = participants.find((p) => p.id === g.shooterId);
          const t = participants.find((p) => p.id === g.targetId);
          return {
            shooterName: s?.name || '未知',
            targetName: t?.name || '未知'
          };
        }),
        grandSlamPlayerName: hasSlam
          ? participants.find((p) => p.id === result.grandSlamPlayerId)?.name
          : undefined
      };
      saveMatchHistoryRecord(hist);
    } catch (err) {
      console.error('Failed to save match history record', err);
    }
  };

  // Submit Hand: Checks strictly 3, 5, 5 card counts only upon submission
  const handleSubmitHand = useCallback(() => {
    if (soundEnabled) SoundEffects.playCardClick();

    // STRICT CHECK: Head must be 3, Middle must be 5, Tail must be 5
    if (headCards.length !== 3 || midCards.length !== 5 || tailCards.length !== 5) {
      setArrangeError(
        `⚠️ 牌数不符合规则！前墩需3张（当前${headCards.length}张），中墩需5张（当前${midCards.length}张），后墩需5张（当前${tailCards.length}张）。请点击牌进行多选并调整！`
      );
      if (soundEnabled) SoundEffects.playWarning();
      return;
    }

    // Check Dao-Pai (倒牌)
    const daoCheck = validateDaoPai(headCards, midCards, tailCards);
    if (daoCheck.isDaoPai) {
      setDaoPaiReason(daoCheck.reason || '前墩大于中墩，或中墩大于后墩！');
      setShowDaoPaiModal(true);
      if (soundEnabled) SoundEffects.playWarning();
      return;
    }

    // Valid, proceed to submit
    executeSubmitShowdown(headCards, midCards, tailCards, false);
  }, [headCards, midCards, tailCards, executeSubmitShowdown, soundEnabled]);

  // Deal 13 Cards to everyone & Auto Compute Best Hand (1 deck for 4p, 2 decks for 8p)
  const startNewRound = useCallback(() => {
    if (soundEnabled) SoundEffects.playDealCard();

    const is8p = currentRoom?.maxPlayers === 8;
    const deckCount = is8p ? 2 : 1;
    const activeCount = is8p ? 8 : 4;
    const deck = shuffleDeck(createDeck(deckCount));

    const handMe = sortCards(deck.slice(0, 13));

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

    setSelectedCardIds([]);
    setArrangeError(null);
    setShowDaoPaiModal(false);

    // Set player arrangements dynamically for 4 or 8 players
    const updatedPlayers = players.map((p, idx) => {
      if (idx >= activeCount) return p;

      const pHand = idx === 0 ? handMe : sortCards(deck.slice(idx * 13, (idx + 1) * 13));
      const pOpts = calculateSmartArrangements(pHand);
      const chosen = pOpts[0] || {
        head: pHand.slice(0, 3),
        middle: pHand.slice(3, 8),
        tail: pHand.slice(8, 13)
      };

      return {
        ...p,
        name: idx === 0 ? currentUser.nickname || '我' : p.name,
        avatar: idx === 0 ? currentUser.avatar || '😎' : p.avatar,
        cards: pHand,
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
  }, [soundEnabled, players, currentUser, currentRoom]);

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

  // Hosting (托管) / Auto-Arrange Effect: Automatically pick best hand and auto-submit
  useEffect(() => {
    if (isHosting && phase === 'ARRANGING') {
      const best = smartOptions[0];
      if (best) {
        setHeadCards(best.head);
        setMidCards(best.middle);
        setTailCards(best.tail);
      }
      const hostTimer = setTimeout(() => {
        if (best) {
          executeSubmitShowdown(best.head, best.middle, best.tail, false);
        } else {
          handleSubmitHand();
        }
      }, 1200);
      return () => clearTimeout(hostTimer);
    }
  }, [isHosting, phase, smartOptions, executeSubmitShowdown, handleSubmitHand]);

  // Timer countdown: Auto arrange and auto submit when time expires
  useEffect(() => {
    if (phase !== 'ARRANGING') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 超时自动理牌并提交最佳牌型，避免倒牌判负
          const best = smartOptions[0];
          if (best) {
            setHeadCards(best.head);
            setMidCards(best.middle);
            setTailCards(best.tail);
            executeSubmitShowdown(best.head, best.middle, best.tail, false);
          } else {
            handleSubmitHand();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, smartOptions, executeSubmitShowdown, handleSubmitHand]);

  // Send message or quick phrase with Mandarin TTS voice
  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || chatInput.trim();
    if (!content) return;

    const myName = currentUser.nickname || '我';
    const bubble: SpeechBubble = {
      id: `bubble_${Date.now()}`,
      playerId: 'player_me',
      text: content,
      type: 'text',
      createdAt: Date.now()
    };
    setSpeechBubbles((prev) => [...prev, bubble]);
    setLatestChatMessage({ sender: myName, text: content });
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
    const myName = currentUser.nickname || '我';
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
    setLatestChatMessage({ sender: myName, text: `🎙️ ${voiceText}` });

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
    setLatestChatMessage({ sender: currentUser.nickname || '我', text: `表情互动 ${emoji}` });
    if (soundEnabled) SoundEffects.playEmojiReaction();
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== rx.id));
    }, 2500);
  };

  // Dun Evaluations (handles any card count smoothly)
  const headEval: DunEvaluation = evaluateDun(headCards, true);
  const midEval: DunEvaluation = evaluateDun(midCards, false);
  const tailEval: DunEvaluation = evaluateDun(tailCards, false);

  const getDunLabel = (evalResult: DunEvaluation, cards: Card[], targetCount: number, isHead = false) => {
    if (cards.length === 0) return `[需${targetCount}张] 未选牌`;
    if (cards.length !== targetCount) {
      return `[需${targetCount}张] 当前已放入 ${cards.length} 张`;
    }

    const rankLabels = cards.map((c) => c.label);
    if (evalResult.type === 'ONE_PAIR') {
      const pairRank = evalResult.primaryRanks[0];
      const pairLabel = cards.find((c) => c.rank === pairRank)?.label || '';
      const singles = cards.filter((c) => c.rank !== pairRank).map((c) => c.label).join(' ');
      return `[对子] 对 ${pairLabel} ${singles ? `(单张 ${singles})` : ''}`;
    }
    if (evalResult.type === 'FLUSH') {
      const topRank = evalResult.primaryRanks[0];
      const topLabel = cards.find((c) => c.rank === topRank)?.label || '';
      return `[同花] 同花 (${cards[0]?.suitSymbol || ''} ${topLabel}高)`;
    }
    if (evalResult.type === 'FULL_HOUSE') {
      const tripRank = evalResult.primaryRanks[0];
      const pairRank = evalResult.primaryRanks[1];
      const tripLabel = cards.find((c) => c.rank === tripRank)?.label || '';
      const pairLabel = cards.find((c) => c.rank === pairRank)?.label || '';
      return `[葫芦] 葫芦 (${tripLabel}带${pairLabel})`;
    }
    if (evalResult.type === 'STRAIGHT') {
      const topRank = evalResult.primaryRanks[0];
      const topLabel = cards.find((c) => c.rank === topRank)?.label || '';
      return `[顺子] 顺子 (${topLabel}高)`;
    }
    if (evalResult.type === 'THREE_OF_A_KIND') {
      const tripRank = evalResult.primaryRanks[0];
      const tripLabel = cards.find((c) => c.rank === tripRank)?.label || '';
      return `[三条] 冲三 (${tripLabel}条)`;
    }
    if (evalResult.type === 'TWO_PAIRS') {
      const p1 = cards.find((c) => c.rank === evalResult.primaryRanks[0])?.label || '';
      const p2 = cards.find((c) => c.rank === evalResult.primaryRanks[1])?.label || '';
      return `[两对] 两对 (${p1}和${p2})`;
    }
    if (evalResult.type === 'FOUR_OF_A_KIND') {
      const quadRank = evalResult.primaryRanks[0];
      const quadLabel = cards.find((c) => c.rank === quadRank)?.label || '';
      return `[铁支] 铁支 (${quadLabel})`;
    }
    if (evalResult.type === 'STRAIGHT_FLUSH') {
      return `[同花顺] 同花顺 (${cards[0]?.suitSymbol || ''})`;
    }
    return `[${evalResult.typeName}] ${rankLabels[0] || ''}高`;
  };

  // Find leading player for active showdown dun
  const getLeadingPlayerForDun = (dunKey: 'head' | 'middle' | 'tail'): string => {
    if (activeParticipants.length === 0) return '';
    let leaderId = activeParticipants[0].id;
    let leaderEval = evaluateDun(activeParticipants[0].arrangement[dunKey], dunKey === 'head');

    for (let i = 1; i < activeParticipants.length; i++) {
      const currEval = evaluateDun(activeParticipants[i].arrangement[dunKey], dunKey === 'head');
      if (compareDuns(currEval, leaderEval) > 0) {
        leaderEval = currEval;
        leaderId = activeParticipants[i].id;
      }
    }
    return leaderId;
  };

  const isShowdownPhase =
    phase === 'SHOWDOWN_HEAD' ||
    phase === 'SHOWDOWN_MID' ||
    phase === 'SHOWDOWN_TAIL' ||
    phase === 'ROUND_RESULT';

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
            <span>{currentRoom?.name || (is8Players ? '八人对战场' : '四人对战场')}</span>
            <span className="text-slate-500">·</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {is8Players ? '2副牌·104张' : '1副牌·52张'}
            </span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-[11px] sm:text-xs text-slate-300 hidden sm:inline">
              第 <strong className="text-amber-400 font-mono">{roundNumber}</strong> 局
            </span>
          </div>
        </div>

        {/* Right: History + Player Count Badge + Gold Chips + Chat Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History / 战绩复盘 */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-2 py-0.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-bold rounded-full flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
            title="查看近期对局战绩与亮牌复盘"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">战绩</span>
          </button>

          {/* Player Count Badge */}
          <div
            onClick={() => setShowPlayersModal(true)}
            className="px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
            title="点击查看所有玩家"
          >
            <Users className="w-3 h-3 text-amber-400" />
            <span>{activePlayerCount}/{is8Players ? '8' : '4'}</span>
          </div>

          {/* Gold Chip Pill (Click to open Points Management & Transfer) */}
          <button
            onClick={() => setShowPointsModal(true)}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-full flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold shadow-xs cursor-pointer transition-all active:scale-95 group"
            title="点击打开积分管理，搜索手机号互赠积分"
          >
            <Coins className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>{currentUser.chips.toLocaleString()}</span>
          </button>

          {/* Purple Chat Button */}
          <button
            onClick={() => setShowChatDrawer(true)}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-md active:scale-95"
            title="快捷短语、语音与表情"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Reconnect & Alert Banner */}
      {reconnectTip && (
        <div className="px-3 py-1 bg-gradient-to-r from-indigo-900/90 to-slate-900/90 border-b border-indigo-500/50 text-indigo-200 text-[11px] font-medium flex items-center justify-between gap-2 z-30 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate">{reconnectTip}</span>
          </div>
          <button onClick={() => setReconnectTip(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. LIVE STATUS BANNER: 查看玩家 + 文字/短语横幅 */}
      <div className="px-2.5 py-1 bg-[#090E1A] border-b border-slate-800/80 flex items-center justify-between gap-2 z-20 shrink-0">
        <button
          onClick={() => setShowPlayersModal(true)}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs"
          title="点击弹窗查看所有玩家头像和名称"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>查看玩家</span>
        </button>

        <div
          onClick={() => setShowChatDrawer(true)}
          className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-2 overflow-hidden cursor-pointer hover:border-slate-700 transition-colors"
          title="点击发送聊天或快捷短语"
        >
          <span className="text-[10px] font-bold text-amber-400 shrink-0">
            {latestChatMessage?.sender ? `[${latestChatMessage.sender}]:` : '💬'}
          </span>
          <span className="text-xs text-slate-200 truncate flex-1 font-medium">
            {latestChatMessage?.text || '点击右侧短语/语音进行互动交流...'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {phase === 'ARRANGING' ? `${countdown}s` : '比牌中'}
          </span>
        </div>
      </div>

      {/* Manual Arranging Error Toast */}
      {arrangeError && (
        <div className="mx-2 my-1 px-3 py-1.5 bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs rounded-xl flex items-center justify-between gap-2 z-40 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{arrangeError}</span>
          </div>
          <button onClick={() => setArrangeError(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Multi-Selection Action Toolbar */}
      {phase === 'ARRANGING' && selectedCardIds.length > 0 && (
        <div className="mx-2 my-0.5 px-3 py-1.5 bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border-2 border-amber-400/80 rounded-2xl shadow-xl flex items-center justify-between gap-1.5 z-40 animate-in zoom-in-95">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-amber-300">
              已选 <strong className="text-white text-sm font-mono">{selectedCardIds.length}</strong> 张牌
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMoveSelectedToDun('head')}
              className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              移入前墩
            </button>
            <button
              onClick={() => handleMoveSelectedToDun('mid')}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              移入中墩
            </button>
            <button
              onClick={() => handleMoveSelectedToDun('tail')}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              移入后墩
            </button>
            <button
              onClick={() => setSelectedCardIds([])}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="取消多选"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN TABLE BODY: EITHER ARRANGE BOARD OR SHOWDOWN ARENA */}
      <main className="flex-1 max-w-lg mx-auto w-full px-2 py-1 flex flex-col justify-between gap-1 overflow-hidden">
        {/* Floating Voice & Text Speech Bubbles */}
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

        {/* ========================================================= */}
        {/* VIEW A: MANUAL ARRANGING PHASE (前墩 / 中墩 / 后墩) */}
        {/* ========================================================= */}
        {!isShowdownPhase && (
          <>
            {/* DUN 1: 前墩 (Target: 3 cards) */}
            <div
              onClick={() => {
                if (selectedCardIds.length > 0) handleMoveSelectedToDun('head');
              }}
              className={`bg-[#0F172A]/95 border rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden transition-all ${
                selectedCardIds.length > 0
                  ? 'border-sky-500/70 hover:border-sky-400 cursor-pointer ring-1 ring-sky-500/30'
                  : 'border-slate-800/90'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50" />
                  <span className="font-bold text-slate-100 text-xs">前墩</span>
                  <span
                    className={`px-1.5 py-0.1 rounded text-[10px] font-mono font-bold border ${
                      headCards.length === 3
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {headCards.length}/3 {headCards.length === 3 ? '✓' : ''}
                  </span>
                  {selectedCardIds.length > 0 && (
                    <span className="text-[10px] text-sky-400 font-semibold animate-pulse">
                      点击移入此墩
                    </span>
                  )}
                </div>
                <div className="text-sky-400 text-xs font-bold font-mono truncate max-w-[210px]">
                  {getDunLabel(headEval, headCards, 3, true)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex items-center justify-start pl-1 flex-1 overflow-x-auto scrollbar-none">
                {headCards.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-700/60 rounded-xl text-slate-500 text-xs">
                    + 点击将选中的牌移入前墩 (需3张)
                  </div>
                ) : (
                  <div className="flex -space-x-7 sm:-space-x-5 py-1">
                    {headCards.map((card) => {
                      const isSel = selectedCardIds.includes(card.id);
                      return (
                        <div
                          key={card.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(card);
                          }}
                          className={`transition-all duration-150 drop-shadow-md cursor-pointer ${
                            isSel ? '-translate-y-3.5 z-20' : 'hover:-translate-y-1'
                          }`}
                        >
                          <div className="relative">
                            <CardItem card={card} size="md" selected={isSel} />
                            {isSel && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DUN 2: 中墩 (Target: 5 cards) */}
            <div
              onClick={() => {
                if (selectedCardIds.length > 0) handleMoveSelectedToDun('mid');
              }}
              className={`bg-[#0F172A]/95 border rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden transition-all ${
                selectedCardIds.length > 0
                  ? 'border-blue-500/70 hover:border-blue-400 cursor-pointer ring-1 ring-blue-500/30'
                  : 'border-slate-800/90'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-xs shadow-blue-400/50" />
                  <span className="font-bold text-slate-100 text-xs">中墩</span>
                  <span
                    className={`px-1.5 py-0.1 rounded text-[10px] font-mono font-bold border ${
                      midCards.length === 5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {midCards.length}/5 {midCards.length === 5 ? '✓' : ''}
                  </span>
                  {selectedCardIds.length > 0 && (
                    <span className="text-[10px] text-blue-400 font-semibold animate-pulse">
                      点击移入此墩
                    </span>
                  )}
                </div>
                <div className="text-blue-400 text-xs font-bold font-mono truncate max-w-[210px]">
                  {getDunLabel(midEval, midCards, 5, false)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex items-center justify-start pl-1 flex-1 overflow-x-auto scrollbar-none">
                {midCards.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-700/60 rounded-xl text-slate-500 text-xs">
                    + 点击将选中的牌移入中墩 (需5张)
                  </div>
                ) : (
                  <div className="flex -space-x-8 sm:-space-x-6 py-1">
                    {midCards.map((card) => {
                      const isSel = selectedCardIds.includes(card.id);
                      return (
                        <div
                          key={card.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(card);
                          }}
                          className={`transition-all duration-150 drop-shadow-md cursor-pointer ${
                            isSel ? '-translate-y-3.5 z-20' : 'hover:-translate-y-1'
                          }`}
                        >
                          <div className="relative">
                            <CardItem card={card} size="md" selected={isSel} />
                            {isSel && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DUN 3: 后墩 (Target: 5 cards) */}
            <div
              onClick={() => {
                if (selectedCardIds.length > 0) handleMoveSelectedToDun('tail');
              }}
              className={`bg-[#0F172A]/95 border rounded-xl p-1.5 sm:p-2 shadow-md flex flex-col justify-between flex-1 overflow-hidden transition-all ${
                selectedCardIds.length > 0
                  ? 'border-purple-500/70 hover:border-purple-400 cursor-pointer ring-1 ring-purple-500/30'
                  : 'border-slate-800/90'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs shrink-0 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-xs shadow-purple-400/50" />
                  <span className="font-bold text-slate-100 text-xs">后墩</span>
                  <span
                    className={`px-1.5 py-0.1 rounded text-[10px] font-mono font-bold border ${
                      tailCards.length === 5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {tailCards.length}/5 {tailCards.length === 5 ? '✓' : ''}
                  </span>
                  {selectedCardIds.length > 0 && (
                    <span className="text-[10px] text-purple-400 font-semibold animate-pulse">
                      点击移入此墩
                    </span>
                  )}
                </div>
                <div className="text-purple-400 text-xs font-bold font-mono truncate max-w-[210px]">
                  {getDunLabel(tailEval, tailCards, 5, false)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex items-center justify-start pl-1 flex-1 overflow-x-auto scrollbar-none">
                {tailCards.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-700/60 rounded-xl text-slate-500 text-xs">
                    + 点击将选中的牌移入后墩 (需5张)
                  </div>
                ) : (
                  <div className="flex -space-x-8 sm:-space-x-6 py-1">
                    {tailCards.map((card) => {
                      const isSel = selectedCardIds.includes(card.id);
                      return (
                        <div
                          key={card.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(card);
                          }}
                          className={`transition-all duration-150 drop-shadow-md cursor-pointer ${
                            isSel ? '-translate-y-3.5 z-20' : 'hover:-translate-y-1'
                          }`}
                        >
                          <div className="relative">
                            <CardItem card={card} size="md" selected={isSel} />
                            {isSel && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW B: REFINED SHOWDOWN ARENA (比牌对决与结算界面) */}
        {/* ========================================================= */}
        {isShowdownPhase && (
          <div className="flex-1 flex flex-col justify-between gap-1 overflow-hidden bg-[#0A0F1D] border border-amber-500/40 rounded-2xl p-2 shadow-2xl relative">
            {/* Showdown Step Progress Bar */}
            <div className="flex items-center justify-between gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
              <div
                className={`flex-1 py-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                  phase === 'SHOWDOWN_HEAD'
                    ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-400 shadow-md'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                1. 前墩比牌
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <div
                className={`flex-1 py-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                  phase === 'SHOWDOWN_MID'
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                2. 中墩比牌
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <div
                className={`flex-1 py-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                  phase === 'SHOWDOWN_TAIL'
                    ? 'bg-purple-500 text-white ring-2 ring-purple-400 shadow-md'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                3. 后墩比牌
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <div
                className={`flex-1 py-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                  phase === 'ROUND_RESULT'
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                4. 总结算
              </div>

              {phase !== 'ROUND_RESULT' && (
                <button
                  onClick={handleSkipShowdown}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer shrink-0 ml-1"
                  title="跳过比牌动画直接看结算"
                >
                  <FastForward className="w-3 h-3 text-amber-400" />
                  <span>跳过</span>
                </button>
              )}
            </div>

            {/* Active Dun Showdown Duel Cards */}
            {phase !== 'ROUND_RESULT' && (
              <div className="flex-1 flex flex-col justify-around py-1 overflow-y-auto scrollbar-none">
                <div className="text-center font-bold text-xs text-amber-300 flex items-center justify-center gap-1.5 py-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {phase === 'SHOWDOWN_HEAD' && '【第一轮：前墩比牌 · 各家亮出前三张】'}
                    {phase === 'SHOWDOWN_MID' && '【第二轮：中墩比牌 · 各家亮出中五张】'}
                    {phase === 'SHOWDOWN_TAIL' && '【第三轮：后墩决胜 · 决战最后底牌五张】'}
                  </span>
                </div>

                {/* Grid of All Active Players for the current Dun */}
                <div className={`grid ${is8Players ? 'grid-cols-2' : 'grid-cols-2'} gap-1.5`}>
                  {activeParticipants.map((p) => {
                    const isMe = p.id === 'player_me';
                    const dunKey =
                      phase === 'SHOWDOWN_HEAD'
                        ? 'head'
                        : phase === 'SHOWDOWN_MID'
                        ? 'middle'
                        : 'tail';
                    const dunCards = p.arrangement[dunKey] || [];
                    const evalRes = evaluateDun(dunCards, dunKey === 'head');
                    const leadingId = getLeadingPlayerForDun(dunKey);
                    const isLeader = leadingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isLeader
                            ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                            : isMe
                            ? 'bg-slate-900/90 border-slate-700'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        {/* Player Header */}
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-base">{p.avatar}</span>
                            <span className={`font-bold truncate text-[11px] ${isMe ? 'text-amber-300' : 'text-slate-200'}`}>
                              {p.name}
                            </span>
                          </div>
                          {isLeader && (
                            <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-0.5 shrink-0 shadow-xs">
                              <Crown className="w-2.5 h-2.5 fill-current" />
                              <span>头名</span>
                            </span>
                          )}
                        </div>

                        {/* Player's Dun Cards */}
                        <div className="flex items-center justify-center -space-x-7 py-0.5">
                          {dunCards.map((c) => (
                            <div key={c.id} className="drop-shadow-md">
                              <CardItem card={c} size="sm" />
                            </div>
                          ))}
                        </div>

                        {/* Hand Type Label */}
                        <div
                          className={`text-center font-bold text-[10px] truncate mt-0.5 px-1 py-0.2 rounded ${
                            isLeader
                              ? 'text-amber-300 bg-amber-500/20'
                              : 'text-slate-300 bg-slate-900'
                          }`}
                        >
                          {evalRes.typeName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ROUND_RESULT: Full Showdown Results & Detailed Ledger */}
            {phase === 'ROUND_RESULT' && settlement && (
              <div className="flex-1 flex flex-col justify-between gap-1 overflow-hidden animate-in zoom-in-95">
                {/* Result Title & Special Event Announcements */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2 shrink-0">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-white">本局比牌结算结果</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-extrabold ${
                          (settlement.scores['player_me'] || 0) > 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {(settlement.scores['player_me'] || 0) > 0
                          ? `+${settlement.scores['player_me']} 水 获胜！🎉`
                          : `${settlement.scores['player_me']} 水`}
                      </span>

                      {/* Tab toggles */}
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => setSettlementTab('all_duns')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            settlementTab === 'all_duns'
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          三墩全览
                        </button>
                        <button
                          onClick={() => setSettlementTab('matches')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            settlementTab === 'matches'
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          对战明细
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gunshot / Grand Slam Announcements */}
                  {settlement.grandSlamPlayerId && (
                    <div className="mt-1 px-2 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 font-extrabold text-[11px] flex items-center justify-center gap-1 animate-pulse">
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>👑 【全垒打】玩家 [{settlement.grandSlamPlayerName}] 通杀全场！分数翻倍！</span>
                    </div>
                  )}

                  {settlement.gunShots && settlement.gunShots.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {settlement.gunShots.map((g, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-0.5 bg-rose-950/80 border border-rose-500/50 rounded-md text-[10px] text-rose-300 font-bold flex items-center gap-1"
                        >
                          <span>🔫 打枪：</span>
                          <span className="text-white">[{g.shooterName}]</span>
                          <span>➔</span>
                          <span className="text-rose-200">[{g.targetName}]</span>
                          <span className="text-amber-400 font-mono">(×2翻倍)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tab 1: All Players' 3 Duns Overview */}
                {settlementTab === 'all_duns' && (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
                    {activeParticipants.map((p) => {
                      const netScore = settlement.scores[p.id] || 0;
                      const isMe = p.id === 'player_me';
                      const hEval = evaluateDun(p.arrangement.head, true);
                      const mEval = evaluateDun(p.arrangement.middle, false);
                      const tEval = evaluateDun(p.arrangement.tail, false);

                      return (
                        <div
                          key={p.id}
                          className={`p-1.5 rounded-xl border transition-all ${
                            isMe
                              ? 'bg-amber-500/10 border-amber-400/60'
                              : 'bg-slate-900/90 border-slate-800'
                          }`}
                        >
                          {/* Row Header */}
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{p.avatar}</span>
                              <span className={`font-bold ${isMe ? 'text-amber-300' : 'text-slate-200'}`}>
                                {p.name}
                              </span>
                              {p.arrangement.isDaoPai && (
                                <span className="px-1 py-0.2 rounded bg-rose-500 text-white text-[9px] font-bold">
                                  倒牌违规
                                </span>
                              )}
                            </div>
                            <span
                              className={`font-mono font-extrabold text-xs ${
                                netScore > 0 ? 'text-emerald-400' : netScore < 0 ? 'text-rose-400' : 'text-slate-400'
                              }`}
                            >
                              {netScore > 0 ? `+${netScore} 水` : `${netScore} 水`}
                            </span>
                          </div>

                          {/* 3 Duns Card Rows in compact strip */}
                          <div className="grid grid-cols-3 gap-1">
                            {/* Head */}
                            <div className="bg-slate-950/80 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                              <div className="text-[9px] font-bold text-sky-400 truncate w-full text-center">
                                前: {hEval.typeName}
                              </div>
                              <div className="flex -space-x-7 py-0.5">
                                {p.arrangement.head.map((c) => (
                                  <CardItem key={c.id} card={c} size="sm" />
                                ))}
                              </div>
                            </div>

                            {/* Middle */}
                            <div className="bg-slate-950/80 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                              <div className="text-[9px] font-bold text-blue-400 truncate w-full text-center">
                                中: {mEval.typeName}
                              </div>
                              <div className="flex -space-x-7 py-0.5">
                                {p.arrangement.middle.map((c) => (
                                  <CardItem key={c.id} card={c} size="sm" />
                                ))}
                              </div>
                            </div>

                            {/* Tail */}
                            <div className="bg-slate-950/80 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                              <div className="text-[9px] font-bold text-purple-400 truncate w-full text-center">
                                后: {tEval.typeName}
                              </div>
                              <div className="flex -space-x-7 py-0.5">
                                {p.arrangement.tail.map((c) => (
                                  <CardItem key={c.id} card={c} size="sm" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Pairwise Matchup Ledger */}
                {settlementTab === 'matches' && (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
                    {settlement.pairMatches.map((m, idx) => {
                      const p1 = players.find((p) => p.id === m.p1Id);
                      const p2 = players.find((p) => p.id === m.p2Id);
                      const isMeMatch = m.p1Id === 'player_me' || m.p2Id === 'player_me';

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                            isMeMatch
                              ? 'bg-indigo-950/40 border-indigo-500/50'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-[90px]">
                            <span>{p1?.avatar}</span>
                            <span className="font-bold text-slate-200 truncate">{p1?.name}</span>
                          </div>

                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              <span className={m.headWinner === m.p1Id ? 'text-emerald-400' : 'text-slate-500'}>前</span>
                              <span>·</span>
                              <span className={m.middleWinner === m.p1Id ? 'text-emerald-400' : 'text-slate-500'}>中</span>
                              <span>·</span>
                              <span className={m.tailWinner === m.p1Id ? 'text-emerald-400' : 'text-slate-500'}>后</span>
                            </div>
                            {m.isGunShot && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-600/40 text-rose-300 font-bold">
                                🔫 打枪
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
                            <span className="font-bold text-slate-200 truncate">{p2?.name}</span>
                            <span>{p2?.avatar}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Restart Button */}
                <button
                  onClick={startNewRound}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>再战一局 (开始第 {roundNumber + 1} 局)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3.5. QUICK ARRANGE HELPER BAR (Reset, Sort Toggle, Live DaoPai Warning) */}
      {!isShowdownPhase && (
        <div className="w-full max-w-lg mx-auto px-2 py-0.5 flex items-center justify-between gap-1 text-[11px] z-30 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* 一键复位 */}
            <button
              type="button"
              onClick={handleResetToBestHand}
              className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
              title="一键恢复推荐的最佳顺牌组合"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>一键复位</span>
            </button>

            {/* 点数/花色排序 */}
            <button
              type="button"
              onClick={handleToggleCardSort}
              className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
              title={sortBySuit ? '当前按花色排列，点击按点数大小排列' : '当前按点数大小排列，点击按花色排列'}
            >
              <span className="font-bold text-amber-400">⇅</span>
              <span>{sortBySuit ? '花色序' : '点数序'}</span>
            </button>
          </div>

          {/* Live DaoPai / Valid Indicator */}
          {headCards.length === 3 && midCards.length === 5 && tailCards.length === 5 ? (
            (() => {
              const daoCheck = validateDaoPai(headCards, midCards, tailCards);
              return daoCheck.isDaoPai ? (
                <div className="flex items-center gap-1 text-rose-300 font-bold px-2 py-0.5 bg-rose-950/90 border border-rose-500/80 rounded-lg animate-pulse truncate max-w-[210px] shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">⚠️ 倒水警示</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-300 font-bold px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/80 rounded-lg truncate shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>牌型合规 (无倒水)</span>
                </div>
              );
            })()
          ) : (
            <div className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
              已放置: <span className="text-amber-400 font-bold">{headCards.length + midCards.length + tailCards.length}</span>/13张
            </div>
          )}
        </div>
      )}

      {/* 4. CLEAN BOTTOM ACTIONS (DUAL BUTTONS + AUTO HOSTING TOGGLE) */}
      {!isShowdownPhase && (
        <footer className="w-full max-w-lg mx-auto p-2 bg-[#0F172A] border-t border-slate-800/80 flex items-center gap-2 z-30 shrink-0 shadow-lg">
          {/* Button 0: 自动理牌 / 托管切换 */}
          <button
            type="button"
            onClick={() => {
              const nextHosting = !isHosting;
              setIsHosting(nextHosting);
              if (nextHosting) {
                handleSendMessage('🤖 我开启了自动托管理牌模式！');
              }
            }}
            className={`py-2.5 px-3 border font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 shrink-0 ${
              isHosting
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold ring-2 ring-amber-400/40'
                : 'bg-[#0B1120] hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={isHosting ? '点击取消托管' : '点击开启自动理牌托管'}
          >
            <Bot className={`w-4 h-4 ${isHosting ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>{isHosting ? '托管中' : '自动理牌'}</span>
          </button>

          {/* Button 1: 变换牌型 (Cycle combinations) */}
          <button
            onClick={handleCycleSmartHand}
            className="flex-1 py-2.5 px-3 bg-[#0B1120] hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-400 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
            title="一键循环切换推荐的最佳牌型"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>变换牌型</span>
          </button>

          {/* Button 2: 提交牌型 (Checks strictly 3/5/5 upon click) */}
          <button
            onClick={handleSubmitHand}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>提交牌型 (3/5/5)</span>
          </button>
        </footer>
      )}

      {/* 5. POPUP MODAL: ALL PLAYERS AVATAR & NAME */}
      {showPlayersModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
          onClick={() => setShowPlayersModal(false)}
        >
          <div
            className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3 cursor-default animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">
                  房间玩家列表 ({activePlayerCount}人)
                </span>
              </div>
              <button
                onClick={() => setShowPlayersModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {activeParticipants.map((p, idx) => {
                const isMe = p.id === 'player_me';
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isMe
                        ? 'bg-amber-500/15 border-amber-400/50 shadow-xs'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="text-2xl w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shadow-xs shrink-0">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white truncate">{p.name}</span>
                        {isMe && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-bold shrink-0">
                            我
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.isAi ? '电脑玩家' : '在线玩家'} · 席位{idx + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowPlayersModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 6. POPUP MODAL: DAO-PAI (倒牌) CONFIRMATION MODAL */}
      {showDaoPaiModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowDaoPaiModal(false)}
        >
          <div
            className="bg-[#0F172A] border-2 border-amber-500/80 rounded-2xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white">检测到牌型倒牌（违规）</span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
              <p className="font-bold text-amber-300 mb-1">⚠️ 规则提示：</p>
              <p className="text-slate-200 mb-2">{daoPaiReason}</p>
              <p className="text-slate-400 text-[11px]">
                十三水规则规定：前墩牌型不能大于中墩，中墩不能大于后墩。若确认提交倒牌将直接判负并扣除罚水！
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => {
                  const best = smartOptions[0];
                  if (best) {
                    setHeadCards(best.head);
                    setMidCards(best.middle);
                    setTailCards(best.tail);
                    executeSubmitShowdown(best.head, best.middle, best.tail, false);
                  } else {
                    setShowDaoPaiModal(false);
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>一键使用智能推荐理牌 (推荐)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDaoPaiModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  返回调整
                </button>
                <button
                  onClick={() => {
                    executeSubmitShowdown(headCards, midCards, tailCards, true, daoPaiReason);
                  }}
                  className="flex-1 py-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  仍要提交倒牌
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ULTRA-COMPACT BOTTOM-SHEET INTERACTIVE CHAT & VOICE RECORDER DRAWER */}
      {showChatDrawer && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in cursor-pointer"
          onClick={() => {
            if (isRecording) stopRecording();
            setShowChatDrawer(false);
          }}
        >
          <div
            className="bg-[#0F172A] border-t border-slate-700 rounded-t-3xl max-w-lg mx-auto w-full p-3 shadow-2xl flex flex-col gap-2 cursor-default animate-in slide-in-from-bottom-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title + Return Button */}
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

            {/* Quick Preset Voice Clips */}
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

            {/* 8 Emojis Bar */}
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

            {/* Quick Phrases Grid */}
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

      {/* 8. POINTS MANAGEMENT & MUTUAL TRANSFER MODAL */}
      <PointsManagementModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        currentUser={currentUser}
        onUserChange={(updated) => {
          setCurrentUser(updated);
          if (onUpdateUser) onUpdateUser(updated);
        }}
      />

      {/* 9. MATCH HISTORY & FULL REPLAY MODAL */}
      <MatchHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* 10. BANKRUPTCY BONUS MODAL */}
      {showBankruptcyBonus && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowBankruptcyBonus(false)}
        >
          <div
            className="bg-[#0F172A] border-2 border-amber-400/90 rounded-3xl max-w-xs w-full p-5 shadow-2xl flex flex-col items-center gap-3 text-center animate-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
              🎁
            </div>
            <h4 className="font-extrabold text-base text-white">破产补助水数到账！</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              您的积分水数偏低，组委会为您发放了 <strong className="text-amber-400 font-mono">+1,000</strong> 竞技鼓励水数，祝您下局大展神威！
            </p>
            <button
              onClick={() => {
                const updated = addChips(1000);
                setCurrentUser(updated);
                if (onUpdateUser) onUpdateUser(updated);
                setShowBankruptcyBonus(false);
                SoundEffects.playFanfare();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-md cursor-pointer active:scale-95"
            >
              🎉 开心收下 (+1,000 水)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
