import React, { useState, useEffect } from 'react';
import {
  Coins,
  Gift,
  Search,
  Smartphone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  History,
  Send,
  Users
} from 'lucide-react';
import {
  UserProfile,
  findUserByPhone,
  searchUsersByPhone,
  transferChips,
  getTransferHistory,
  ChipTransferRecord,
  addChips
} from '../utils/authStorage';
import { SoundEffects } from '../utils/audio';

interface PointsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const PointsManagementModal: React.FC<PointsManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>('transfer');

  // Search state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserProfile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Transfer form state
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [transferNote, setTransferNote] = useState('牌友互赠水数');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [historyList, setHistoryList] = useState<ChipTransferRecord[]>([]);

  // Other available players for quick selection
  const [candidateUsers, setCandidateUsers] = useState<UserProfile[]>([]);

  // Reload history and other candidates whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setHistoryList(getTransferHistory());
      const all = searchUsersByPhone('');
      const others = all.filter((u) => u.phone !== currentUser.phone);
      setCandidateUsers(others);

      // Auto-select first candidate if search is empty
      if (!searchPhone && others.length > 0 && !searchedUser) {
        setSearchedUser(others[0]);
      }
    }
  }, [isOpen, currentUser.phone]);

  // Live or manual search by phone
  const handleSearch = (phoneToSearch?: string) => {
    const q = (phoneToSearch !== undefined ? phoneToSearch : searchPhone).trim();
    setHasSearched(true);
    setFeedback(null);

    if (!q) {
      setSearchedUser(null);
      return;
    }

    const found = findUserByPhone(q);
    setSearchedUser(found);

    if (found) {
      SoundEffects.playCardClick();
    }
  };

  // Quick preset amount buttons
  const handleSetAmount = (amt: number) => {
    setTransferAmount(amt);
    setFeedback(null);
  };

  // Perform mutual points gifting
  const handleExecuteTransfer = async () => {
    if (!searchedUser) {
      setFeedback({ type: 'error', message: '请先搜索并选择要赠送的玩家！' });
      SoundEffects.playWarning();
      return;
    }

    if (searchedUser.phone === currentUser.phone) {
      setFeedback({ type: 'error', message: '不能向自己的手机号赠送积分！' });
      SoundEffects.playWarning();
      return;
    }

    if (!transferAmount || transferAmount <= 0) {
      setFeedback({ type: 'error', message: '请输入大于 0 的有效积分数额！' });
      SoundEffects.playWarning();
      return;
    }

    if (currentUser.chips < transferAmount) {
      setFeedback({
        type: 'error',
        message: `当前持有积分不足！持有 ${currentUser.chips.toLocaleString()} 水，无法赠送 ${transferAmount.toLocaleString()} 水。`
      });
      SoundEffects.playWarning();
      return;
    }

    const res = await transferChips(searchedUser.phone, transferAmount, transferNote);

    if (res.success && res.fromUser) {
      onUserChange(res.fromUser);
      setHistoryList(getTransferHistory());
      setFeedback({ type: 'success', message: res.message });
      SoundEffects.playFanfare();

      // Refresh candidate list so recipient's new chips reflect
      const all = searchUsersByPhone('');
      setCandidateUsers(all.filter((u) => u.phone !== currentUser.phone));
      if (res.toUser) {
        setSearchedUser(res.toUser);
      }
    } else {
      setFeedback({ type: 'error', message: res.message });
      SoundEffects.playWarning();
    }
  };

  // Claim relief bonus
  const handleClaimBonus = (amount = 1000) => {
    const updated = addChips(amount);
    onUserChange(updated);
    SoundEffects.playFanfare();
    setFeedback({ type: 'success', message: `🎁 成功领取补助水数：+${amount.toLocaleString()} 水！` });
  };

  // Reset to 1000 chips
  const handleResetChips = () => {
    const diff = 1000 - currentUser.chips;
    const updated = addChips(diff);
    onUserChange(updated);
    SoundEffects.playCardClick();
    setFeedback({ type: 'success', message: '✓ 积分已重置为 1,000 初始水数！' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-amber-500/40 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Coins className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">积分管理 · 水数查询与赠送</h3>
              <p className="text-[10px] text-slate-400">支持通过手机号搜索玩家昵称、头像并相互赠送积分</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. My Balance Card */}
        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between shrink-0 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="text-2xl w-10 h-10 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center shadow-xs">
              {currentUser.avatar || '😎'}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <span>{currentUser.nickname}</span>
                {currentUser.phone && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(-4)}
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono leading-tight mt-0.5">
                {currentUser.chips.toLocaleString()} <span className="text-xs text-amber-300 font-normal">水</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleClaimBonus(1000)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-all"
              title="领补助 +1,000 水"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>领1000水</span>
            </button>
            <button
              onClick={handleResetChips}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer"
              title="重置为 1,000 初始水数"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => {
              setActiveTab('transfer');
              setFeedback(null);
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'transfer'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>搜索手机号并赠送</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setHistoryList(getTransferHistory());
              setFeedback(null);
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>积分账单明细 ({historyList.length})</span>
          </button>
        </div>

        {/* 4. Feedback Message */}
        {feedback && (
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span className="truncate flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="p-0.5 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 5. TAB A: SEARCH BY PHONE & MUTUAL TRANSFER */}
        {activeTab === 'transfer' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-none">
            {/* Search Input Bar */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>搜索目标玩家手机号</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">支持输入完整或前缀手机号</span>
              </label>

              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchPhone(val);
                      handleSearch(val);
                    }}
                    placeholder="输入手机号 (如 13800138000)..."
                    maxLength={11}
                    className="w-full h-9 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-7 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {searchPhone && (
                    <button
                      onClick={() => {
                        setSearchPhone('');
                        setSearchedUser(null);
                        setHasSearched(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="h-9 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>搜索</span>
                </button>
              </div>
            </div>

            {/* Quick Candidate Selection Strip */}
            {candidateUsers.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>推荐或常用玩家（点击直接选定）：</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {candidateUsers.map((u) => {
                    const isSelected = searchedUser?.phone === u.phone;
                    return (
                      <button
                        key={u.phone}
                        type="button"
                        onClick={() => {
                          setSearchPhone(u.phone);
                          setSearchedUser(u);
                          setHasSearched(true);
                          setFeedback(null);
                          SoundEffects.playCardClick();
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs shrink-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm">{u.avatar}</span>
                        <span className="truncate max-w-[70px]">{u.nickname}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Display Target Player's Nickname & Avatar */}
            {searchedUser ? (
              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border-2 border-amber-400/80 rounded-2xl flex items-center justify-between shadow-lg animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="relative text-3xl w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-md">
                    <span>{searchedUser.avatar}</span>
                    <span className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full shadow">
                      VIP
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white">{searchedUser.nickname}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        认证玩家
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>📱 {searchedUser.phone}</span>
                      <span className="text-amber-400">持水: {searchedUser.chips.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                    ✓ 接收方已选定
                  </span>
                </div>
              </div>
            ) : (
              hasSearched && searchPhone && (
                <div className="p-3 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                  <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                  <p className="font-bold text-slate-300">未找到手机号为 “{searchPhone}” 的注册玩家</p>
                  <p className="text-[10px] text-slate-500">
                    提示：只有已经使用该手机号注册的玩家才能接收积分赠送。
                  </p>
                </div>
              )
            )}

            {/* Transfer Amount & Confirmation Section */}
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">赠送积分数额 (水数)</span>
                <span className="text-slate-400 text-[11px]">
                  赠送后剩余：
                  <strong className="text-amber-400 font-mono ml-1">
                    {Math.max(0, currentUser.chips - (transferAmount || 0)).toLocaleString()} 水
                  </strong>
                </span>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={currentUser.chips}
                  value={transferAmount || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTransferAmount(isNaN(val) ? 0 : val);
                    setFeedback(null);
                  }}
                  className="w-full h-10 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 text-base text-amber-400 font-mono font-bold focus:outline-none"
                  placeholder="输入赠送积分数额"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  水
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSetAmount(amt)}
                    className={`py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      transferAmount === amt
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSetAmount(currentUser.chips)}
                  className="py-1 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-500/50 cursor-pointer"
                >
                  全部
                </button>
              </div>

              {/* Remark Note */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-medium">赠送留言备注 (选填)：</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="如：牌局分红、祝你好运..."
                  maxLength={20}
                  className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Confirm Transfer Button */}
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={!searchedUser || searchedUser.phone === currentUser.phone || currentUser.chips < transferAmount}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>
                  {searchedUser
                    ? `确认赠送 ${transferAmount.toLocaleString()} 水 给 [${searchedUser.nickname}]`
                    : '请搜索并选择接收玩家'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 6. TAB B: TRANSFER HISTORY & LEDGER */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-none">
            {historyList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                <p>暂无积分赠送流水记录</p>
                <p className="text-[10px] text-slate-600">在“搜索赠送”标签中可将积分赠送给其他好友玩家。</p>
              </div>
            ) : (
              historyList.map((item) => {
                const isSentByMe = item.fromPhone === currentUser.phone;
                const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="text-xl w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        {isSentByMe ? item.toAvatar : item.fromAvatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate flex items-center gap-1">
                          <span>{isSentByMe ? `赠送给 [${item.toNickname}]` : `收到 [${item.fromNickname}] 赠送`}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.note || '牌友互赠'} · <span className="font-mono">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-bold text-xs ${
                          isSentByMe ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {isSentByMe ? `-${item.amount.toLocaleString()}` : `+${item.amount.toLocaleString()}`} 水
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">成功</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
