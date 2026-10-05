import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Maximize2,
  Sparkles,
  Layers,
  Palette,
  Eye
} from 'lucide-react';
import { GameLobby } from './GameLobby';
import { LobbyRoom } from '../types/game';
import { getStoredUser, UserProfile } from '../utils/authStorage';
import { AuthModal } from './AuthModal';
import { BotConfigGuideModal } from './BotConfigGuideModal';

interface WebClientPreviewProps {
  onOpenGame?: () => void;
  onToggleStandalonePlayerMode?: () => void;
}

export const WebClientPreview: React.FC<WebClientPreviewProps> = ({
  onToggleStandalonePlayerMode
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile' | 'full'>('desktop');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);
  const [selectedRoomTip, setSelectedRoomTip] = useState<string | null>(null);

  const handleEnterRoomPreview = (room: LobbyRoom) => {
    setSelectedRoomTip(`已选中房间：[${room.name}] (底分: ${room.baseScore}水 | 准入: ${room.minChips}水 | 类型: ${room.type === 'realtime' ? '🔥实时场' : '📅预约场'})`);
    setTimeout(() => setSelectedRoomTip(null), 3500);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* Lobby Design Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              <span>游戏大厅预览与样式设计模式</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                专用于大厅排版布局
              </span>
            </h2>
          </div>
        </div>

        {/* Viewport & Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>宽屏桌面</span>
            </button>

            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>移动端手机</span>
            </button>

            <button
              onClick={() => setDeviceMode('full')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                deviceMode === 'full'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>全宽自适应</span>
            </button>
          </div>

          {onToggleStandalonePlayerMode && (
            <button
              onClick={onToggleStandalonePlayerMode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="切换为1:1纯净独立玩家全屏模式"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">纯净全屏</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Room Feedback Notification */}
      {selectedRoomTip && (
        <div className="px-4 pt-2">
          <div className="max-w-6xl mx-auto p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{selectedRoomTip}</span>
          </div>
        </div>
      )}

      {/* Main Container Rendering Game Lobby */}
      <div className="flex-1 flex flex-col items-center justify-start p-2 md:p-6 overflow-y-auto">
        {deviceMode === 'mobile' ? (
          /* Phone Frame Container */
          <div className="w-full max-w-[430px] bg-slate-900 border-4 border-slate-700 rounded-[42px] p-3 shadow-2xl relative flex flex-col my-auto overflow-hidden">
            {/* Phone Notch & Speaker */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Mobile Game Lobby Viewport */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 flex flex-col h-[700px] shadow-inner">
              <GameLobby
                currentUser={currentUser}
                onEnterRoom={handleEnterRoomPreview}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenBotGuide={() => setShowBotGuideModal(true)}
                onUpdateUser={(u) => setCurrentUser(u)}
              />
            </div>

            {/* Phone Home Bar */}
            <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
          </div>
        ) : deviceMode === 'desktop' ? (
          /* Desktop Browser Window Frame */
          <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-0.5 rounded-lg border border-slate-800">
                十三水多人对战大厅 (桌面端布局)
              </div>
              <div className="text-[11px] text-amber-400 font-bold">
                {currentUser.chips.toLocaleString()} 水
              </div>
            </div>

            {/* Desktop Game Lobby */}
            <div className="min-h-[640px] flex flex-col bg-slate-950">
              <GameLobby
                currentUser={currentUser}
                onEnterRoom={handleEnterRoomPreview}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenBotGuide={() => setShowBotGuideModal(true)}
                onUpdateUser={(u) => setCurrentUser(u)}
              />
            </div>
          </div>
        ) : (
          /* Full Width Clean Layout */
          <div className="w-full flex-1 flex flex-col bg-slate-950">
            <GameLobby
              currentUser={currentUser}
              onEnterRoom={handleEnterRoomPreview}
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenBotGuide={() => setShowBotGuideModal(true)}
              onUpdateUser={(u) => setCurrentUser(u)}
            />
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUserChange={(updated) => setCurrentUser(updated)}
      />

      {/* Bot Config Guide Modal */}
      <BotConfigGuideModal
        isOpen={showBotGuideModal}
        onClose={() => setShowBotGuideModal(false)}
      />
    </div>
  );
};
