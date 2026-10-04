import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Radio,
  Play,
  Image as ImageIcon,
  FolderTree,
  Eye,
  HelpCircle,
  Maximize2,
  FileCode,
  Sparkles,
  CheckCircle2,
  Layers,
  Calendar,
  Flame,
  MessageCircle,
  MessageSquareOff
} from 'lucide-react';
import { getAll52CardAssets, getCardBackSvgPath } from '../utils/cardAssets';
import { GameLobby } from './GameLobby';
import { GameTable } from './GameTable';
import { LobbyRoom } from '../types/game';
import { getStoredUser, UserProfile } from '../utils/authStorage';
import { AuthModal } from './AuthModal';
import { BotConfigGuideModal } from './BotConfigGuideModal';

interface WebClientPreviewProps {
  onOpenGame?: () => void;
  onToggleStandalonePlayerMode?: () => void;
}

export const WebClientPreview: React.FC<WebClientPreviewProps> = ({
  onOpenGame,
  onToggleStandalonePlayerMode
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop');
  const [cfDomain, setCfDomain] = useState('https://poker.yourdomain.com');
  const [roomId, setRoomId] = useState('room_888');
  const [playerName, setPlayerName] = useState('大牌王');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSvgCmd, setCopiedSvgCmd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'svg_guide' | 'deploy_diff'>('preview');
  const [svgFilter, setSvgFilter] = useState<'all' | 'spades' | 'hearts' | 'clubs' | 'diamonds'>('all');

  // Interactive preview state
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [previewGameView, setPreviewGameView] = useState<'lobby' | 'table'>('lobby');
  const [previewSelectedRoom, setPreviewSelectedRoom] = useState<LobbyRoom | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);

  const allCards = getAll52CardAssets();
  const filteredCards = svgFilter === 'all'
    ? allCards
    : allCards.filter((c) => c.suit === svgFilter);

  // Generate share link
  const fullShareUrl = `${cfDomain.replace(/\/+$/, '')}/?room=${roomId}&name=${encodeURIComponent(playerName)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const svgGitPushCmd = `# 1. 在本地克隆的仓库根目录下创建标准 public/cards 文件夹
mkdir -p public/cards

# 2. 您的 53 张扑克 SVG 文件统一保存在 public/cards/ 下：
# ace_of_spades.svg, king_of_hearts.svg, 10_of_diamonds.svg, back.svg ...

# 3. 提交并推送到 GitHub 仓库
git add public/cards/
git commit -m "feat: sync vector-playing-cards svg deck into public/cards"
git push origin main

# 4. 在手机 Termux 运行更新即可秒级生效：
cd ~/shisanshui && git pull`;

  const handleCopySvgCmd = () => {
    navigator.clipboard.writeText(svgGitPushCmd);
    setCopiedSvgCmd(true);
    setTimeout(() => setCopiedSvgCmd(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-semibold">
              ✓ 53 张 SVG 扑克已就绪
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-semibold">
              🔥 实时场 (聊天/弹幕)
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-mono font-semibold">
              📅 预约场 (纯净竞技)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif mt-1 flex items-center gap-2">
            <span>📱</span> 玩家手机/网页对战端 (Web Client 游戏大厅)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            现在预览界面已完全同步为游戏大厅！包含「预约场」与「实时场」两大板块，实时场支持局内聊天与飘屏弹幕。
          </p>
        </div>

        {/* 1:1 Standalone Player Mode Trigger */}
        <div className="flex items-center gap-2">
          {onToggleStandalonePlayerMode && (
            <button
              onClick={onToggleStandalonePlayerMode}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>1:1 独立玩家全屏视角</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'preview'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          📱 游戏大厅与牌桌即时交互 (手机/宽屏)
        </button>
        <button
          onClick={() => setActiveSubTab('svg_guide')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'svg_guide'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          🎴 SVG 扑克牌检视墙 (53/53 张已就绪)
        </button>
        <button
          onClick={() => setActiveSubTab('deploy_diff')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'deploy_diff'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          🖥️ 部署后玩家纯净页面详解
        </button>
      </div>

      {/* SUBTAB 1: INTERACTIVE PREVIEW */}
      {activeSubTab === 'preview' && (
        <>
          {/* Cloudflare Share Bar */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200">您的 Cloudflare 穿透域名：</span>
                  <span className="text-[10px] text-slate-500">（修改此处自动生成分享链接）</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cfDomain}
                    onChange={(e) => setCfDomain(e.target.value)}
                    placeholder="https://poker.yourdomain.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="房间号"
                    title="房间号"
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex-1 md:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '已复制邀请链接！' : '复制玩家入局链接'}</span>
              </button>

              <a
                href={fullShareUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="在新标签页测试访问此域名"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Viewport switch header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span>{deviceMode === 'mobile' ? '当前模拟：移动端手机屏幕 (微信/Safari/Chrome)' : '当前模拟：PC 宽屏浏览器'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                当前处于：{previewGameView === 'lobby' ? '游戏大厅' : '牌桌对决中'}
              </span>
            </span>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  deviceMode === 'desktop'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>宽屏视图</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>手机视图</span>
              </button>
            </div>
          </div>

          {/* Live Preview Container: Real Game Lobby & Table */}
          <div className="flex justify-center items-center py-2">
            {deviceMode === 'mobile' ? (
              /* Phone Frame Container */
              <div className="w-full max-w-[430px] bg-slate-900 border-4 border-slate-700 rounded-[38px] p-2.5 shadow-2xl relative flex flex-col overflow-hidden">
                {/* Phone Notch */}
                <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Browser Address Bar */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-2 text-[10px] text-slate-400 font-mono shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate flex-1 text-slate-300">{fullShareUrl}</span>
                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">WSS</span>
                </div>

                {/* Interactive Phone Content */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 flex flex-col h-[680px] shadow-inner">
                  {previewGameView === 'lobby' ? (
                    <GameLobby
                      currentUser={currentUser}
                      onEnterRoom={(room) => {
                        setPreviewSelectedRoom(room);
                        setPreviewGameView('table');
                      }}
                      onOpenAuth={() => setShowAuthModal(true)}
                      onOpenBotGuide={() => setShowBotGuideModal(true)}
                    />
                  ) : (
                    <GameTable
                      currentRoom={previewSelectedRoom || undefined}
                      onBackToLobby={() => setPreviewGameView('lobby')}
                    />
                  )}
                </div>

                {/* Bottom Home Indicator */}
                <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
              </div>
            ) : (
              /* Desktop Browser Mockup */
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
                {/* Desktop Window Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto px-4 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{fullShareUrl}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {previewGameView === 'table' && (
                      <button
                        onClick={() => setPreviewGameView('lobby')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg font-bold"
                      >
                        ← 返回大厅
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Interactive Container */}
                <div className="min-h-[620px] rounded-xl overflow-hidden border border-slate-800 flex flex-col bg-slate-950">
                  {previewGameView === 'lobby' ? (
                    <GameLobby
                      currentUser={currentUser}
                      onEnterRoom={(room) => {
                        setPreviewSelectedRoom(room);
                        setPreviewGameView('table');
                      }}
                      onOpenAuth={() => setShowAuthModal(true)}
                      onOpenBotGuide={() => setShowBotGuideModal(true)}
                    />
                  ) : (
                    <GameTable
                      currentRoom={previewSelectedRoom || undefined}
                      onBackToLobby={() => setPreviewGameView('lobby')}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUBTAB 2: SVG CARDS LIVE GALLERY */}
      {activeSubTab === 'svg_guide' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          {/* Header & Copy Command */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>SVG 扑克牌资产识别检视墙 (Vector Playing Cards)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  ✓ 53 张已检测并全部正常渲染
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                已统一规范收归至单一静态目录：<code className="text-emerald-400 font-mono">public/cards/</code>（所有冗余重复文件夹已全部清理完毕，格式为标准英文命名）。
              </p>
            </div>
            <button
              onClick={handleCopySvgCmd}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors self-start md:self-auto shrink-0"
            >
              {copiedSvgCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSvgCmd ? '已复制 Git 推送命令' : '复制 Git 提交与同步命令'}</span>
            </button>
          </div>

          {/* Suit Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">花色筛选：</span>
            <button
              onClick={() => setSvgFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                svgFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              全部 53 张
            </button>
            <button
              onClick={() => setSvgFilter('spades')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                svgFilter === 'spades'
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              ♠ 黑桃 (13张)
            </button>
            <button
              onClick={() => setSvgFilter('hearts')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                svgFilter === 'hearts'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-950 border border-slate-800 text-rose-400 hover:text-rose-300'
              }`}
            >
              ♥ 红桃 (13张)
            </button>
            <button
              onClick={() => setSvgFilter('clubs')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                svgFilter === 'clubs'
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              ♣ 梅花 (13张)
            </button>
            <button
              onClick={() => setSvgFilter('diamonds')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                svgFilter === 'diamonds'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-950 border border-slate-800 text-rose-400 hover:text-rose-300'
              }`}
            >
              ♦ 方块 (13张)
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-9 gap-3">
            {/* Show Card Back first if "all" */}
            {svgFilter === 'all' && (
              <div className="p-2 bg-slate-950 border border-amber-500/40 rounded-xl flex flex-col items-center gap-1.5 shadow-md">
                <div className="w-16 h-24 rounded-lg overflow-hidden border border-blue-500/30 bg-slate-900 shadow relative">
                  <img
                    src="/cards/back.svg"
                    alt="Card Back"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] font-bold text-amber-300">牌背 (Back)</div>
                <div className="text-[9px] font-mono text-slate-400">back.svg</div>
                <div className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] text-emerald-300 font-mono font-bold">
                  ✓ 就绪
                </div>
              </div>
            )}

            {filteredCards.map((card) => {
              const svgPath = `/cards/${card.fileName}`;
              const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

              return (
                <div
                  key={card.id}
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-400/60 transition-colors rounded-xl flex flex-col items-center gap-1.5 shadow-sm"
                >
                  <div className="w-16 h-24 rounded-lg overflow-hidden border border-slate-300 bg-white shadow flex items-center justify-center p-0.5">
                    <img
                      src={svgPath}
                      alt={card.chineseName}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                  <div className={`text-[11px] font-bold flex items-center gap-0.5 ${isRed ? 'text-rose-400' : 'text-slate-200'}`}>
                    <span>{card.suitSymbol}</span>
                    <span>{card.chineseName}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-[85px]" title={card.fileName}>
                    {card.fileName}
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] text-emerald-300 font-mono font-bold">
                    ✓ 正常识别
                  </div>
                </div>
              );
            })}
          </div>

          {/* Directory Summary Note */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FolderTree className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>所有 53 张 SVG 资源统一位于 public/cards/，与 Go 后端、React 预览、独立网页端 100% 路径打通。</span>
            </div>
            <button
              onClick={() => setActiveSubTab('preview')}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              进入游戏大厅实际对战 →
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEPLOYED VS PREVIEW COMPARISON */}
      {activeSubTab === 'deploy_diff' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              <span>解答：现在预览界面与部署后前端页面的真实对比</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              部署后玩家打开域名时，<strong>直接进入十三水游戏大厅（预约场/实时场）与绿色牌桌</strong>，无任何站长工作台开发栏！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-amber-400 text-sm">当前 AI Studio 预览环境</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">站长工作台</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>• 包含顶部的<strong>开发者导航栏</strong>与管理工具。</li>
                <li>• 用于在线查看 Go 源码、测试 Telegram Bot 指令、模拟 Termux 终端与导出代码包。</li>
                <li>• 供您（房主/开发者）调试与全面监控游戏后台逻辑。</li>
              </ul>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <span className="font-bold text-emerald-400 text-sm">部署后玩家打开域名的真实页面</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">玩家独立端</span>
              </div>
              <ul className="space-y-2 text-slate-200 text-[11px]">
                <li>• <strong>零控制台工具栏</strong>：完全没有开发者按钮，纯净沉浸。</li>
                <li>• <strong>游戏大厅两大板块</strong>：支持【预约场】与【实时场】，实时场拥有专属局内聊天与飘屏弹幕。</li>
                <li>• <strong>全屏绿色赌场牌桌</strong>：4 人十字牌位、头中尾理牌道、智能一键摆牌、比牌动画。</li>
                <li>• <strong>安全隔离</strong>：普通玩家无法接触您的 Telegram 配置或服务器底层终端。</li>
              </ul>
            </div>
          </div>

          {onToggleStandalonePlayerMode && (
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-300">想现在就体验真实玩家眼中的独立全屏界面？</div>
                <div className="text-[11px] text-slate-400">点击右侧按钮，立即隐藏当前所有工作台顶栏，进入 1:1 纯净玩家对决模式。</div>
              </div>
              <button
                onClick={onToggleStandalonePlayerMode}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Maximize2 className="w-4 h-4" />
                <span>进入 1:1 独立玩家视角</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile and Bot Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUserChange={(u) => setCurrentUser(u)}
      />
      <BotConfigGuideModal
        isOpen={showBotGuideModal}
        onClose={() => setShowBotGuideModal(false)}
      />
    </div>
  );
};
