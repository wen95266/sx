import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Coins,
  X,
  Bot,
  RefreshCw
} from 'lucide-react';
import {
  UserProfile,
  AVATAR_OPTIONS,
  registerWithPhone,
  loginWithPhone,
  logoutUser,
  getAuthorizedPhones,
  syncAuthorizedPhones,
  syncRegisteredAccounts,
  syncLocalAccountsToServer,
  isPhoneAuthorized
} from '../utils/authStorage';
import { SoundEffects } from '../utils/audio';

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
  const [tab, setTab] = useState<'login' | 'register' | 'profile'>(
    currentUser.isLoggedIn ? 'profile' : 'login'
  );

  // Form states
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Message alert
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-sync whitelist and accounts from server/Telegram Bot
  useEffect(() => {
    syncAuthorizedPhones().catch(() => {});
    syncRegisteredAccounts().catch(() => {});
    syncLocalAccountsToServer().catch(() => {});
  }, [isOpen, tab]);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const list = await syncAuthorizedPhones();
      await syncRegisteredAccounts();
      await syncLocalAccountsToServer();
      setSuccessMsg(`✓ 已成功从服务器同步最新授权白名单与全服账号（共 ${list.length} 个授权号）`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {
      setErrorMsg('同步服务器数据失败，请检查网络连接');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen && currentUser.isLoggedIn) return null;

  // If not logged in, force modal to stay open
  const isForced = !currentUser.isLoggedIn;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginWithPhone(phone, password);
      if (!res.success) {
        setErrorMsg(res.message);
        SoundEffects.playWarning();
        setLoading(false);
        return;
      }

      SoundEffects.playFanfare();
      setSuccessMsg(res.message);
      if (res.user) {
        onUserChange(res.user);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 700);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录发生异常，请重试';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await registerWithPhone(phone, nickname, password, selectedAvatar);
      if (!res.success) {
        setErrorMsg(res.message);
        SoundEffects.playWarning();
        setLoading(false);
        return;
      }

      SoundEffects.playFanfare();
      setSuccessMsg(res.message);
      if (res.user) {
        onUserChange(res.user);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 900);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '注册发生异常，请重试';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const loggedOut = logoutUser();
    onUserChange(loggedOut);
    setTab('login');
    setPhone('');
    setPassword('');
    setNickname('');
    setErrorMsg(null);
    setSuccessMsg('✓ 已成功退出登录');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const authList = getAuthorizedPhones();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={() => {
        if (!isForced) onClose();
      }}
    >
      <div
        className="bg-[#052115] border-2 border-emerald-800/80 rounded-3xl w-full max-w-md shadow-2xl shadow-emerald-950/80 overflow-hidden flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-900/60 bg-[#031910]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              🀄
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">十三水竞技场</div>
              <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Telegram Bot 授权验证系统</span>
              </div>
            </div>
          </div>

          {!isForced && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-emerald-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher (When not in profile view) */}
        {tab !== 'profile' && (
          <div className="grid grid-cols-2 p-1.5 bg-[#03150e] border-b border-emerald-900/60 text-xs font-bold">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              手机号登录
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              新手机号注册
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              {/* Sync and Bot info banner */}
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 text-[11px] text-emerald-300">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">支持任意手机跨设备登录</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isRefreshing}
                  className="px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                  title="从服务器同步最新账号与授权"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? '同步中' : '同步全服'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>手机号：</span>
                  </label>
                  {phone.trim().length >= 11 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      isPhoneAuthorized(phone)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isPhoneAuthorized(phone) ? '✓ 已获 Bot 授权' : '需在 Bot 发送 /auth'}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full bg-[#031910] border border-emerald-900/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>密码 (6位字符)：</span>
                  </label>
                  <span className="text-[10px] text-amber-400/80">默认初始密码 888888</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入 6 位密码（初始 888888）"
                  className="w-full bg-[#031910] border border-emerald-900/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 tracking-wider"
                  required
                />
              </div>

              {errorMsg && (errorMsg.includes('未找到') || errorMsg.includes('注册')) && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-300">尚未初始化？</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMsg(null);
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    一键前往注册
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{loading ? '正在登录...' : '立即登录进入大厅'}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">还没有账号？ </span>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  点击注册
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              {/* Bot Whitelist Banner */}
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-2 text-[11px] text-indigo-300">
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">需管理员在 Telegram Bot 授权方可注册</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isRefreshing}
                  className="px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                  title="从服务器重新拉取最新授权手机号名单"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? '同步中' : '刷新白名单'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>授权手机号：</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入管理员已授权的手机号"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>玩家昵称：</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例如：东方雀圣、雀神无双"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>登录密码 (精确 6 位数)：</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入 6 位密码（不限大小写字母/数字）"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 tracking-wider"
                  required
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">选择对战头像：</label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-xl p-1.5 rounded-xl border transition-transform cursor-pointer shrink-0 ${
                        selectedAvatar === av
                          ? 'bg-emerald-500/20 border-emerald-400 scale-110'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>正在核验授权...</span>
                  </>
                ) : (
                  <span>立即注册并登录</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-400">已有授权账号？ </span>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  去登录
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGGED-IN PROFILE & LOGOUT */}
          {tab === 'profile' && currentUser.isLoggedIn && (
            <div className="flex flex-col gap-4">
              {/* Profile Card */}
              <div className="p-4 bg-[#031910] border border-emerald-900/80 rounded-2xl flex items-center gap-3">
                <div className="text-4xl w-14 h-14 bg-[#02130c] border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                  {currentUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base truncate">{currentUser.nickname}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      VIP
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    📱 手机号: {currentUser.phone ? `${currentUser.phone.slice(0, 3)}****${currentUser.phone.slice(-4)}` : '未绑定'}
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold mt-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{currentUser.chips.toLocaleString()} 水</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#031910] border border-emerald-900/60 rounded-xl">
                  <div className="text-emerald-300/80">总局数</div>
                  <div className="font-mono font-bold text-white mt-0.5">{currentUser.totalGames}</div>
                </div>
                <div className="p-2.5 bg-[#031910] border border-emerald-900/60 rounded-xl">
                  <div className="text-emerald-300/80">胜场</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">{currentUser.totalWins}</div>
                </div>
                <div className="p-2.5 bg-[#031910] border border-emerald-900/60 rounded-xl">
                  <div className="text-emerald-300/80">胜率</div>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">
                    {currentUser.totalGames > 0
                      ? `${Math.round((currentUser.totalWins / currentUser.totalGames) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
