import { Player, LobbyRoom, Card, GamePhase, SpeechBubble, EmojiReaction, SettlementSummary } from '../types/game';
import { sortCards, createDeck, shuffleDeck, calculateSmartArrangements, calculateGameSettlement, evaluateDun } from './cardLogic';

export interface SyncedPlayer {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  isAi: boolean;
  isHost?: boolean;
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
  hostUserId?: string;
  roundNumber: number;
  phase: GamePhase;
  countdown: number;
  seats: (SyncedPlayer | null)[];
  players: SyncedPlayer[];
  chatBubbles: SpeechBubble[];
  reactions: EmojiReaction[];
  settlement: SettlementSummary | null;
  lastUpdated: number;
}

// Client API: Sync with Server or BroadcastChannel
export async function syncRoomStateApi(payload: {
  roomId: string;
  maxPlayers: number;
  userId: string;
  nickname: string;
  avatar: string;
  phone?: string;
  targetSeatIndex?: number;
  isSubmitted?: boolean;
  arrangement?: { head: Card[]; middle: Card[]; tail: Card[]; isDaoPai: boolean };
  action?: 'join' | 'leave' | 'submit' | 'heartbeat' | 'nextRound' | 'dealCards';
  dealtCardsMap?: Record<string, Card[]>;
}): Promise<SyncedRoomState> {
  try {
    const res = await fetch('/api/room/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const state: SyncedRoomState = await res.json();
      // Keep players property populated for backward compatibility
      if (!state.players && state.seats) {
        state.players = state.seats.filter((s): s is SyncedPlayer => s !== null);
      }
      return state;
    }
  } catch (err) {
    console.warn('[RealtimeSync] Server endpoint fallback to local sync:', err);
  }

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
  targetSeatIndex?: number;
  isSubmitted?: boolean;
  arrangement?: { head: Card[]; middle: Card[]; tail: Card[]; isDaoPai: boolean };
  action?: 'join' | 'leave' | 'submit' | 'heartbeat' | 'nextRound' | 'dealCards';
  dealtCardsMap?: Record<string, Card[]>;
}): SyncedRoomState {
  const { roomId, maxPlayers, userId, nickname, avatar, phone, targetSeatIndex, isSubmitted, arrangement, action, dealtCardsMap } = payload;
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

  if (!currentRoom.seats || currentRoom.seats.length !== maxPlayers) {
    currentRoom.seats = Array(maxPlayers).fill(null);
  }

  const now = Date.now();

  // Clean offline seats
  for (let i = 0; i < maxPlayers; i++) {
    if (currentRoom.seats[i] && now - currentRoom.seats[i]!.lastSeen > 15000) {
      currentRoom.seats[i] = null;
    }
  }

  if (action === 'leave' && userId) {
    for (let i = 0; i < maxPlayers; i++) {
      if (currentRoom.seats[i]?.id === userId) {
        currentRoom.seats[i] = null;
      }
    }
  } else if (userId) {
    let seatIdx = currentRoom.seats.findIndex((s) => s && s.id === userId);
    if (seatIdx === -1 && typeof targetSeatIndex === 'number' && targetSeatIndex >= 0 && targetSeatIndex < maxPlayers) {
      if (!currentRoom.seats[targetSeatIndex]) {
        seatIdx = targetSeatIndex;
      }
    }
    if (seatIdx === -1 && action === 'join') {
      seatIdx = currentRoom.seats.findIndex((s) => s === null);
    }

    if (seatIdx !== -1) {
      const existing = currentRoom.seats[seatIdx];
      currentRoom.seats[seatIdx] = {
        id: userId,
        name: nickname || '玩家',
        avatar: avatar || '😎',
        phone,
        isAi: false,
        seatIndex: seatIdx,
        totalScore: 0,
        roundScore: 0,
        isReady: true,
        isSubmitted: isSubmitted ?? existing?.isSubmitted ?? false,
        cards: dealtCardsMap?.[userId] || existing?.cards || [],
        arrangement: arrangement || existing?.arrangement || { head: [], middle: [], tail: [], isDaoPai: false },
        lastSeen: now
      };
    }
  }

  const activeSeats = currentRoom.seats.filter((s): s is SyncedPlayer => s !== null);
  currentRoom.realPlayersCount = activeSeats.length;
  currentRoom.players = activeSeats;

  // Host assignment
  if (activeSeats.length > 0) {
    const currentHost = activeSeats.find((s) => s.isHost);
    const hostId = currentHost ? currentHost.id : activeSeats[0].id;
    currentRoom.hostUserId = hostId;
    for (let i = 0; i < maxPlayers; i++) {
      if (currentRoom.seats[i]) {
        currentRoom.seats[i]!.isHost = currentRoom.seats[i]!.id === hostId;
      }
    }
  }

  if (activeSeats.length < 2) {
    currentRoom.phase = 'WAITING';
  } else if (action === 'dealCards') {
    currentRoom.phase = 'ARRANGING';
    if (dealtCardsMap) {
      for (let i = 0; i < maxPlayers; i++) {
        if (currentRoom.seats[i] && dealtCardsMap[currentRoom.seats[i]!.id]) {
          currentRoom.seats[i]!.cards = dealtCardsMap[currentRoom.seats[i]!.id];
          currentRoom.seats[i]!.isSubmitted = false;
        }
      }
    }
  }

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
    realPlayersCount: 0,
    roundNumber: 1,
    phase: 'WAITING',
    countdown: 30,
    seats: Array(maxPlayers).fill(null),
    players: [],
    chatBubbles: [],
    reactions: [],
    settlement: null,
    lastUpdated: Date.now()
  };
}
