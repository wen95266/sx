/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameLobby } from './components/GameLobby';
import { GameTable } from './components/GameTable';
import { AuthModal } from './components/AuthModal';
import { BotConfigGuideModal } from './components/BotConfigGuideModal';
import { LobbyRoom } from './types/game';
import { getStoredUser, UserProfile, getMatchSession, clearMatchSession } from './utils/authStorage';

export type GameTheme = 'deep-green' | 'lake-blue';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(!getStoredUser().isLoggedIn);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);

  // Global luxury theme: 'deep-green' (墨玉深绿) | 'lake-blue' (琉璃湖蓝)
  const [theme, setTheme] = useState<GameTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thirteen_poker_theme');
      if (saved === 'deep-green' || saved === 'lake-blue') return saved;
    }
    return 'deep-green';
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next: GameTheme = prev === 'deep-green' ? 'lake-blue' : 'deep-green';
      if (typeof window !== 'undefined') {
        localStorage.setItem('thirteen_poker_theme', next);
      }
      return next;
    });
  };

  // Auto-detect existing match session for instant disconnection recovery
  const existingSession = getMatchSession();
  const [gameViewMode, setGameViewMode] = useState<'lobby' | 'table'>(
    existingSession && getStoredUser().isLoggedIn ? 'table' : 'lobby'
  );
  const [selectedRoom, setSelectedRoom] = useState<LobbyRoom | null>(
    existingSession?.room || null
  );
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number>(0);

  // Auto-detect private room parameter from URL (?room=6688)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && /^\d{4}$/.test(roomParam)) {
        const privateRoom: LobbyRoom = {
          id: `private_${roomParam}`,
          name: `🔐 好友私密房 #${roomParam}`,
          type: 'realtime',
          baseScore: 50,
          minChips: 250,
          playersCount: 1,
          maxPlayers: 4,
          deckCount: 1,
          creatorName: '邀请好友',
          status: 'waiting',
          allowChat: true,
          tag: `私密房 · 房号${roomParam}`,
          description: `通过好友专属分享链接直接加入的私密房间 #${roomParam}。`
        };
        setSelectedRoom(privateRoom);
        if (getStoredUser().isLoggedIn) {
          setGameViewMode('table');
        }
      }
    }
  }, []);

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col font-sans select-none transition-colors duration-300 theme-${theme} ${
        theme === 'deep-green'
          ? 'bg-[#03150e]'
          : 'bg-[#02161f]'
      }`}
      style={{
        backgroundImage:
          theme === 'deep-green'
            ? 'radial-gradient(circle at 50% 15%, #0a3827 0%, #052319 45%, #02120b 100%)'
            : 'radial-gradient(circle at 50% 15%, #094054 0%, #052938 45%, #02141c 100%)'
      }}
    >
      {gameViewMode === 'lobby' ? (
        <GameLobby
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onEnterRoom={(room, seatIdx) => {
            setSelectedRoom(room);
            setSelectedSeatIndex(seatIdx ?? 0);
            setGameViewMode('table');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenBotGuide={() => setShowBotGuideModal(true)}
          onUpdateUser={(u) => setCurrentUser(u)}
        />
      ) : (
        <GameTable
          currentRoom={selectedRoom || undefined}
          targetSeatIndex={selectedSeatIndex}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onBackToLobby={() => {
            clearMatchSession();
            setGameViewMode('lobby');
          }}
          onUpdateUser={(u) => setCurrentUser(u)}
        />
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
}
