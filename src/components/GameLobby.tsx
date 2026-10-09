import React, { useState } from 'react';
import {
  Calendar,
  Zap,
  Flame,
  Coins,
  Gift,
  Key,
  Wallet,
  Play,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  MessageSquareOff,
  RotateCcw,
  Check,
  X,
  Crown,
  Users,
  LogOut,
  Trophy,
  Sparkles,
  History,
  PlusCircle
} from 'lucide-react';
import { LobbyRoom } from '../types/game';
import { UserProfile, addChips, logoutUser } from '../utils/authStorage';
import { SoundEffects } from '../utils/audio';
import { PointsManagementModal } from './PointsManagementModal';
import { PWAInstallButton } from './PWAInstallButton';
import { PrivateRoomModal } from './PrivateRoomModal';
import { MatchHistoryModal } from './MatchHistoryModal';

interface GameLobbyProps {
  currentUser: UserProfile;
  theme?: 'deep-green' | 'lake-blue';
  onToggleTheme?: () => void;
  onEnterRoom: (room: LobbyRoom, targetSeatIndex?: number) => void;
  onOpenAuth: () => void;
  onOpenBotGuide?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

// 1. 四人实时场 (1副牌 52张)
const ROOM_REALTIME_4: LobbyRoom = {
  id: 'room_realtime_4',
  name: '🔥 四人实时场',
  type: 'realtime',
  baseScore: 50,
  minChips: 500,
  playersCount: 3,
  maxPlayers: 4,
  deckCount: 1,
  creatorName: '系统快配',
  status: 'waiting',
  allowChat: true,
  tag: '1副牌 52张 · 经典4人',
  description: '经典4人快局，1副52张扑克，每人13张，随时秒开局！'
};

// 2. 八人实时场 (2副牌 104张)
const ROOM_REALTIME_8: LobbyRoom = {
  id: 'room_realtime_8',
  name: '👑 八人实时场',
  type: 'realtime',
  baseScore: 50,
  minChips: 1000,
  playersCount: 7,
  maxPlayers: 8,
  deckCount: 2,
  creatorName: '系统快配',
  status: 'waiting',
  allowChat: true,
  tag: '2副牌 104张 · 8人大桌双副',
  description: '8人盛大对战，使用2副扑克共104张，同花顺铁支频出，刺激翻倍！'
};

// 3. 四人预约场 (1副牌 52张)
const ROOM_SCHEDULED_4: LobbyRoom = {
  id: 'room_scheduled_4',
  name: '📅 四人预约场',
  type: 'scheduled',
  baseScore: 100,
  minChips: 1000,
  playersCount: 3,
  maxPlayers: 4,
  deckCount: 1,
  scheduledTime: '今晚 20:00',
  creatorName: '官方赛事官',
  status: 'booking',
  allowChat: false,
  tag: '1副牌 52张 · 今晚20:00',
  description: '席位预约准点发牌，全场纯净静音专注竞技！',
  bookedPlayers: [
    { name: '东方雀圣', avatar: '🧙', ready: true },
    { name: '西门吹水', avatar: '🤖', ready: true },
    { name: '北冥神手', avatar: '🥷', ready: true }
  ]
};

// 4. 八人预约场 (2副牌 104张)
const ROOM_SCHEDULED_8: LobbyRoom = {
  id: 'room_scheduled_8',
  name: '🏆 八人预约场',
  type: 'scheduled',
  baseScore: 200,
  minChips: 2000,
  playersCount: 7,
  maxPlayers: 8,
  deckCount: 2,
  scheduledTime: '今晚 20:30',
  creatorName: '黄金大师组委会',
  status: 'booking',
  allowChat: false,
  tag: '2副牌 104张 · 今晚20:30大师赛',
  description: '8人盛大黄金大师赛，2副扑克共104张，强强对决通杀全场！',
  bookedPlayers: [
    { name: '东方雀圣', avatar: '🧙', ready: true },
    { name: '西门吹水', avatar: '🤖', ready: true },
    { name: '北冥神手', avatar: '🥷', ready: true },
    { name: '雀王争霸', avatar: '🦁', ready: true },
    { name: '十三太保', avatar: '🐲', ready: true },
    { name: '独孤求胜', avatar: '🦹', ready: true },
    { name: '九天玄女', avatar: '👧', ready: true }
  ]
};

export const GameLobby: React.FC<GameLobbyProps> = ({
  currentUser,
  theme = 'deep-green',
  onToggleTheme,
  onEnterRoom,
  onOpenAuth,
  onUpdateUser
}) => {
  const isGreen = theme === 'deep-green';
  const [activeTab, setActiveTab] = useState<'realtime' | 'scheduled'>('realtime');
  const [showChipsModal, setShowChipsModal] = useState(false);
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastTip, setToastTip] = useState<string | null>(null);

