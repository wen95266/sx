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
  onEnterRoom: (room: LobbyRoom) => void;
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
  onEnterRoom,
  onOpenAuth,
  onUpdateUser
}) => {
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

  const handleSelectRoom = (room: LobbyRoom) => {
    if (!currentUser.isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (currentUser.chips < room.minChips) {
      const topUp = room.minChips - currentUser.chips + 500;
      const updated = addChips(topUp);
      if (onUpdateUser) onUpdateUser(updated);
      setToastTip(`⚠️ 筹码不足，已自动补发 +${topUp.toLocaleString()} 水！正在进入对战场...`);
      setTimeout(() => {
        setToastTip(null);
        onEnterRoom(room);
      }, 1000);
      return;
    }
    onEnterRoom(room);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden justify-between">
      {/* 顶部栏：左上角退出登录 | 右上角积分管理 (极简紧凑) */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-3.5 sm:px-6 py-2 shrink-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* 左上角：已登录展示头像/昵称与 [退出登录] 按钮 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAuth}
              className="relative text-2xl w-10 h-10 bg-slate-950 border-2 border-amber-400/80 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
              title="点击查看玩家档案"
            >
              <span>{currentUser.avatar}</span>
              <span className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0.1 bg-amber-400 text-slate-950 font-bold rounded-full shadow">
                VIP
              </span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white leading-tight truncate max-w-[110px] sm:max-w-[160px]">
                  {currentUser.nickname}
                </span>
                {currentUser.phone && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono hidden sm:inline">
                    📱 {currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(-4)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                {currentUser.isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[10px] sm:text-xs rounded-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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

          {/* 右上角：PWA安装 + 战绩复盘 + 自建私密房 + 积分管理 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA 桌面安装按钮 */}
            <PWAInstallButton />

            {/* 战绩复盘按钮 */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs text-xs font-bold shrink-0"
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
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs text-xs shrink-0 active:scale-95"
              title="自建好友私密房或输入房号加入"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>自建私密房</span>
            </button>

            {/* 积分管理 */}
            <button
              onClick={() => setShowChipsModal(true)}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-950/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md group shrink-0"
              title="点击查看积分管理、搜索手机号赠送积分"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Coins className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-[8px] sm:text-[9px] text-amber-300 font-medium leading-none">积分管理</div>
                <div className="text-[11px] sm:text-xs font-bold text-amber-400 font-mono mt-0.5 leading-none">
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
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'realtime'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>实时场 (随时秒开)</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>预约场 (定时开赛)</span>
          </button>
        </div>
      </div>

      {/* 主体核心：根据选项卡展示「四人场」与「八人场 (2副扑克)」绝对不允许滚动 */}
      <main className="max-w-4xl mx-auto w-full px-3 py-2 flex-1 flex flex-col justify-around gap-2.5 overflow-hidden">
        {/* ================= TAB 1: 实时对战 (四人实时场 + 八人实时场) ================= */}
        {activeTab === 'realtime' && (
          <>
            {/* 卡片 1: 四人实时场 (1副牌 52张) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-slate-950 shadow-md shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>四人实时场</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 font-mono">
                        1副牌 · 52张
                      </span>
                    </h2>
                    <p className="text-[10px] text-amber-300/80 font-medium">经典4人对决 · 每人13张 · 极速比牌</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  3/4 人就绪
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-bold text-amber-400 text-xs">50 水 / 道</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">准入筹码</div>
                  <div className="font-mono text-slate-200 text-xs">500 水</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-amber-300 text-xs">52 张单副</div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRoom(ROOM_REALTIME_4)}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>进入四人实时场 (一键入座)</span>
              </button>
            </div>

            {/* 卡片 2: 八人实时场 (2副牌 104张 特别刺激) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border-2 border-purple-500/50 hover:border-purple-400 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-md shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>八人实时场</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 font-mono">
                        🔥 2副牌 · 104张
                      </span>
                    </h2>
                    <p className="text-[10px] text-purple-300/80 font-medium">8人豪情同桌 · 2副扑克双副火拼 · 刺激翻倍</p>
                  </div>
                </div>
                <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                  7/8 人就绪
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-bold text-amber-400 text-xs">50 水 / 道</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">准入筹码</div>
                  <div className="font-mono text-slate-200 text-xs">1,000 水</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-purple-300 text-xs">104 张两副</div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRoom(ROOM_REALTIME_8)}
                className="w-full py-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>进入八人实时场 (两副扑克)</span>
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: 预约赛事 (四人预约场 + 八人预约场) ================= */}
        {activeTab === 'scheduled' && (
          <>
            {/* 卡片 3: 四人预约场 (1副牌 52张) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border-2 border-sky-500/40 hover:border-sky-400 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl text-white shadow-md shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>四人预约场</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 font-mono">
                        今晚 20:00
                      </span>
                    </h2>
                    <p className="text-[10px] text-sky-200/80 font-medium">1副扑克 · 52张 · 准点发牌纯净静音赛</p>
                  </div>
                </div>
                <span className="text-[10px] text-sky-300 font-mono font-bold bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/30">
                  3/4 人已订
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">开赛时间</div>
                  <div className="font-bold text-sky-300 text-xs">今晚 20:00</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-bold text-amber-400 text-xs">100 水 / 道</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-slate-200 text-xs">52 张单副</div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRoom(ROOM_SCHEDULED_4)}
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>预订四人席位 (准点发牌)</span>
              </button>
            </div>

            {/* 卡片 4: 八人预约场 (2副牌 104张 大师赛) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 shadow-xl transition-all relative overflow-hidden flex-1">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl text-slate-950 shadow-md shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                      <span>八人预约场 (黄金大师赛)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 font-mono">
                        今晚 20:30
                      </span>
                    </h2>
                    <p className="text-[10px] text-amber-300/80 font-medium">8人顶级争霸 · 2副扑克104张 · 通杀全场</p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  7/8 人已订
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">开赛时间</div>
                  <div className="font-bold text-amber-400 text-xs">今晚 20:30</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">底分水数</div>
                  <div className="font-mono font-bold text-amber-400 text-xs">200 水 / 道</div>
                </div>
                <div className="p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[9px] text-slate-400">牌桌扑克</div>
                  <div className="font-bold text-amber-300 text-xs">104 张两副</div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRoom(ROOM_SCHEDULED_8)}
                className="w-full py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>预订八人大师赛 (两副扑克)</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* 底部状态徽章 (极简单行，绝不占高) */}
      <footer className="px-3 py-1 bg-slate-950/90 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
        <span>🀄 十三水官方对战大厅 (四人单副 / 八人双副)</span>
        <span className="text-emerald-500 flex items-center gap-1">
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
