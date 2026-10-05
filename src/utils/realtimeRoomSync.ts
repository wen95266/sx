import { Player, LobbyRoom, Card, GamePhase, SpeechBubble, EmojiReaction, SettlementSummary } from '../types/game';
import { sortCards, createDeck, shuffleDeck, calculateSmartArrangements, calculateGameSettlement, evaluateDun } from './cardLogic';

export interface SyncedPlayer {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  isAi: boolean;
  seatIndex: number;
  totalScore: number;
  roundScore: number;
  isReady: boolean;
  isSubmitted: boolean;
  cards: Card[];
  arrangement: {
    head: Card[];
    middle: Card[];
    tail: Card[];
    isDaoPai: boolean;
  };
  lastSeen: number;
}

export interface SyncedRoomState {
  roomId: string;
  maxPlayers: number;
  activePlayerCount: number;
  realPlayersCount: number;
  roundNumber: number;
  phase: GamePhase;
  countdown: number;
  players: SyncedPlayer[];
  chatBubbles: SpeechBubble[];
  reactions: EmojiReaction[];
  settlement: SettlementSummary | null;
  lastUpdated: number;
}

const DEFAULT_BOTS_4 = [
  { id: 'bot_zhiduoxing', name: '智多星', avatar: '🤖' },
  { id: 'bot_dongfang', name: '东方雀圣', avatar: '🧙' },
  { id: 'bot_ximen', name: '西门吹水', avatar: '🐉' },
  { id: 'bot_beiming', name: '北冥神手', avatar: '🥷' }
];

const DEFAULT_BOTS_8 = [
  { id: 'bot_zhiduoxing', name: '智多星', avatar: '🤖' },
  { id: 'bot_dongfang', name: '东方雀圣', avatar: '🧙' },
  { id: 'bot_ximen', name: '西门吹水', avatar: '🐉' },
  { id: 'bot_beiming', name: '北冥神手', avatar: '🥷' },
  { id: 'bot_quewang', name: '雀王争霸', avatar: '🦁' },
  { id: 'bot_shisan', name: '十三太保', avatar: '🐲' },
  { id: 'bot_dugu', name: '独孤求胜', avatar: '🦹' },
  { id: 'bot_jiutian', name: '九天玄女', avatar: '👧' }
];

// Memory cache on server/client side for instant sync
const roomStatesInMemory: Record<string, SyncedRoomState> = {};

// Helper to fill remaining seats with AI bots
export function getFilledRoomPlayers(roomId: string, maxPlayers: number, realPlayers: SyncedPlayer[]): SyncedPlayer[] {
  const botsPool = maxPlayers === 8 ? DEFAULT_BOTS_8 : DEFAULT_BOTS_4;
  const filled: SyncedPlayer[] = [];

  // Place real players in order
  for (let i = 0; i < maxPlayers; i++) {
    if (i < realPlayers.length) {
      filled.push({
        ...realPlayers[i],
        seatIndex: i,
        isAi: false
      });
    } else {
      const botTemplate = botsPool[(i - realPlayers.length) % botsPool.length];
      filled.push({
        id: `bot_${roomId}_seat${i}`,
        name: botTemplate.name,
        avatar: botTemplate.avatar,
        isAi: true,
        seatIndex: i,
        totalScore: 0,
        roundScore: 0,
        isReady: true,
        isSubmitted: true,
        cards: [],
        arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
        lastSeen: Date.now()
      });
    }
  }

  return filled;
}

// Client API: Sync with Server or BroadcastChannel
export async function syncRoomStateApi(payload: {
  roomId: string;
  maxPlayers: number;
  userId: string;
  nickname: string;
  avatar: string;
  phone?: string;
  isSubmitted?: boolean;
  arrangement?: { head: Card[]; middle: Card[]; tail: Card[]; isDaoPai: boolean };
  action?: 'join' | 'leave' | 'submit' | 'heartbeat' | 'nextRound';
}): Promise<SyncedRoomState> {
  const { roomId, maxPlayers, userId, nickname, avatar, phone, isSubmitted, arrangement, action } = payload;

  try {
    const res = await fetch('/api/room/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const state: SyncedRoomState = await res.json();
      return state;
    }
  } catch (err) {
    console.warn('[RealtimeSync] Server endpoint fallback to local sync:', err);
  }

  // Fallback to local BroadcastChannel/localStorage sync
  return syncRoomLocally(payload);
}

