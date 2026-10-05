import React, { useState } from 'react';
import {
  Key,
  Users,
  Copy,
  Check,
  Play,
  X,
  Sparkles,
  ShieldCheck,
  Coins,
  Share2,
  Crown
} from 'lucide-react';
import { LobbyRoom } from '../types/game';
import { SoundEffects } from '../utils/audio';

interface PrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (room: LobbyRoom) => void;
}

export const PrivateRoomModal: React.FC<PrivateRoomModalProps> = ({
  isOpen,
  onClose,
  onEnterRoom
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Create form state
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [roomName, setRoomName] = useState('好友私密房');
  const [maxPlayers, setMaxPlayers] = useState<4 | 8>(4);
  const [baseScore, setBaseScore] = useState<number>(50);
  const [enableMaPai, setEnableMaPai] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRandomCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    SoundEffects.playCardClick();
  };

  const handleCopyInvite = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/?room=${roomCode}`;
    const text = `🀄 十三水私密房邀请！\n房号：【${roomCode}】（${maxPlayers}人场·底分${baseScore}水${enableMaPai ? '·马牌翻倍' : ''}）\n点击专属链接直接进入房间：${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
    SoundEffects.playFanfare();
  };

  const handleCreateAndEnter = () => {
    const newRoom: LobbyRoom = {
      id: `private_${roomCode}`,
      name: `🔐 ${roomName} #${roomCode}`,
      type: 'realtime',
      baseScore,
      minChips: baseScore * 5,
      playersCount: 1,
      maxPlayers,
      deckCount: maxPlayers === 8 ? 2 : 1,
      creatorName: '我 (房主)',
      status: 'waiting',
      allowChat: true,
      tag: `私密房 · 房号${roomCode}${enableMaPai ? ' · 马牌翻倍' : ''}`,
      description: `好友私密房，房号 ${roomCode}，底分 ${baseScore} 水，${enableMaPai ? '开启马牌翻倍' : '标准规则'}。`
    };

    onEnterRoom(newRoom);
    onClose();
  };

  const handleJoinByCode = () => {
    const code = joinCode.trim();
    if (!code || code.length !== 4) {
      setJoinError('请输入 4 位有效房间号！');
      SoundEffects.playWarning();
      return;
    }

    const joinedRoom: LobbyRoom = {
      id: `private_${code}`,
      name: `🔐 好友私密房 #${code}`,
      type: 'realtime',
      baseScore: 50,
      minChips: 250,
      playersCount: 2,
      maxPlayers: 4,
      deckCount: 1,
      creatorName: '好友房主',
      status: 'waiting',
      allowChat: true,
      tag: `私密房 · 房号${code}`,
      description: `通过邀请码 ${code} 加入的好友专属私密牌局。`
    };

    onEnterRoom(joinedRoom);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-amber-500/40 rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">好友私密房 · 密码邀约</h3>
              <p className="text-[10px] text-slate-400">支持自建房间密码、一键分享链接入房与马牌玩法</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            自建私密房
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'join'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            输入房号加入
          </button>
        </div>

        {/* Tab 1: Create Private Room */}
        {activeTab === 'create' && (
          <div className="space-y-3 text-xs">
            {/* Room Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>房间密码 / 房号 (4位数)</span>
                <button
                  type="button"
                  onClick={handleRandomCode}
                  className="text-amber-400 text-[10px] hover:underline"
                >
                  随机生成
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 h-9 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 text-base text-amber-400 font-mono font-bold tracking-widest text-center focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl flex items-center gap-1 border border-slate-700 shrink-0 cursor-pointer active:scale-95"
                  title="复制分享链接"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制' : '复制邀请'}</span>
                </button>
              </div>
            </div>

            {/* Players count toggle */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">房间人数规模</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaxPlayers(4)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    maxPlayers === 4
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>4 人场 (1副牌·52张)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPlayers(8)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    maxPlayers === 8
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>8 人场 (2副牌·104张)</span>
                </button>
              </div>
            </div>

            {/* Base score */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">底分设置 (每水积分)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 100, 200, 500].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setBaseScore(score)}
                    className={`py-1 rounded-lg border font-mono font-bold transition-all ${
                      baseScore === score
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {score}水
                  </button>
                ))}
              </div>
            </div>

            {/* Ma-Pai Toggle */}
            <div
              onClick={() => setEnableMaPai(!enableMaPai)}
              className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer select-none hover:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🃏</span>
                <div>
                  <div className="font-bold text-white text-[11px]">开启「马牌」翻倍玩法</div>
                  <div className="text-[9px] text-slate-400">随机摸到马牌(如♥10)的玩家，本局比牌赢分额外 ×2 倍！</div>
                </div>
              </div>
              <div
                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${
                  enableMaPai ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-slate-950 transition-transform ${
                    enableMaPai ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              type="button"
              onClick={handleCreateAndEnter}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>立即开房并就坐</span>
            </button>
          </div>
        )}

        {/* Tab 2: Join by Room Code */}
        {activeTab === 'join' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">输入 4 位数房间密码</label>
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.replace(/\D/g, ''));
                  setJoinError(null);
                }}
                placeholder="例如 6688..."
                className="w-full h-11 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 text-xl text-amber-400 font-mono font-bold tracking-widest text-center focus:outline-none"
              />
              {joinError && <p className="text-[10px] text-rose-400">{joinError}</p>}
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              💡 <strong>提示：</strong> 输入好友通过微信或 Telegram 分享的 4 位房间号，即可直接跳过大厅进入专属牌桌同局对战！
            </p>

            <button
              type="button"
              onClick={handleJoinByCode}
              disabled={joinCode.length !== 4}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>立即加入对局</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
