import React, { useState } from 'react';
import {
  Calendar,
  Zap,
  Users,
  Clock,
  Lock,
  Plus,
  Trophy,
  Flame,
  Crown,
  Sparkles,
  ShieldCheck,
  Coins,
  MessageCircle,
  MessageSquareOff,
  Radio,
  Play,
  Check,
  ArrowRight,
  Search,
  Filter,
  Gift
} from 'lucide-react';
import { LobbyRoom, RoomType } from '../types/game';
import { UserProfile, addChips } from '../utils/authStorage';
import { SoundEffects } from '../utils/audio';

interface GameLobbyProps {
  currentUser: UserProfile;
  onEnterRoom: (room: LobbyRoom) => void;
  onOpenAuth: () => void;
  onOpenBotGuide: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

const DEFAULT_SCHEDULED_ROOMS: LobbyRoom[] = [
  {
    id: 'sched_1',
    name: '🏆 今晚 20:00 · 雀神巡回黄金公开赛',
    type: 'scheduled',
    baseScore: 100,
    minChips: 1000,
    playersCount: 3,
    maxPlayers: 4,
    scheduledTime: '今晚 20:00',
    creatorName: '东方雀圣',
    status: 'booking',
    allowChat: false,
    tag: '官方赛事',
    description: '四人争霸锦标赛，定时准点发牌，全场无杂音专注对决。',
    bookedPlayers: [
      { name: '东方雀圣', avatar: '🧙', ready: true },
      { name: '西门吹水', avatar: '🤖', ready: true },
      { name: '北冥神手', avatar: '🥷', ready: true }
    ]
  },
  {
    id: 'sched_2',
    name: '👑 今晚 21:30 · 周末老友私享预约局',
    type: 'scheduled',
    baseScore: 50,
    minChips: 500,
    playersCount: 2,
    maxPlayers: 4,
    scheduledTime: '今晚 21:30',
    creatorName: '赌圣阿星',
    hasPassword: true,
    status: 'booking',
    allowChat: false,
    tag: '好友私房',
    description: '私密邀请房，凭房号入座，到点满员自动开启三道比牌。',
    bookedPlayers: [
      { name: '赌圣阿星', avatar: '🤵', ready: true },
      { name: '雀坛小霸王', avatar: '👑', ready: true }
    ]
  },
  {
    id: 'sched_3',
    name: '🎴 明日 14:00 · 休闲午后四人切磋赛',
    type: 'scheduled',
    baseScore: 20,
    minChips: 200,
    playersCount: 1,
    maxPlayers: 4,
    scheduledTime: '明日 14:00',
    creatorName: '开心牌友',
    status: 'booking',
    allowChat: false,
    tag: '娱乐练手',
    description: '轻松闲适的下午场，适合磨炼水数与特殊牌型技巧。',
    bookedPlayers: [
      { name: '开心牌友', avatar: '🐼', ready: true }
    ]
  },
  {
    id: 'sched_4',
    name: '⚔️ 明日 20:00 · 巅峰万元大奖争霸赛',
    type: 'scheduled',
    baseScore: 200,
    minChips: 2000,
    playersCount: 3,
    maxPlayers: 4,
    scheduledTime: '明日 20:00',
    creatorName: '系统赛事官',
    status: 'booking',
    allowChat: false,
    tag: '高额赏金',
    description: '顶级高手预约局，打枪翻倍加水，通杀全垒打四倍狂欢。',
    bookedPlayers: [
      { name: '刀仔', avatar: '🦁', ready: true },
      { name: '九指神丐', avatar: '🦸', ready: true },
      { name: '红桃K', avatar: '🐯', ready: true }
    ]
  }
];

const DEFAULT_REALTIME_ROOMS: LobbyRoom[] = [
  {
    id: 'live_beginner',
    name: '🟢 新手初级场 (底分 10 水)',
    type: 'realtime',
    baseScore: 10,
    minChips: 100,
    playersCount: 3,
    maxPlayers: 4,
    creatorName: '系统快配',
    status: 'waiting',
    allowChat: true,
    tag: '秒速开局',
    description: '门槛低、节奏快！支持实时文字聊天、局内飘屏弹幕与表情互动。'
  },
  {
    id: 'live_master',
    name: '🟡 精英进阶场 (底分 50 水)',
    type: 'realtime',
    baseScore: 50,
    minChips: 500,
    playersCount: 2,
    maxPlayers: 4,
    creatorName: '高进',
    status: 'waiting',
    allowChat: true,
    tag: '激烈切磋',
    description: '高手如云，斗智斗勇！随时弹幕挑衅与语音互动。'
  },
  {
    id: 'live_supreme',
    name: '🔴 雀皇至尊场 (底分 200 水)',
    type: 'realtime',
    baseScore: 200,
    minChips: 2000,
    playersCount: 3,
    maxPlayers: 4,
    creatorName: '龙五',
    status: 'waiting',
    allowChat: true,
    tag: '巨额注池',
    description: '顶峰相见！打枪全垒打翻天覆地，热血弹幕实时沸腾。'
  },
  {
    id: 'live_friend',
    name: '🟣 实时自建开黑房 (自定义底分)',
    type: 'realtime',
    baseScore: 30,
    minChips: 300,
    playersCount: 1,
    maxPlayers: 4,
    creatorName: '当前玩家',
    status: 'waiting',
    allowChat: true,
    tag: '好友专桌',
    description: '邀请好友面对面或远程实时开局，支持专属弹幕畅聊。'
  }
];

export const GameLobby: React.FC<GameLobbyProps> = ({
  currentUser,
  onEnterRoom,
  onOpenAuth,
  onOpenBotGuide,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<RoomType>('realtime');
  const [scheduledRooms, setScheduledRooms] = useState<LobbyRoom[]>(DEFAULT_SCHEDULED_ROOMS);
  const [realtimeRooms, setRealtimeRooms] = useState<LobbyRoom[]>(DEFAULT_REALTIME_ROOMS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomBaseScore, setNewRoomBaseScore] = useState(50);
  const [newScheduledTime, setNewScheduledTime] = useState('今晚 20:30');
  const [bookedSuccessTip, setBookedSuccessTip] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const handleClaimBonus = () => {
    const updated = addChips(1000);
    if (onUpdateUser) onUpdateUser(updated);
    SoundEffects.playFanfare();
    setBookedSuccessTip('🎁 成功领取每日救济补助：+1,000 水！祝您把把通天大顺！');
    setTimeout(() => setBookedSuccessTip(null), 3000);
  };

  const handleQuickMatch = () => {
    // Check if chips are enough for beginner
    if (currentUser.chips < 100) {
      handleClaimBonus();
    }

    const room =
      currentUser.chips >= 2000
        ? realtimeRooms[2]
        : currentUser.chips >= 500
        ? realtimeRooms[1]
        : realtimeRooms[0];
    onEnterRoom(room);
  };

  const handleEnterRealtimeRoom = (room: LobbyRoom) => {
    if (currentUser.chips < room.minChips) {
      const updated = addChips(1000);
      if (onUpdateUser) onUpdateUser(updated);
      setBookedSuccessTip(`⚠️ 筹码不足（需 ${room.minChips} 水），已自动为您补发 +1,000 水！正在进入房间...`);
      setTimeout(() => {
        setBookedSuccessTip(null);
        onEnterRoom(room);
      }, 1200);
      return;
    }
    onEnterRoom(room);
  };

  const handleBookScheduledRoom = (room: LobbyRoom) => {
    if (room.playersCount >= 4) {
      onEnterRoom(room);
      return;
    }

    const isBooked = room.bookedPlayers?.some(p => p.name === currentUser.nickname);
    if (!isBooked) {
      const updated = scheduledRooms.map(r => {
        if (r.id === room.id) {
          const list = r.bookedPlayers || [];
          return {
            ...r,
            playersCount: r.playersCount + 1,
            bookedPlayers: [...list, { name: currentUser.nickname, avatar: currentUser.avatar, ready: true }]
          };
        }
        return r;
      });
      setScheduledRooms(updated);
      setBookedSuccessTip(`🎉 成功预约 [${room.name}]！开赛时间：${room.scheduledTime}`);
      setTimeout(() => setBookedSuccessTip(null), 3500);
    } else {
      onEnterRoom(room);
    }
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    if (activeTab === 'scheduled') {
      const newRoom: LobbyRoom = {
        id: `sched_${Date.now()}`,
        name: newRoomName.trim(),
        type: 'scheduled',
        baseScore: newRoomBaseScore,
        minChips: newRoomBaseScore * 10,
        playersCount: 1,
        maxPlayers: 4,
        scheduledTime: newScheduledTime,
        creatorName: currentUser.nickname,
        status: 'booking',
        allowChat: false,
        tag: '个人发起',
        description: '玩家自发组织的预约场，无聊天专业比牌。',
        bookedPlayers: [{ name: currentUser.nickname, avatar: currentUser.avatar, ready: true }]
      };
      setScheduledRooms(prev => [newRoom, ...prev]);
    } else {
      const newRoom: LobbyRoom = {
        id: `live_${Date.now()}`,
        name: newRoomName.trim(),
        type: 'realtime',
        baseScore: newRoomBaseScore,
        minChips: newRoomBaseScore * 10,
        playersCount: 1,
        maxPlayers: 4,
        creatorName: currentUser.nickname,
        status: 'waiting',
        allowChat: true,
        tag: '自建实时',
        description: '玩家自建实时牌桌，支持飘屏弹幕与局内聊天。'
      };
      setRealtimeRooms(prev => [newRoom, ...prev]);
    }

    setShowCreateModal(false);
    setNewRoomName('');
  };

  // Filtered rooms
  const currentRoomsList = activeTab === 'realtime' ? realtimeRooms : scheduledRooms;
  const filteredRooms = currentRoomsList.filter(r => {
    const matchesKeyword =
      !searchKeyword ||
      r.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.tag?.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesTag = selectedTag === 'all' || r.tag === selectedTag;
    return matchesKeyword && matchesTag;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      {/* Lobby Hero Banner & Identity Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-slate-800 px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onOpenAuth}
              className="relative text-3xl md:text-4xl w-14 h-14 md:w-16 md:h-16 bg-slate-900 border-2 border-amber-400/60 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="点击查看战绩或修改头像昵称"
            >
              {currentUser.avatar}
              <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full">
                VIP
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-white">{currentUser.nickname}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  {currentUser.totalGames} 场战绩
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
                  <Coins className="w-4 h-4" />
                  <span>{currentUser.chips.toLocaleString()} 水</span>
                </div>
                <button
                  onClick={handleClaimBonus}
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                  title="免费领取每日筹码水数"
                >
                  <Gift className="w-3 h-3 text-amber-400" />
                  <span>领补助 +1,000水</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  账号中心
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleQuickMatch}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs md:text-sm shadow-xl shadow-amber-500/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>一键快速入座 (实时场)</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs md:text-sm font-semibold text-slate-200 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{activeTab === 'scheduled' ? '发起预约场' : '创建新房间'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booked Success / Toast Alert */}
      {bookedSuccessTip && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-4">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bookedSuccessTip}</span>
          </div>
        </div>
      )}

      {/* Main Lobby Arena Tabs */}
      <div className="max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col gap-6">
        {/* Two Giant Section Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          {/* Tab 1: 实时场 (Real-Time Live Arena) */}
          <button
            onClick={() => {
              setActiveTab('realtime');
              setSelectedTag('all');
            }}
            className={`p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer ${
              activeTab === 'realtime'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'realtime' ? 'bg-slate-950/20' : 'bg-slate-800'}`}>
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-amber-300" />
            </div>
            <div className="text-left">
              <div className="text-sm md:text-base font-bold flex items-center gap-1.5">
                <span>🔥 实时场 (即时开黑)</span>
                {activeTab === 'realtime' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/30 text-slate-950 font-bold hidden sm:inline">
                    聊天开放
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${activeTab === 'realtime' ? 'text-slate-950/80 font-medium' : 'text-slate-500'}`}>
                随时秒入局 · 专属局内聊天与发光飘屏弹幕
              </p>
            </div>
          </button>

          {/* Tab 2: 预约场 (Scheduled Booking Arena) */}
          <button
            onClick={() => {
              setActiveTab('scheduled');
              setSelectedTag('all');
            }}
            className={`p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-lg scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'scheduled' ? 'bg-slate-950/30' : 'bg-slate-800'}`}>
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-sky-300" />
            </div>
            <div className="text-left">
              <div className="text-sm md:text-base font-bold flex items-center gap-1.5">
                <span>📅 预约场 (定时赛事)</span>
                {activeTab === 'scheduled' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-sky-200 font-bold hidden sm:inline">
                    静音无聊
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${activeTab === 'scheduled' ? 'text-sky-100 font-medium' : 'text-slate-500'}`}>
                定时开赛预约 · 专业纯净竞技 (无聊天功能)
              </p>
            </div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>筛选:</span>
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              全部房间
            </button>
            {activeTab === 'realtime' ? (
              <>
                {['秒速开局', '激烈切磋', '巨额注池', '好友专桌'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                      selectedTag === t
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </>
            ) : (
              <>
                {['官方赛事', '好友私房', '娱乐练手', '高额赏金'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                      selectedTag === t
                        ? 'bg-sky-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索房间名、房主或标签..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* SECTION 1: 实时场 (REALTIME ARENA WITH LIVE CHAT & DANMU) */}
        {activeTab === 'realtime' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Feature Highlight Pill */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>实时场特权</strong>：本板块房间全面开放<strong>局内文字聊天、飘屏发光弹幕、8+快捷挑衅短语与 3D 表情弹跳</strong>！
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-bold hidden sm:inline">
                全功能开放
              </span>
            </div>

            {/* Realtime Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                          {room.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                          {room.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {room.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-amber-400 font-mono font-bold">
                        底分: {room.baseScore} 水
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        准入: {room.minChips} 水
                      </div>
                    </div>
                  </div>

                  {/* Room status & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Users className="w-3.5 h-3.5" />
                        <span>{room.playersCount} / {room.maxPlayers} 人</span>
                      </div>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] text-sky-400 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>聊天弹幕可用</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleEnterRealtimeRoom(room)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md group-hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>立即入座对战</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: 预约场 (SCHEDULED ARENA - NO CHAT, PROFESSIONAL COMPETITION) */}
        {activeTab === 'scheduled' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Feature Highlight Pill */}
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-sky-300">
              <div className="flex items-center gap-2">
                <MessageSquareOff className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>预约场规则</strong>：本板块房间为<strong>定时专业竞技赛事与好友私约</strong>，到点满员自动开赛。为确保比赛纯粹性，<strong>不开放局内聊天功能</strong>（聊天功能仅限实时场）。
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 font-bold hidden sm:inline">
                纯净竞技场
              </span>
            </div>

            {/* Scheduled Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => {
                const isUserBooked = room.bookedPlayers?.some(p => p.name === currentUser.nickname);
                return (
                  <div
                    key={room.id}
                    className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                              {room.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-xs font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{room.scheduledTime}</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {room.tag}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs text-amber-400 font-mono font-bold">
                            底分: {room.baseScore} 水
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            门槛: {room.minChips} 水
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {room.description}
                      </p>

                      {/* Booked Players List */}
                      {room.bookedPlayers && room.bookedPlayers.length > 0 && (
                        <div className="mt-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">已预约入座席位 ({room.playersCount}/4):</span>
                          <div className="flex items-center gap-1.5">
                            {room.bookedPlayers.map((p, idx) => (
                              <span
                                key={idx}
                                className="text-base p-1 bg-slate-800 rounded-lg border border-slate-700"
                                title={p.name}
                              >
                                {p.avatar}
                              </span>
                            ))}
                            {Array.from({ length: 4 - (room.bookedPlayers.length || 0) }).map((_, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-lg border border-dashed border-slate-700 text-slate-600 flex items-center justify-center text-[10px]"
                              >
                                空
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MessageSquareOff className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px]">本场无局内聊天</span>
                      </div>

                      <button
                        onClick={() => handleBookScheduledRoom(room)}
                        className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md ${
                          isUserBooked
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        }`}
                      >
                        {isUserBooked ? <Check className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                        <span>{isUserBooked ? '已预约 (进入牌桌备战)' : '立即预约报名席位'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>创建{activeTab === 'scheduled' ? '预约场赛事' : '实时场对战房'}</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">房间/赛事名称:</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder={activeTab === 'scheduled' ? '例如: 周日老友争霸赛' : '例如: 雀圣速战房'}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {activeTab === 'scheduled' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">预约开赛时间:</label>
                  <input
                    type="text"
                    value={newScheduledTime}
                    onChange={(e) => setNewScheduledTime(e.target.value)}
                    placeholder="例如: 今晚 20:30、明日 19:00"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">底分水数:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 30, 50, 100].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setNewRoomBaseScore(pts)}
                      className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-colors ${
                        newRoomBaseScore === pts
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pts} 水
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                {activeTab === 'scheduled' ? (
                  <span className="text-sky-300">
                    ℹ️ 提示：预约场不开放聊天功能，4人入座准时开打。
                  </span>
                ) : (
                  <span className="text-amber-300">
                    ℹ️ 提示：实时场全面支持局内文字聊天、飘屏发光弹幕与表情互动。
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-md"
                >
                  立即创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