  const handleClaimBonus = (amount = 1000) => {
    const updated = addChips(amount);
    if (onUpdateUser) onUpdateUser(updated);
    SoundEffects.playFanfare();
    setToastTip(`🎁 成功领取补助水数：+${amount.toLocaleString()} 水！`);
    setTimeout(() => setToastTip(null), 3000);
  };

  const handleResetChips = () => {
    const diff = 1000 - currentUser.chips;
    const updated = addChips(diff);
    if (onUpdateUser) onUpdateUser(updated);
    SoundEffects.playCardClick();
    setToastTip('✓ 积分已重置为 1,000 初始水数！');
    setTimeout(() => setToastTip(null), 3000);
  };

  const handleLogout = () => {
    const loggedOut = logoutUser();
    if (onUpdateUser) onUpdateUser(loggedOut);
    onOpenAuth();
  };

  const handleSelectRoom = (room: LobbyRoom, seatIndex = 0) => {
    if (!currentUser.isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (currentUser.chips < room.minChips) {
      const topUp = room.minChips - currentUser.chips + 500;
      const updated = addChips(topUp);
      if (onUpdateUser) onUpdateUser(updated);
      setToastTip(`⚠️ 筹码不足，已自动补发 +${topUp.toLocaleString()} 水！正在进入对战场 ${seatIndex + 1}号位...`);
      setTimeout(() => {
        setToastTip(null);
        onEnterRoom(room, seatIndex);
      }, 1000);
      return;
    }
    onEnterRoom(room, seatIndex);
  };

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full flex flex-col text-slate-100 select-none overflow-hidden justify-between transition-colors duration-300 ${
        isGreen ? 'bg-[#03170f]' : 'bg-[#021822]'
      }`}
    >
      {/* 顶部栏：左侧玩家档案 | 右侧主题切换、PWA安装、战绩复盘、私密房、积分管理 */}
      <header
        className={`border-b px-3 sm:px-6 py-2 shrink-0 z-40 shadow-md backdrop-blur-md transition-colors duration-300 ${
          isGreen
            ? 'bg-[#052317]/95 border-emerald-900/60 shadow-emerald-950/40'
            : 'bg-[#052838]/95 border-teal-900/60 shadow-cyan-950/40'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* 左上角：头像/昵称与登录/退出 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAuth}
              className={`relative text-2xl w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0 border-2 ${
                isGreen
                  ? 'bg-[#031810] border-amber-400/90 shadow-emerald-950'
                  : 'bg-[#021b25] border-amber-400/90 shadow-cyan-950'
              }`}
              title="点击查看玩家档案"
            >
              <span>{currentUser.avatar}</span>
              <span className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0.1 bg-amber-400 text-slate-950 font-extrabold rounded-full shadow">
                VIP
              </span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white leading-tight truncate max-w-[100px] sm:max-w-[150px]">
                  {currentUser.nickname}
                </span>
                {currentUser.phone && (
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    · {currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(-4)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                {currentUser.isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="px-2 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-[10px] sm:text-xs rounded-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="退出当前登录账号"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>退出登录</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[10px] sm:text-xs rounded-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Key className="w-3 h-3 text-slate-950" />
                    <span>注册 / 登录</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右上角功能区：主题切换 + 战绩复盘 + 自建私密房 + 积分管理 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🎨 主题切换按钮 (墨玉深绿 ↔ 琉璃湖蓝 1键切换) */}
            <button
              onClick={onToggleTheme}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer transition-all shadow-xs text-xs font-bold shrink-0 active:scale-95 ${
                isGreen
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/60 text-cyan-300'
              }`}
              title="一键切换全局主题风格 (墨玉深绿 / 琉璃湖蓝)"
            >
              <span className="text-xs">{isGreen ? '🀄' : '🌊'}</span>
              <span className="hidden sm:inline">{isGreen ? '墨玉深绿' : '琉璃湖蓝'}</span>
              <span className="sm:hidden">{isGreen ? '深绿' : '湖蓝'}</span>
            </button>

            {/* PWA 桌面安装按钮 */}
            <PWAInstallButton />

            {/* 战绩复盘按钮 */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className={`px-2 sm:px-2.5 py-1.5 border rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs text-xs font-bold shrink-0 ${
                isGreen
                  ? 'bg-[#082a1d] hover:bg-[#0c3928] border-emerald-800/80 text-emerald-200'
                  : 'bg-[#072f41] hover:bg-[#0b3e55] border-teal-800/80 text-teal-200'
              }`}
              title="查看战绩历史与牌局全景复盘"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">战绩复盘</span>
            </button>

            {/* 自建私密房按钮 */}
            <button
              onClick={() => {
                if (!currentUser.isLoggedIn) {
                  onOpenAuth();
                  return;
                }
                setShowPrivateRoomModal(true);
              }}
              className="px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs text-xs shrink-0 active:scale-95"
              title="自建好友私密房或输入房号加入"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>私密房</span>
            </button>

            {/* 积分管理 */}
            <button
              onClick={() => setShowChipsModal(true)}
              className={`px-2.5 sm:px-3 py-1.5 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md group shrink-0 ${
                isGreen ? 'bg-[#041a12] hover:bg-[#06241a]' : 'bg-[#031e2b] hover:bg-[#052b3d]'
              }`}
              title="点击查看积分管理、搜索手机号赠送积分"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Coins className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-[8px] sm:text-[9px] text-amber-300 font-medium leading-none">积分管理</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-amber-400 font-mono mt-0.5 leading-none">
                  {currentUser.chips.toLocaleString()} 水
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 提示条 */}
      {toastTip && (
        <div className="max-w-md mx-auto w-full px-3 py-1 z-30 shrink-0">
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-1.5 animate-in fade-in shadow-md">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{toastTip}</span>
          </div>
        </div>
      )}

      {/* 模式切换选项卡：实时对战 vs 预约赛事 (Segmented Control) */}
      <div className="max-w-4xl mx-auto w-full px-3 pt-2 shrink-0 z-20">
        <div
          className={`grid grid-cols-2 p-1 rounded-xl text-xs font-bold border transition-colors shadow-inner ${
            isGreen
              ? 'bg-[#041c12] border-emerald-900/80'
              : 'bg-[#03222e] border-teal-900/80'
          }`}
        >
          <button
            onClick={() => setActiveTab('realtime')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'realtime'
                ? isGreen
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                  : 'bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white shadow-md font-black ring-1 ring-cyan-400/50'
                : isGreen
                ? 'text-emerald-300/70 hover:text-emerald-100'
                : 'text-teal-300/70 hover:text-teal-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>实时场 (随时秒开)</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black ring-1 ring-amber-400/50'
                : isGreen
                ? 'text-emerald-300/70 hover:text-emerald-100'
                : 'text-teal-300/70 hover:text-teal-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>预约场 (定时开赛)</span>
          </button>
        </div>
      </div>

      {/* 主体核心：根据选项卡展示「四人场」与「八人场 (2副扑克)」 */}
      <main className="max-w-4xl mx-auto w-full px-3 py-2 flex-1 flex flex-col justify-around gap-2.5 overflow-hidden">
        {/* ================= TAB 1: 实时对战 (四人实时场 + 八人实时场) ================= */}
        {activeTab === 'realtime' && (
          <>
            {/* 卡片 1: 四人实时场 (1副牌 52张) */}
            <div
              className={`border-2 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1 ${
                isGreen
                  ? 'bg-gradient-to-br from-[#083524] via-[#052619] to-[#021810] border-emerald-600/70 hover:border-amber-400 shadow-emerald-950/40'
                  : 'bg-gradient-to-br from-[#083d52] via-[#052d3d] to-[#021a24] border-teal-500/70 hover:border-cyan-300 shadow-cyan-950/40'
              }`}
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl text-slate-950 shadow-md shrink-0 font-bold ${
                      isGreen ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 'bg-gradient-to-br from-cyan-400 to-teal-500'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>四人实时场</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        · 1副牌 52张
                      </span>
                    </h2>
                    <p className={`text-[10px] font-medium ${isGreen ? 'text-emerald-300/80' : 'text-teal-300/80'}`}>
                      经典4人对决 · 每人13张 · 极速比牌
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                    isGreen
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                  }`}
                >
                  3/4 人就绪
                </span>
              </div>

              {/* 参数信息 */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-extrabold text-amber-400 text-xs">50 水 / 道</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">准入筹码</div>
                  <div className="font-mono text-slate-200 text-xs">500 水</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-amber-300 text-xs">52 张单副</div>
                </div>
              </div>

              {/* 4人实时场 选座按钮区 */}
              <div className="space-y-1 mt-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 flex items-center justify-between">
                  <span>🪑 选择 1~4 号座位入座 (免盲进):</span>
                  <span className="text-[9px] text-amber-400/80 font-normal">首位入座自动为房主 👑</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((seatIdx) => (
                    <button
                      key={seatIdx}
                      type="button"
                      onClick={() => handleSelectRoom(ROOM_REALTIME_4, seatIdx)}
                      className={`p-1.5 border rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-md group ${
                        isGreen
                          ? 'bg-[#042015] hover:bg-[#073623] border-emerald-500/60 hover:border-amber-400 text-emerald-200'
                          : 'bg-[#042636] hover:bg-[#08415c] border-teal-500/60 hover:border-cyan-300 text-cyan-200'
                      }`}
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">🪑</span>
                      <span className="text-[10px] font-black">{seatIdx + 1}号位</span>
                      <span className="text-[9px] text-amber-300 font-mono">点击入座</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 卡片 2: 八人实时场 (2副牌 104张 特别刺激) */}
            <div
              className={`border-2 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1 ${
                isGreen
                  ? 'bg-gradient-to-br from-[#0c3e2b] via-[#072a1d] to-[#031b12] border-amber-500/60 hover:border-amber-400 shadow-emerald-950/40'
                  : 'bg-gradient-to-br from-[#0a465c] via-[#063142] to-[#03202b] border-cyan-500/60 hover:border-cyan-300 shadow-cyan-950/40'
              }`}
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-slate-950 shadow-md shrink-0 font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>八人实时场</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        · 🔥 2副牌 104张
                      </span>
                    </h2>
                    <p className={`text-[10px] font-medium ${isGreen ? 'text-amber-200/80' : 'text-cyan-200/80'}`}>
                      8人豪情同桌 · 2副扑克双副火拼 · 刺激翻倍
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                    isGreen
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  至少2真人开局
                </span>
              </div>

              {/* 参数信息 */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-extrabold text-amber-400 text-xs">50 水 / 道</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">准入筹码</div>
                  <div className="font-mono text-slate-200 text-xs">1,000 水</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-amber-300 text-xs">104 张两副</div>
                </div>
              </div>

              {/* 8人实时场 选座按钮区 */}
              <div className="space-y-1 mt-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 flex items-center justify-between">
                  <span>🪑 选择 1~8 号座位入座:</span>
                  <span className="text-[9px] text-amber-400/80 font-normal">首位入座自动为房主 👑</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((seatIdx) => (
                    <button
                      key={seatIdx}
                      type="button"
                      onClick={() => handleSelectRoom(ROOM_REALTIME_8, seatIdx)}
                      className={`p-1 border rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-md group ${
                        isGreen
                          ? 'bg-[#042015] hover:bg-[#073623] border-amber-500/50 hover:border-amber-300 text-amber-300'
                          : 'bg-[#042636] hover:bg-[#08415c] border-cyan-500/50 hover:border-cyan-300 text-cyan-300'
                      }`}
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">🪑</span>
                      <span className="text-[10px] font-black">{seatIdx + 1}号位</span>
                      <span className="text-[8px] text-emerald-400 font-mono">入座</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: 预约赛事 (四人预约场 + 八人预约场) ================= */}
        {activeTab === 'scheduled' && (
          <>
            {/* 卡片 3: 四人预约场 (1副牌 52张) */}
            <div
              className={`border-2 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1 ${
                isGreen
                  ? 'bg-gradient-to-br from-[#073021] via-[#052418] to-[#02170f] border-emerald-500/60 hover:border-amber-400'
                  : 'bg-gradient-to-br from-[#07374a] via-[#052937] to-[#021a24] border-teal-500/60 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-slate-950 shadow-md shrink-0 font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>四人预约场</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        · 今晚 20:00
                      </span>
                    </h2>
                    <p className={`text-[10px] font-medium ${isGreen ? 'text-emerald-300/80' : 'text-teal-300/80'}`}>
                      1副扑克 · 52张 · 准点发牌纯净静音赛
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                    isGreen
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                  }`}
                >
                  3/4 人已订
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">开赛时间</div>
                  <div className="font-bold text-amber-300 text-xs">今晚 20:00</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-extrabold text-amber-400 text-xs">100 水 / 道</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-slate-200 text-xs">52 张单副</div>
                </div>
              </div>

              {/* 4人预约场 选座按钮区 */}
              <div className="space-y-1 mt-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 flex items-center justify-between">
                  <span>🪑 选择 1~4 号预约席位预订:</span>
                  <span className="text-[9px] text-amber-400/80 font-normal">首位预订者为房主 👑</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((seatIdx) => (
                    <button
                      key={seatIdx}
                      type="button"
                      onClick={() => handleSelectRoom(ROOM_SCHEDULED_4, seatIdx)}
                      className={`p-1.5 border rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-md group ${
                        isGreen
                          ? 'bg-[#042015] hover:bg-[#073623] border-emerald-500/60 hover:border-amber-400 text-emerald-200'
                          : 'bg-[#042636] hover:bg-[#08415c] border-teal-500/60 hover:border-cyan-300 text-cyan-200'
                      }`}
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">🪑</span>
                      <span className="text-[10px] font-black">{seatIdx + 1}号位</span>
                      <span className="text-[9px] text-amber-300 font-mono">预订</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 卡片 4: 八人预约场 (2副牌 104张 大师赛) */}
            <div
              className={`border-2 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1 ${
                isGreen
                  ? 'bg-gradient-to-br from-[#0a3826] via-[#06271a] to-[#031810] border-amber-500/60 hover:border-amber-400'
                  : 'bg-gradient-to-br from-[#094054] via-[#052b39] to-[#021c25] border-amber-500/60 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl text-slate-950 shadow-md shrink-0 font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>八人预约场 (黄金大师赛)</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        · 今晚 20:30
                      </span>
                    </h2>
                    <p className={`text-[10px] font-medium ${isGreen ? 'text-amber-200/80' : 'text-cyan-200/80'}`}>
                      8人顶级争霸 · 2副扑克104张 · 通杀全场
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  至少2真人开局
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">开赛时间</div>
                  <div className="font-bold text-amber-400 text-xs">今晚 20:30</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-extrabold text-amber-400 text-xs">200 水 / 道</div>
                </div>
                <div
                  className={`p-1 rounded-lg border ${
                    isGreen ? 'bg-[#031d12]/90 border-emerald-900/80' : 'bg-[#032330]/90 border-teal-900/80'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-amber-300 text-xs">104 张两副</div>
                </div>
              </div>

              {/* 8人预约场 选座按钮区 */}
              <div className="space-y-1 mt-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 flex items-center justify-between">
                  <span>🪑 选择 1~8 号大师赛席位预订:</span>
                  <span className="text-[9px] text-amber-300/80 font-normal">首位预订者为房主 👑</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((seatIdx) => (
                    <button
                      key={seatIdx}
                      type="button"
                      onClick={() => handleSelectRoom(ROOM_SCHEDULED_8, seatIdx)}
                      className={`p-1 border rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-md group ${
                        isGreen
                          ? 'bg-[#042015] hover:bg-[#073623] border-amber-500/50 hover:border-amber-400 text-amber-300'
                          : 'bg-[#042636] hover:bg-[#08415c] border-amber-500/50 hover:border-cyan-300 text-amber-300'
                      }`}
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">🪑</span>
                      <span className="text-[10px] font-black">{seatIdx + 1}号位</span>
                      <span className="text-[8px] text-amber-400 font-mono">预订</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 底部状态徽章 */}
      <footer
        className={`px-3 py-1.5 border-t text-[10px] flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full transition-colors ${
          isGreen ? 'bg-[#03150e]/95 border-emerald-950 text-emerald-400/80' : 'bg-[#02151e]/95 border-teal-950 text-teal-400/80'
        }`}
      >
        <span>🀄 十三水官方对战大厅 · {isGreen ? '墨玉深绿典藏版' : '琉璃湖蓝尊享版'}</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>服务在线</span>
        </span>
      </footer>

      {/* 积分管理与手机号搜索互赠弹窗 */}
      <PointsManagementModal
        isOpen={showChipsModal}
        onClose={() => setShowChipsModal(false)}
        currentUser={currentUser}
        onUserChange={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
      />

      {/* 好友私密房与邀请码弹窗 */}
      <PrivateRoomModal
        isOpen={showPrivateRoomModal}
        onClose={() => setShowPrivateRoomModal(false)}
        onEnterRoom={handleSelectRoom}
      />

      {/* 战绩历史与全景复盘弹窗 */}
      <MatchHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};
