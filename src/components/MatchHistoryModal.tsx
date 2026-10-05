import React, { useState, useEffect } from 'react';
import {
  Trophy,
  History,
  X,
  ChevronDown,
  ChevronUp,
  Crown,
  Sparkles,
  Calendar
} from 'lucide-react';
import { MatchHistoryRecord, getMatchHistoryList } from '../utils/authStorage';
import { CardItem } from './CardItem';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [historyList, setHistoryList] = useState<MatchHistoryRecord[]>([]);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const list = getMatchHistoryList();
      setHistoryList(list);
      if (list.length > 0) {
        setExpandedRoundId(list[0].id); // Auto-expand most recent
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-amber-500/40 rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              <History className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">战绩历史与对局全景复盘</h3>
              <p className="text-[10px] text-slate-400">记录近 25 局各家三墩亮牌与得分详情，支持随时复盘探讨</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-none">
          {historyList.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs space-y-2">
              <History className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="font-bold text-slate-400">暂无历史牌局记录</p>
              <p className="text-[10px] text-slate-600">完成一局十三水对战后，在此处可查看所有玩家的真实理牌与详细积分账目。</p>
            </div>
          ) : (
            historyList.map((record) => {
              const isExpanded = expandedRoundId === record.id;
              const dateStr = new Date(record.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={record.id}
                  className={`border rounded-2xl overflow-hidden transition-all ${
                    isExpanded
                      ? 'bg-slate-900 border-amber-500/50 shadow-md'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedRoundId(isExpanded ? null : record.id)}
                    className="p-3 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-center font-mono shrink-0">
                        <span className="text-[10px] text-slate-400 block leading-tight">局数</span>
                        <span className="text-xs font-bold text-amber-400">第{record.roundNumber}局</span>
                      </div>

                      <div className="h-6 w-px bg-slate-800 shrink-0" />

                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{record.roomName}</span>
                          {record.hasGunShot && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              🔫 打枪
                            </span>
                          )}
                          {record.isGrandSlam && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              👑 全垒打
                            </span>
                          )}
                          {record.maPaiLabel && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              🃏 马牌
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {dateStr} · {record.players.length}人局
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div
                          className={`font-mono font-black text-sm ${
                            record.myScoreDelta > 0
                              ? 'text-emerald-400'
                              : record.myScoreDelta < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {record.myScoreDelta > 0 ? `+${record.myScoreDelta}` : record.myScoreDelta} 水
                        </div>
                        <div className="text-[9px] text-slate-500">我的净水</div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Replay Details (All Players' Hands) */}
                  {isExpanded && (
                    <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2 animate-in fade-in">
                      <div className="text-[10px] font-bold text-amber-300 flex items-center justify-between">
                        <span>【本局各家三墩全景复盘】</span>
                        {record.grandSlamPlayerName && (
                          <span className="text-amber-400 font-normal">
                            👑 通杀王：{record.grandSlamPlayerName}
                          </span>
                        )}
                      </div>

                      {/* Players Cards Matrix */}
                      <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1 scrollbar-none">
                        {record.players.map((p, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border text-xs ${
                              p.isMe
                                ? 'bg-amber-500/10 border-amber-400/50'
                                : 'bg-slate-900/90 border-slate-800'
                            }`}
                          >
                            {/* Player Row Header */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{p.avatar}</span>
                                <span className={`font-bold ${p.isMe ? 'text-amber-300' : 'text-slate-200'}`}>
                                  {p.name} {p.isMe ? '(我)' : ''}
                                </span>
                                {p.isDaoPai && (
                                  <span className="px-1 py-0.2 rounded bg-rose-500 text-white text-[9px] font-bold">
                                    倒牌违规
                                  </span>
                                )}
                              </div>
                              <span
                                className={`font-mono font-bold text-xs ${
                                  p.score > 0 ? 'text-emerald-400' : p.score < 0 ? 'text-rose-400' : 'text-slate-400'
                                }`}
                              >
                                {p.score > 0 ? `+${p.score}` : p.score} 水
                              </span>
                            </div>

                            {/* 3 Duns Strip */}
                            <div className="grid grid-cols-3 gap-1 text-[9px]">
                              {/* Head */}
                              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                                <div className="font-bold text-sky-400 truncate w-full text-center">
                                  前: {p.headTypeName}
                                </div>
                                <div className="flex -space-x-7 py-0.5">
                                  {p.head.map((c) => (
                                    <CardItem key={c.id} card={c} size="sm" />
                                  ))}
                                </div>
                              </div>

                              {/* Mid */}
                              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                                <div className="font-bold text-blue-400 truncate w-full text-center">
                                  中: {p.midTypeName}
                                </div>
                                <div className="flex -space-x-7 py-0.5">
                                  {p.middle.map((c) => (
                                    <CardItem key={c.id} card={c} size="sm" />
                                  ))}
                                </div>
                              </div>

                              {/* Tail */}
                              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex flex-col items-center">
                                <div className="font-bold text-purple-400 truncate w-full text-center">
                                  后: {p.tailTypeName}
                                </div>
                                <div className="flex -space-x-7 py-0.5">
                                  {p.tail.map((c) => (
                                    <CardItem key={c.id} card={c} size="sm" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
