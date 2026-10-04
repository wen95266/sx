import React from 'react';
import { BookOpen, Layers, ShieldAlert, Zap, Award, Flame } from 'lucide-react';

export const RulesBook: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-8">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>十三水（Chinese Poker）规则秘籍与算法图解</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          深入解析三道摆牌规则、相公倒牌禁忌、普通牌型阶梯、特殊牌型天胡分值与打枪全垒打结算公式。
        </p>
      </div>

      {/* Basic Layout Rule */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>1. 基础分道与铁律：头道 3 张 · 中道 5 张 · 尾道 5 张</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="font-bold text-amber-400 mb-1">头道 (前墩 · 3张)</div>
            <p className="text-slate-400 leading-relaxed">
              仅能组成乌龙、对子、三条（冲三）。头道若出三条通常获得 +3水额外奖励。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="font-bold text-amber-400 mb-1">中道 (中墩 · 5张)</div>
            <p className="text-slate-400 leading-relaxed">
              可出所有 5 张标准牌型。中墩出葫芦（+2水）、中墩铁支（+8水）、中墩同花顺（+10水）通常享有额外加水。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="font-bold text-amber-400 mb-1">尾道 (后墩 · 5张)</div>
            <p className="text-slate-400 leading-relaxed">
              全手牌中最强的一道。尾道铁支（+4水）、尾道同花顺（+5水）。
            </p>
          </div>
        </div>

        {/* Dao Pai Rule */}
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-200/90">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 font-semibold block mb-1">⚠️ 绝不可违犯的规则：倒牌（相公）</strong>
            十三水规定：<strong className="text-rose-200">头道强度 ≤ 中道强度 ≤ 尾道强度</strong>。
            如果出现 <span className="underline">头道大于中道</span> 或 <span className="underline">中道大于尾道</span>，即为倒牌（相公），直接判负并赔付全场玩家！
          </div>
        </div>
      </div>

      {/* Hand Power Ranking Ladder */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>2. 标准牌型从大到小排列 (5张牌)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          {[
            { name: '同花顺 (9级)', desc: '同花色连续5张 (如 ♠10-J-Q-K-A)', color: 'text-rose-400' },
            { name: '铁支 / 炸弹 (8级)', desc: '四张同点数 + 1单张 (如 4张K)', color: 'text-orange-400' },
            { name: '葫芦 (7级)', desc: '三条 + 一对 (如 3张Q + 2张9)', color: 'text-amber-400' },
            { name: '同花 (6级)', desc: '五张花色相同非顺子 (如 5张♥)', color: 'text-emerald-400' },
            { name: '顺子 (5级)', desc: '五张点数连续不同花色', color: 'text-cyan-400' },
            { name: '三条 (4级)', desc: '三张同点数 + 2单张', color: 'text-blue-400' },
            { name: '两对 (3级)', desc: '两组对子 + 1单张', color: 'text-indigo-400' },
            { name: '对子 (2级)', desc: '一组对子 + 3单张', color: 'text-purple-400' },
            { name: '乌龙 (1级)', desc: '无任何组合散牌单张', color: 'text-slate-400' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1">
              <span className={`font-bold ${item.color}`}>{item.name}</span>
              <span className="text-[11px] text-slate-400 leading-snug">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Special Hands Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>3. 特殊牌型一览表 (天胡直接胜出，无需比道)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">特殊牌型名称</th>
                <th className="p-3">牌型特征说明</th>
                <th className="p-3 text-right">奖励水数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="p-3 font-bold text-amber-300">至尊青龙 (同花十三水)</td>
                <td className="p-3 text-slate-300 font-sans">十三张同花色的 A 至 K 连牌，至高无上</td>
                <td className="p-3 text-right font-bold text-amber-400">+108 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-300">一条龙 (A-K)</td>
                <td className="p-3 text-slate-300 font-sans">十三张不同花色且点数不重复的 A 至 K 连牌</td>
                <td className="p-3 text-right font-bold text-amber-400">+36 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">十二皇族</td>
                <td className="p-3 text-slate-300 font-sans">十三张牌中有 12 张以上由 J、Q、K、A 组成</td>
                <td className="p-3 text-right font-bold text-amber-400">+24 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">三分天下 (三铁支)</td>
                <td className="p-3 text-slate-300 font-sans">拥有三组铁支(炸弹) 加一张任意单牌</td>
                <td className="p-3 text-right font-bold text-amber-400">+20 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">全大 / 全小</td>
                <td className="p-3 text-slate-300 font-sans">十三张牌点数皆在 8-A 或 2-8 之间</td>
                <td className="p-3 text-right font-bold text-amber-400">+10 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">凑一色 (全红/全黑)</td>
                <td className="p-3 text-slate-300 font-sans">十三张牌均为红心/方块，或均为黑桃/梅花</td>
                <td className="p-3 text-right font-bold text-amber-400">+10 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">四套三条</td>
                <td className="p-3 text-slate-300 font-sans">四组三条 + 1单张</td>
                <td className="p-3 text-right font-bold text-amber-400">+8 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">五对三条</td>
                <td className="p-3 text-slate-300 font-sans">五组对子 + 1组三条</td>
                <td className="p-3 text-right font-bold text-amber-400">+6 水</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">六对半</td>
                <td className="p-3 text-slate-300 font-sans">六组对子 + 1单张</td>
                <td className="p-3 text-right font-bold text-amber-400">+4 水</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gunshot & Grand Slam Formula */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-400" />
          <span>4. 打枪与全垒打翻倍机制</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2">
            <span className="font-bold text-rose-400">💥 打枪 (Gun Shot · 2倍)</span>
            <p className="text-slate-400 leading-relaxed">
              在与某一位对手 1v1 对比时，若头道、中道、尾道三道全部获胜（3-0横扫），即触发「打枪」，该对手输给你的总水数立即<strong>翻倍 (x2)</strong>。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2">
            <span className="font-bold text-amber-400">🏆 全垒打 (Grand Slam / 全胜 · 4倍)</span>
            <p className="text-slate-400 leading-relaxed">
              若某一位玩家在本局中同时打枪了同桌其他全部 3 位玩家（全场 3 连打枪），即达成「全垒打」，通杀全场，总积分在打枪翻倍的基础上<strong>再次翻倍 (x4)</strong>！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
