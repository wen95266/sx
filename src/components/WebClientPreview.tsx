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
  Sparkles
} from 'lucide-react';

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
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'svg_guide' | 'deploy_diff'>('preview');

  // Generate share link
  const fullShareUrl = `${cfDomain.replace(/\/+$/, '')}/?room=${roomId}&name=${encodeURIComponent(playerName)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const svgGitPushCmd = `# 1. 在本地克隆的仓库根目录下创建 cards 文件夹
mkdir -p web/cards

# 2. 将您的 52 张 SVG 牌面及 1 张牌背放入 web/cards/ 目录
# 命名格式: {花色}_{点数}.svg，例如: spades_A.svg, hearts_K.svg, card_back.svg

# 3. 提交并推送到 GitHub
git add web/cards/
git commit -m "feat: upload custom SVG poker cards"
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
              玩家免安装 App
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-mono">
              Cloudflare 隧道直连
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono">
              支持自定义 SVG 扑克
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif mt-1 flex items-center gap-2">
            <span>📱</span> 玩家手机/网页对战端 (Web Client)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Go 服务端原生托管 HTML5 网页与 WebSocket。玩家直接在手机（微信/Safari/Chrome）打开您的 Cloudflare 域名即可进入牌局。
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

      {/* Two Critical Questions Answer Cards (Directly addressing user prompts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Answer 1: Where should SVG cards go */}
        <div
          onClick={() => setActiveSubTab('svg_guide')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            activeSubTab === 'svg_guide'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100">① SVG 扑克牌图片放在哪里？</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">web/cards/</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                存放在项目中的 <code className="text-emerald-400 font-mono">web/cards/</code> 目录！
                按 <code className="text-amber-300 font-mono">spades_A.svg</code>、<code className="text-amber-300 font-mono">hearts_K.svg</code> 规则命名。Go 服务端已自动配置静态托管并支持智能平滑降级。
              </p>
            </div>
          </div>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 self-end">
            <span>查看完整命名表与上传指南 →</span>
          </div>
        </div>

        {/* Answer 2: Is current preview the deployed page */}
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
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300">对比说明</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                当前是<strong>站长开发工作台</strong>（包含代码、TG 机器人等标签）。部署后玩家打开域名时，<strong>只会看到纯粹的绿色牌桌与弹幕</strong>，没有任何顶栏和调试工具！
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
          onClick={() => setActiveSubTab('svg_guide')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeSubTab === 'svg_guide'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          🎴 SVG 扑克牌目录与命名规范
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

      {/* SUBTAB 1: SVG CARDS PLACEMENT & NAMING GUIDE */}
      {activeSubTab === 'svg_guide' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-400" />
                <span>SVG 扑克牌存放路径与 54 张牌命名全集</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                请在您的 GitHub 仓库的 <code className="text-emerald-400 font-mono">web/cards/</code> 目录下存放所有 SVG 文件。
              </p>
            </div>
            <button
              onClick={handleCopySvgCmd}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors self-start md:self-auto"
            >
              {copiedSvgCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSvgCmd ? '已复制 Git 命令' : '复制新建与推送命令'}</span>
            </button>
          </div>

          {/* Directory Tree Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              <div className="text-slate-400 mb-2 font-bold flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>GitHub 仓库标准目录结构：</span>
              </div>
              <div className="text-slate-300 leading-relaxed text-[11px]">
                <div className="text-amber-400">shisanshui/</div>
                <div>├── cmd/</div>
                <div>│&nbsp;&nbsp; └── server/main.go</div>
                <div>├── pkg/</div>
                <div className="text-emerald-400 font-bold">├── web/</div>
                <div>│&nbsp;&nbsp; ├── index.html &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 前端页面</span></div>
                <div className="text-emerald-300 font-bold">│&nbsp;&nbsp; └── cards/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400 font-bold"># ★ SVG图片全部放这里</span></div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── spades_A.svg &nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 黑桃A</span></div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── hearts_K.svg &nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 红桃K</span></div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── clubs_10.svg &nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 梅花10</span></div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── diamonds_7.svg &nbsp;<span className="text-slate-500"># 方块7</span></div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └── card_back.svg &nbsp;&nbsp;<span className="text-slate-500"># 牌背</span></div>
                <div>└── start.sh</div>
              </div>
            </div>

            {/* Naming rules */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>命名规范公式：<code className="text-amber-300">{`{花色}_{点数}.svg`}</code></span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-bold text-slate-100 flex items-center gap-1 mb-1">
                      <span>♠ 黑桃</span>
                      <span className="text-slate-400 text-[10px]">spades</span>
                    </div>
                    <div className="text-slate-400 text-[10px] leading-relaxed">
                      spades_2.svg<br />...<br />spades_10.svg<br />spades_J.svg<br />spades_Q.svg<br />spades_K.svg<br />spades_A.svg
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                      <span>♥ 红桃</span>
                      <span className="text-slate-400 text-[10px]">hearts</span>
                    </div>
                    <div className="text-slate-400 text-[10px] leading-relaxed">
                      hearts_2.svg<br />...<br />hearts_10.svg<br />hearts_J.svg<br />hearts_Q.svg<br />hearts_K.svg<br />hearts_A.svg
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-bold text-slate-100 flex items-center gap-1 mb-1">
                      <span>♣ 梅花</span>
                      <span className="text-slate-400 text-[10px]">clubs</span>
                    </div>
                    <div className="text-slate-400 text-[10px] leading-relaxed">
                      clubs_2.svg<br />...<br />clubs_10.svg<br />clubs_J.svg<br />clubs_Q.svg<br />clubs_K.svg<br />clubs_A.svg
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                      <span>♦ 方块</span>
                      <span className="text-slate-400 text-[10px]">diamonds</span>
                    </div>
                    <div className="text-slate-400 text-[10px] leading-relaxed">
                      diamonds_2.svg<br />...<br />diamonds_10.svg<br />diamonds_J.svg<br />diamonds_Q.svg<br />diamonds_K.svg<br />diamonds_A.svg
                    </div>
                  </div>
                </div>
              </div>

              {/* Graceful Fallback Explanation */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 leading-relaxed">
                <strong>🛡️ 智能免崩溃降级机制：</strong>
                我们已经在 Go 服务端路由与前端网页加入了自动容错监听。在您上传 SVG 图片前（或某张图片路径有误时），系统会自动无缝呈现内置的高清矢量牌面，绝不会出现红叉或界面变形！
              </div>
            </div>
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
                    {/* 13 small face-down cards */}
                    <div className="flex -space-x-1 mt-1">
                      {[...Array(13)].map((_, i) => (
                        <div key={i} className="w-3 h-5 rounded-[2px] bg-blue-800 border border-blue-400/50 shadow-xs" />
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
                      <div className="grid grid-cols-2 gap-0.5 mt-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-4 rounded-[2px] bg-rose-800 border border-rose-400/50" />
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
                      <div className="grid grid-cols-2 gap-0.5 mt-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-4 rounded-[2px] bg-indigo-800 border border-indigo-400/50" />
                        ))}
                      </div>
                      <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded mt-1">已理牌</span>
                    </div>
                  </div>

                  {/* Bottom (Current Player Arrangement Area) */}
                  <div className="relative z-10 bg-slate-950/80 border-t border-amber-500/30 p-2.5 flex flex-col gap-2 rounded-b-xl">
                    {/* 3 Duns Arrangement Slots */}
                    <div className="flex flex-col gap-1 text-[10px]">
                      {/* Head: 3 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">头道 (3张) · 冲三</span>
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-950 font-bold font-mono text-[10px] shadow-xs">♠K</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[10px] shadow-xs">♥K</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-950 font-bold font-mono text-[10px] shadow-xs">♣K</span>
                        </div>
                      </div>

                      {/* Middle: 5 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">中道 (5张) · 葫芦</span>
                        <div className="flex gap-1">
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥Q</span>
                          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-950 font-bold font-mono text-[9px]">♠Q</span>
                          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-950 font-bold font-mono text-[9px]">♣Q</span>
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♦10</span>
                          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-950 font-bold font-mono text-[9px]">♠10</span>
                        </div>
                      </div>

                      {/* Tail: 5 cards */}
                      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/40 rounded-lg px-2 py-1">
                        <span className="text-amber-300 font-bold text-[9px]">尾道 (5张) · 同花顺</span>
                        <div className="flex gap-1">
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥A</span>
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥K</span>
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥Q</span>
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥J</span>
                          <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-600 font-bold font-mono text-[9px]">♥10</span>
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
