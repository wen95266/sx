import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Coins,
  Trophy,
  Flame,
  Crown,
  Sparkles,
  RotateCcw,
  LogOut,
  UserPlus,
  Check,
  X,
  CreditCard,
  Edit2,
  Key
} from 'lucide-react';
import {
  UserProfile,
  AVATAR_OPTIONS,
  getStoredUser,
  registerOrUpdateUser,
  createGuestUser,
  getAllAccounts,
  switchAccount
} from '../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'edit' | 'switch'>('profile');
  const [nicknameInput, setNicknameInput] = useState(currentUser.nickname);
  const [usernameInput, setUsernameInput] = useState(currentUser.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [savedTip, setSavedTip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNicknameInput(currentUser.nickname);
      setUsernameInput(currentUser.username);
      setSelectedAvatar(currentUser.avatar);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const winRate =
    currentUser.totalGames > 0
      ? Math.round((currentUser.totalWins / currentUser.totalGames) * 100)
      : 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = registerOrUpdateUser(nicknameInput, selectedAvatar, usernameInput);
    onUserChange(updated);
    setSavedTip(true);
    setTimeout(() => {
      setSavedTip(false);
      setActiveTab('profile');
    }, 800);
  };

  const handleCreateNewGuest = () => {
    const newUser = createGuestUser();
    onUserChange(newUser);
    setNicknameInput(newUser.nickname);
    setSelectedAvatar(newUser.avatar);
    setUsernameInput(newUser.username);
    setActiveTab('profile');
  };

  const handleSelectAccount = (id: string) => {
    const target = switchAccount(id);
    if (target) {
      onUserChange(target);
      setNicknameInput(target.nickname);
      setSelectedAvatar(target.avatar);
      setUsernameInput(target.username);
      setActiveTab('profile');
    }
  };

  const allAccounts = getAllAccounts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-slate-800 rounded-xl border border-slate-700">
              {currentUser.avatar}
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>玩家中心与账号管理</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {currentUser.chips.toLocaleString()} 水
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">ID: {currentUser.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>玩家战绩</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>注册/改名</span>
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>登录/切换</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] text-slate-300 text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="text-4xl w-14 h-14 bg-slate-950/80 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-inner">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-1.5">
                      <span>{currentUser.nickname}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                        LV.{Math.floor(currentUser.totalGames / 5) + 1}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      账号: @{currentUser.username}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Token: {currentUser.token.substring(0, 14)}...
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-amber-400/90 font-medium">当前筹码水数</div>
                  <div className="text-xl font-black text-amber-400 font-mono">
                    {currentUser.chips.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Game Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">总局数 / 胜率</div>
                    <div className="font-bold text-white text-sm">
                      {currentUser.totalGames} 局 <span className="text-emerald-400 text-xs font-mono">({winRate}%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">打枪次数</div>
                    <div className="font-bold text-white text-sm font-mono">
                      {currentUser.gunShots} 次
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">全垒打通杀</div>
                    <div className="font-bold text-white text-sm font-mono">
                      {currentUser.grandSlams} 次
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">天胡/特殊牌型</div>
                    <div className="font-bold text-white text-sm font-mono">
                      {currentUser.specialHands} 次
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>账号与战绩均保存在本地独立存储中，支持多人同机轮流对战或云端对局。</span>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">挑选个人卡通头像:</label>
                <div className="grid grid-cols-7 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-sky-500/30 border-2 border-sky-400 scale-110 shadow-md'
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">玩家显示昵称:</label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="例如: 赌神高进、雀坛小霸王..."
                  maxLength={16}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">自定义用户名 (可选):</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="例如: player_007"
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                {savedTip ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{savedTip ? '保存成功！' : '保存个人信息'}</span>
              </button>
            </form>
          )}

          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">本机已保存的账号列表:</span>
                <button
                  type="button"
                  onClick={handleCreateNewGuest}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>一键生成新玩家</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allAccounts.map((acc) => {
                  const isCurrent = acc.id === currentUser.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-sky-500/10 border-sky-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{acc.avatar}</span>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{acc.nickname}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-bold">
                                当前使用中
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {acc.chips.toLocaleString()} 水 | {acc.totalGames} 场战绩
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <span className="text-[11px] text-sky-400 hover:underline">
                          切换至此
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            完成并返回
          </button>
        </div>
      </div>
    </div>
  );
};
