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

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(!getStoredUser().isLoggedIn);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);

  // Auto-detect existing match session for instant disconnection recovery
  const existingSession = getMatchSession();
  const [gameViewMode, setGameViewMode] = useState<'lobby' | 'table'>(
    existingSession && getStoredUser().isLoggedIn ? 'table' : 'lobby'
  );
  const [selectedRoom, setSelectedRoom] = useState<LobbyRoom | null>(
    existingSession?.room || null
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {gameViewMode === 'lobby' ? (
        <GameLobby
          currentUser={currentUser}
          onEnterRoom={(room) => {
            setSelectedRoom(room);
            setGameViewMode('table');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenBotGuide={() => setShowBotGuideModal(true)}
          onUpdateUser={(u) => setCurrentUser(u)}
        />
      ) : (
        <GameTable
          currentRoom={selectedRoom || undefined}
          onBackToLobby={() => {
            clearMatchSession();
            setGameViewMode('lobby');
          }}
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