// Send chat/emoji action to room
export async function sendRoomChatApi(payload: {
  roomId: string;
  senderId: string;
  senderName: string;
  text?: string;
  type?: 'text' | 'voice' | 'emoji';
  audioBlobUrl?: string;
  duration?: number;
}): Promise<void> {
  try {
    await fetch('/api/room/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Broadcast locally
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('shisanshui_room_channel');
      bc.postMessage({ type: 'CHAT', payload });
      bc.close();
    }
  }
}

// Local Sync Engine using LocalStorage + BroadcastChannel for fallback
function syncRoomLocally(payload: {
  roomId: string;
  maxPlayers: number;
  userId: string;
  nickname: string;
  avatar: string;
  phone?: string;
  isSubmitted?: boolean;
  arrangement?: { head: Card[]; middle: Card[]; tail: Card[]; isDaoPai: boolean };
  action?: 'join' | 'leave' | 'submit' | 'heartbeat' | 'nextRound';
}): SyncedRoomState {
  const { roomId, maxPlayers, userId, nickname, avatar, phone, isSubmitted, arrangement, action } = payload;
  const storageKey = `shisanshui_synced_room_${roomId}`;

  let currentRoom: SyncedRoomState;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      currentRoom = JSON.parse(raw);
    } else {
      currentRoom = createNewSyncedRoomState(roomId, maxPlayers);
    }
  } catch (e) {
    currentRoom = createNewSyncedRoomState(roomId, maxPlayers);
  }

  // Filter out offline players (no heartbeat in 15 seconds)
  const now = Date.now();
  let realPlayers = (currentRoom.players || []).filter(
    (p) => !p.isAi && p.id !== userId && now - p.lastSeen < 15000
  );

  if (action !== 'leave') {
    // Add/Update current user
    const mePlayer: SyncedPlayer = {
      id: userId,
      name: nickname,
      avatar: avatar,
      phone: phone,
      isAi: false,
      seatIndex: 0,
      totalScore: 0,
      roundScore: 0,
      isReady: true,
      isSubmitted: isSubmitted || false,
      cards: [],
      arrangement: arrangement || { head: [], middle: [], tail: [], isDaoPai: false },
      lastSeen: now
    };

    const existingIdx = realPlayers.findIndex((p) => p.id === userId);
    if (existingIdx >= 0) {
      realPlayers[existingIdx] = { ...realPlayers[existingIdx], ...mePlayer, lastSeen: now };
    } else {
      realPlayers.push(mePlayer);
    }
  }

  // Cap real players to maxPlayers
  realPlayers = realPlayers.slice(0, maxPlayers);

  // Fill empty seats with bots ("真人优先，人机补位")
  const fullPlayers = getFilledRoomPlayers(roomId, maxPlayers, realPlayers);

  currentRoom.players = fullPlayers;
  currentRoom.realPlayersCount = realPlayers.length;
  currentRoom.lastUpdated = now;

  try {
    localStorage.setItem(storageKey, JSON.stringify(currentRoom));
  } catch (e) {}

  return currentRoom;
}

function createNewSyncedRoomState(roomId: string, maxPlayers: number): SyncedRoomState {
  return {
    roomId,
    maxPlayers,
    activePlayerCount: maxPlayers,
    realPlayersCount: 1,
    roundNumber: 1,
    phase: 'ARRANGING',
    countdown: 30,
    players: [],
    chatBubbles: [],
    reactions: [],
    settlement: null,
    lastUpdated: Date.now()
  };
}
