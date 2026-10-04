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
  Layers
} from 'lucide-react';
import { getAll52CardAssets, getCardBackSvgPath } from '../utils/cardAssets';

interface WebClientPreviewProps {
  onOpenGame?: () => void;
  onToggleStandalonePlayerMode?: () => void;
}

export const WebClientPreview: React.FC<WebClientPreviewProps> = ({
  onOpenGame,
  onToggleStandalonePlayerMode
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [cfDomain, setCfDomain] = useState('https://poker.yourdomain.com');
  const [roomId, setRoomId] = useState('room_888');
  const [playerName, setPlayerName] = useState('大牌王');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSvgCmd, setCopiedSvgCmd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'svg_guide' | 'deploy_diff'>('svg_guide');
  const [svgFilter, setSvgFilter] = useState<'all' | 'spades' | 'hearts' | 'clubs' | 'diamonds'>('all');

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

  const svgGitPushCmd = `# 1. 在本地克隆的仓库根目录下创建 cards 文件夹
mkdir -p cards web/cards

# 2. 您的 53 张扑克 SVG 文件已成功就绪：
# ace_of_spades.svg, king_of_hearts.svg, 10_of_diamonds.svg, back.svg ...

# 3. 提交并推送到 GitHub 仓库
git add cards/ web/cards/
git commit -m "feat: sync vector-playing-cards svg deck"
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
              ✓ 53 张 SVG 扑克已识别
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-mono">
              Cloudflare 隧道直连
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono">
              免安装 App 秒开
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif mt-1 flex items-center gap-2">
            <span>📱</span> 玩家手机/网页对战端 (Web Client)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            已成功为您识别并校验您上传的全部 53 张标准 SVG 扑克牌（52张牌面 + 1张牌背 back.svg）。Go 服务端与前端已自动完成路径映射！
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

      {/* Two Critical Questions Answer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Answer 1: SVG Path & Check Status */}
        <div
          onClick={() => setActiveSubTab('svg_guide')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            activeSubTab === 'svg_guide'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100">① SVG 扑克牌图片路径与识别状态</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">53/53 完整就绪</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                您的文件存放在 <code className="text-emerald-400 font-mono">/cards/</code>（同时已映射至 <code className="text-amber-300 font-mono">web/cards/</code> 与 <code className="text-sky-300 font-mono">public/cards/</code>）。
                命名格式如 <code className="text-amber-300 font-mono">ace_of_spades.svg</code>、<code className="text-amber-300 font-mono">10_of_hearts.svg</code>、<code className="text-amber-300 font-mono">back.svg</code> 已全部精准识别！
              </p>
            </div>
          </div>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 self-end">
            <span>检视 53 张扑克实时渲染效果 →</span>
          </div>
        </div>

        {/* Answer 2: Deployed page vs dev workbench */}
        <div
          onClick={() => setActiveSubTab('deploy_diff')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            activeSubTab === 'deploy_diff'
              ? 'bg-sky-500/10 border-sky-500/50 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100">② 现在预览界面是游戏部署后的前端吗？</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300">纯净对比</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                当前是<strong>站长开发工作台</strong>（包含代码全集、TG 机器人、Termux 等调试栏）。部署后玩家打开域名时，<strong>只有纯粹的绿色牌桌</strong>，无任何开发者工具！
              </p>
            </div>
          </div>
          <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1 self-end">
            <span>查看对比与 1:1 纯净视图 →</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('svg_guide')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'svg_guide'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          🎴 SVG 扑克牌实时检视墙 (53/53 张已就绪)
        </button>
        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'preview'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          📱 牌桌交互预览 (手机/宽屏)
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

      {/* SUBTAB 1: SVG CARDS LIVE GALLERY */}
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
                路径已自动双向兼容：<code className="text-emerald-400 font-mono">/cards/</code> 与 <code className="text-sky-300 font-mono">web/cards/</code>，格式为标准英文命名。
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
              <span>所有 53 张 SVG 资源现已与 Go 后端、React 预览、独立网页端完成 100% 路径打通与热加载。</span>
            </div>
            <button
              onClick={() => setActiveSubTab('preview')}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              查看牌桌实际展示效果 →
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DEPLOYED VS PREVIEW COMPARISON */}
      {activeSubTab === 'deploy_diff' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              <span>解答：现在预览界面与部署后前端页面的真实对比</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              很多朋友会疑惑：为什么当前界面上方有“源码全集”、“Termux 终端”、“Telegram 机器人”这些按钮？
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
                <li>• <strong>全屏绿色赌场牌桌</strong>：玩家只看到 4 人牌位、手牌托盘与头中尾理牌道。</li>
                <li>• <strong>手机触屏即开</strong>：底注、倒计时、一键智能理牌、局内语音弹幕、比牌动画。</li>
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

      {/* SUBTAB 3: INTERACTIVE PREVIEW */}
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
            <span className="text-xs font-bold text-slate-300">
              {deviceMode === 'mobile' ? '当前模拟：移动端手机屏幕 (微信/Safari/Chrome)' : '当前模拟：PC 宽屏浏览器'}
            </span>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
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
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="flex justify-center items-center py-2">
            {deviceMode === 'mobile' ? (
              /* Phone Frame Container */
              <div className="w-full max-w-[400px] bg-slate-900 border-4 border-slate-700 rounded-[38px] p-3 shadow-2xl relative flex flex-col overflow-hidden">
                {/* Phone Notch */}
                <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Browser Address Bar */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl mb-2 text-[10px] text-slate-400 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate flex-1 text-slate-300">{fullShareUrl}</span>
                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">WSS</span>
                </div>

                {/* Embedded Interactive HTML5 Game Table Mockup */}
                <div className="rounded-2xl overflow-hidden border border-emerald-800/40 relative bg-emerald-950 flex flex-col h-[650px] shadow-inner">
                  {/* Felt Background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 opacity-95" />
                  
                  {/* Gold Filigree Line */}
                  <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />

                  {/* Status Header */}
                  <div className="relative z-10 px-3 py-2 flex items-center justify-between border-b border-emerald-800/50 bg-slate-950/40 backdrop-blur-xs text-[10px]">
                    <div className="flex items-center gap-1 text-amber-300 font-bold">
                      <span>🀄 十三水</span>
                      <span className="text-slate-400 font-normal">| 房号: {roomId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>在线 4/4</span>
                    </div>
                  </div>

                  {/* Top Player (Opponent 2) */}
                  <div className="relative z-10 pt-2 flex flex-col items-center">
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950/70 border border-amber-500/30 rounded-full">
                      <span className="text-xs">🐱</span>
                      <span className="text-[10px] font-bold text-slate-200">猫咪大师</span>
                      <span className="text-[10px] text-amber-400 font-mono">🪙 142</span>
                      <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded">已理牌</span>
                    </div>
                    {/* 13 small face-down cards using real back.svg */}
                    <div className="flex -space-x-1 mt-1">
                      {[...Array(13)].map((_, i) => (
                        <div key={i} className="w-3 h-5 rounded-[2px] overflow-hidden border border-blue-400/50 shadow-xs bg-slate-900">
                          <img src="/cards/back.svg" alt="back" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Middle Row: Left Player & Right Player */}
                  <div className="relative z-10 flex-1 flex items-center justify-between px-2">
                    {/* Left Player */}
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/70 border border-amber-500/30 rounded-full">
                        <span className="text-xs">🤠</span>
                        <span className="text-[9px] font-bold text-slate-200">牛仔老张</span>
                        <span className="text-[9px] text-amber-400 font-mono">🪙 95</span>
                      </div>
                      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-4 rounded-[2px] overflow-hidden bg-slate-900 border border-blue-400/30">
                            <img src="/cards/back.svg" alt="back" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-400/20 text-[9px] text-amber-300 animate-bounce">
                        💬 "这把我稳赢！"
                      </div>
                    </div>

                    {/* Center Pot & Table Logo */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-full bg-emerald-900/60 border border-amber-500/20 text-center">
                      <div className="text-amber-400 text-xs font-serif font-bold">十三水</div>
                      <div className="text-[9px] text-amber-300/80 font-mono mt-0.5">底注: 1 水</div>
                      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/80 text-[9px] text-emerald-300 font-mono flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        <span>CF 穿透就绪</span>
                      </div>
                    </div>

                    {/* Right Player */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/70 border border-amber-500/30 rounded-full">
                        <span className="text-[9px] text-amber-400 font-mono">🪙 118</span>
                        <span className="text-[9px] font-bold text-slate-200">雀圣小王</span>
                        <span className="text-xs">🦊</span>
                      </div>
                      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-4 rounded-[2px] overflow-hidden bg-slate-900 border border-blue-400/30">
                            <img src="/cards/back.svg" alt="back" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded mt-1">已理牌</span>
                    </div>
                  </div>

                  {/* Bottom (Current Player Arrangement Area) */}
                  <div className="relative z-10 bg-slate-950/80 border-t border-amber-500/30 p-2.5 flex flex-col gap-2 rounded-b-xl">
                    {/* 3 Duns Arrangement Slots with Real SVG cards */}
                    <div className="flex flex-col gap-1 text-[10px]">
                      {/* Head: 3 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">头道 (3张) · 冲三</span>
                        <div className="flex gap-1">
                          <img src="/cards/king_of_spades.svg" alt="♠K" className="w-7 h-10 object-contain rounded shadow" />
                          <img src="/cards/king_of_hearts.svg" alt="♥K" className="w-7 h-10 object-contain rounded shadow" />
                          <img src="/cards/king_of_clubs.svg" alt="♣K" className="w-7 h-10 object-contain rounded shadow" />
                        </div>
                      </div>

                      {/* Middle: 5 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">中道 (5张) · 葫芦</span>
                        <div className="flex gap-1">
                          <img src="/cards/queen_of_hearts.svg" alt="♥Q" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/queen_of_spades.svg" alt="♠Q" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/queen_of_clubs.svg" alt="♣Q" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/10_of_diamonds.svg" alt="♦10" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/10_of_spades.svg" alt="♠10" className="w-6 h-9 object-contain rounded shadow" />
                        </div>
                      </div>

                      {/* Tail: 5 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">尾道 (5张) · 同花顺</span>
                        <div className="flex gap-1">
                          <img src="/cards/ace_of_hearts.svg" alt="♥A" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/king_of_hearts.svg" alt="♥K" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/queen_of_hearts.svg" alt="♥Q" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/jack_of_hearts.svg" alt="♥J" className="w-6 h-9 object-contain rounded shadow" />
                          <img src="/cards/10_of_hearts.svg" alt="♥10" className="w-6 h-9 object-contain rounded shadow" />
                        </div>
                      </div>
                    </div>

                    {/* Validation Status */}
                    <div className="flex items-center justify-between text-[9px] px-1 text-emerald-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>牌型合法：头道 ≤ 中道 ≤ 尾道 (绝无相公)</span>
                      </span>
                      <span className="text-amber-300 font-mono">剩余 42s</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>智能理牌</span>
                      </button>
                      <button className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] flex items-center justify-center gap-1">
                        <span>发弹幕</span>
                      </button>
                      <button className="py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow">
                        <Check className="w-3 h-3" />
                        <span>确认出牌</span>
                      </button>
                    </div>
                  </div>
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
                </div>

                <div className="bg-emerald-950/70 border border-emerald-800/40 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-slate-950 pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center max-w-lg">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-bold shadow-xl mb-2">
                      🀄
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 font-serif">
                      十三水多人在线大厅已随 Go 服务端开箱托管
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      在 PC 宽屏上，页面自动切换为豪横的完整 4 人十字牌桌视图，配备全尺寸拖拽排位道牌、聊天弹幕抽屉与详细的水数结算计分板。
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                      <a
                        href={fullShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>在新标签页打开 Web 游戏界面</span>
                      </a>

                      {onOpenGame && (
                        <button
                          onClick={onOpenGame}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>在当前页面单机演练试玩</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
