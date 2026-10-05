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
  LogOut
} from 'lucide-react';
import { LobbyRoom } from '../types/game';
import { UserProfile, addChips, logoutUser } from '../utils/authStorage';
import { SoundEffects } from '../utils/audio';

interface GameLobbyProps {
  currentUser: UserProfile;
  onEnterRoom: (room: LobbyRoom) => void;
  onOpenAuth: () => void;
  onOpenBotGuide?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

const REALTIME_ARENA_ROOM: LobbyRoom = {
  id: 'room_realtime_main',
  name: '🔥 实时竞技场',
  type: 'realtime',
  baseScore: 50,
  minChips: 500,
  playersCount: 3,
  maxPlayers: 4,
  creatorName: '系统快配',
  status: 'waiting',
  allowChat: true,
  tag: '即时开黑',
  description: '随时秒速入局，支持局内打字、快捷短语、发光飘屏弹幕与表情互动！'
};

const SCHEDULED_ARENA_ROOM: LobbyRoom = {
  id: 'room_scheduled_main',
  name: '📅 预约竞技场 (今晚 20:00 黄金赛)',
  type: 'scheduled',
  baseScore: 100,
  minChips: 1000,
  playersCount: 3,
  maxPlayers: 4,
  scheduledTime: '今晚 20:00',
  creatorName: '官方赛事官',
  status: 'booking',
  allowChat: false,
  tag: '定时赛事',
  description: '席位预定准点发牌，全场纯净静音，无聊天弹幕干扰，专注比牌！',
  bookedPlayers: [
    { name: '东方雀圣', avatar: '🧙', ready: true },
    { name: '西门吹水', avatar: '🤖', ready: true },
    { name: '北冥神手', avatar: '🥷', ready: true }
  ]
};

export const GameLobby: React.FC<GameLobbyProps> = ({
  currentUser,
  onEnterRoom,
  onOpenAuth,
  onUpdateUser
}) => {
  const [showChipsModal, setShowChipsModal] = useState(false);
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

  const handleEnterRealtime = () => {
    if (!currentUser.isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (currentUser.chips < REALTIME_ARENA_ROOM.minChips) {
      const updated = addChips(1000);
      if (onUpdateUser) onUpdateUser(updated);
      setToastTip('⚠️ 筹码不足，已自动补发 +1,000 水！正在进入实时场...');
      setTimeout(() => {
        setToastTip(null);
        onEnterRoom(REALTIME_ARENA_ROOM);
      }, 1000);
      return;
    }
    onEnterRoom(REALTIME_ARENA_ROOM);
  };

  const handleEnterScheduled = () => {
    if (!currentUser.isLoggedIn) {
      onOpenAuth();
      return;
    }
    onEnterRoom(SCHEDULED_ARENA_ROOM);
  };

  const winRate =
    currentUser.totalGames > 0
      ? Math.round((currentUser.totalWins / currentUser.totalGames) * 100)
      : 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      {/* 顶部栏：左上角退出登录 | 右上角积分管理 */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-40 backdrop-blur-md shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* 左上角：已登录展示头像/昵称与 [退出登录] 按钮 */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="relative text-2xl md:text-3xl w-12 h-12 bg-slate-950 border-2 border-amber-400/80 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer group"
              title="点击查看玩家档案"
            >
              <span>{currentUser.avatar}</span>
              <span className="absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold rounded-full shadow">
                VIP
              </span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold text-white leading-none">
                  {currentUser.nickname}
                </span>
                {currentUser.phone && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono hidden sm:inline">
                    📱 {currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(-4)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {currentUser.isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                    title="退出当前登录账号"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>退出登录</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                  >
                    <Key className="w-3 h-3 text-slate-950" />
                    <span>注册 / 登录</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右上角：积分管理 (Points Management) */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowChipsModal(true)}
              className="px-4 py-2 bg-slate-950/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all shadow-md group"
              title="点击查看积分管理与明细"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-amber-300 font-medium">积分管理</div>
                <div className="text-xs md:text-sm font-bold text-amber-400 font-mono leading-none">
                  {currentUser.chips.toLocaleString()} 水
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 提示条 */}
      {toastTip && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-4">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in shadow-lg">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastTip}</span>
          </div>
        </div>
      )}

      {/* 下面核心两个板块：预约场 与 实时场 */}
      <main className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1 flex flex-col justify-center gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 板块 1: 实时场 (Realtime Arena) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/20">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                      <span>实时场</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal border border-amber-500/40 font-mono">
                        🔥 随时秒开
                      </span>
                    </h2>
                    <p className="text-xs text-amber-300/80 font-medium mt-0.5">即时在线对决 · 局内聊天与飘屏弹幕</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">底分水数:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">50 水 / 道</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">准入要求:</span>
                  <span className="font-mono text-slate-200">500 水</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">局内互动:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>打字聊天 · 飘屏弹幕 · 表情挑衅</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterRealtime}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>进入实时场 (一键入座)</span>
            </button>
          </div>

          {/* 板块 2: 预约场 (Scheduled Arena) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border-2 border-sky-500/40 hover:border-sky-400 rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-sky-500/20">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                      <span>预约场</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-normal border border-sky-500/40 font-mono">
                        📅 定时赛事
                      </span>
                    </h2>
                    <p className="text-xs text-sky-200/80 font-medium mt-0.5">席位预订开赛 · 纯净静音无聊竞技</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">赛事时间:</span>
                  <span className="font-bold text-sky-300">今晚 20:00 (准点发牌)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">底分水数:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">100 水 / 道</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">竞技环境:</span>
                  <span className="text-sky-300 font-bold flex items-center gap-1">
                    <MessageSquareOff className="w-3.5 h-3.5" />
                    <span>静音竞技 · 无杂音干扰 · 专业比牌</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterScheduled}
              className="w-full py-4 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Calendar className="w-5 h-5" />
              <span>进入预约场 (预订席位)</span>
            </button>
          </div>
        </div>
      </main>

      {/* 积分管理弹窗 */}
      {showChipsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">积分管理中心</h3>
                  <p className="text-[11px] text-slate-400">查看水数、战绩与领取救济补助</p>
                </div>
              </div>
              <button
                onClick={() => setShowChipsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300/80 font-medium">当前拥有水数 (积分)</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                    {currentUser.chips.toLocaleString()} <span className="text-sm font-sans font-normal">水</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">玩家段位</span>
                  <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser.chips >= 10000 ? '雀皇大圣' : currentUser.chips >= 3000 ? '豪门大侠' : '雀坛新秀'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">总对局</span>
                  <span className="font-bold text-white font-mono text-sm">{currentUser.totalGames} 局</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">胜利局数</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{currentUser.totalWins} 胜</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">胜率</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{winRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleClaimBonus(1000);
                    setShowChipsModal(false);
                  }}
                  className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 border border-emerald-500/40 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                    <span>🎁 每日补助</span>
                    <span>+1,000 水</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleClaimBonus(5000);
                    setShowChipsModal(false);
                  }}
                  className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 border border-amber-500/40 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-amber-300 font-bold text-xs">
                    <span>⚡ 补充筹码</span>
                    <span>+5,000 水</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  handleResetChips();
                  setShowChipsModal(false);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置积分为初始 1,000 水</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
