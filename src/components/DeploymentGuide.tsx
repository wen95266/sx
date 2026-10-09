import React, { useState } from 'react';
import {
  Server,
  Wifi,
  ShieldAlert,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  BookOpen,
  Download,
  HelpCircle,
  BatteryCharging,
  Cpu,
  Zap,
  Radio
} from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'quick' | 'update' | 'full_doc' | 'network' | 'faq'>('quick');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadDeploymentMd = () => {
    fetch('/DEPLOYMENT.md')
      .then((res) => res.text())
      .then((text) => {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'DEPLOYMENT.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback
        copyText('cd ~/sx && git pull && rm -rf dist && npm run build && npm start', 'fallback');
      });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <span>十三水多系统部署与运维手册</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            包含 Android Termux、Linux VPS 与 Serv00 的极速部署、代码拉取更新、删除旧文件重新编译覆盖全套指南。
          </p>
        </div>

        <button
          onClick={handleDownloadDeploymentMd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>下载说明文档 (DEPLOYMENT.md)</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        {[
          { id: 'quick', label: '⚡ 一键极速流程' },
          { id: 'update', label: '🔄 代码更新与重编译覆盖' },
          { id: 'full_doc', label: '📖 详细部署手册 (DEPLOYMENT.md)' },
          { id: 'network', label: '📶 三种联机网络场景' },
          { id: 'faq', label: '❓ 常见问题排查 (FAQ)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Quick */}
      {activeSubTab === 'quick' && (
        <div className="flex flex-col gap-6">
          {/* Important Notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold block mb-1">⚠️ Termux 下载源关键提示</strong>
              Google Play 商店的 Termux 早已停更失效。请务必从{' '}
              <a
                href="https://f-droid.org/packages/com.termux/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline font-semibold"
              >
                F-Droid 官方镜像
              </a>{' '}
              下载最新版 Termux（版本号 $\ge 0.118$）。
            </div>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">STEP 01</span>
                  <span className="text-xs text-slate-500">代码入库</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">推送到 GitHub 仓库</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  在 GitHub 新建仓库 `shisanshui`，本地执行 `git push` 推送本项目全部文件。
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 break-all mb-2">
                  git remote add origin https://github.com/USER/shisanshui.git && git push -u origin main
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('git remote add origin https://github.com/USER/shisanshui.git && git push -u origin main', 'step1')
                }
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step1' ? '已复制命令' : '复制 Git 推送命令'}</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">STEP 02</span>
                  <span className="text-xs text-slate-500">一条龙全自动</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">Termux 单条命令运行</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  在手机 Termux 中直接粘贴执行单行命令，自动完成依赖安装、编译、后台启动并进游戏：
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 break-all mb-2">
                  curl -sSL https://raw.githubusercontent.com/USER/shisanshui/main/start.sh | bash
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('curl -sSL https://raw.githubusercontent.com/USER/shisanshui/main/start.sh | bash', 'step2')
                }
                className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step2' ? '已复制命令' : '一键复制单条启动命令'}</span>
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">STEP 03</span>
                  <span className="text-xs text-slate-500">好友同桌开黑</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">局域网好友连入</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  好友连入同一 WiFi 或热点，在手机 Termux 运行客户端连接房主 IP：
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 break-all mb-2">
                  ./client -server="192.168.1.xxx:8080" -name="好友小李"
                </div>
              </div>
              <button
                onClick={() => copyText('./client -server="192.168.1.108:8080" -name="好友小李"', 'step3')}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step3' ? '已复制命令' : '复制客户端连入命令'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Update & Clean Recompile */}
      {activeSubTab === 'update' && (
        <div className="flex flex-col gap-6">
          {/* Key Notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold block mb-1">
                💡 为什么拉取仓库更新后必须【删除旧文件】并重新编译覆盖？
              </strong>
              Vite 在打包构建时会生成带独立 ContentHash 的 JS/CSS 文件。如果不删除旧目录直接启动，旧的编译产物会残留堆积，甚至导致浏览器和客户端继续加载旧缓存。
              规范操作是：<strong>拉取代码 ➔ 彻底删除 dist 目录 ➔ 重新编译输出新文件 ➔ 重载/重启服务</strong>。
            </div>
          </div>

          {/* 3 Platform Update Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Termux */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">📱 Android Termux</span>
                  <span className="text-xs text-slate-500">手机端</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">拉取更新并重编译</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  先杀掉旧后台服务释放 8080 端口与内存，拉取代码后清理旧 `dist` 并重新编译启动：
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 break-all leading-relaxed mb-2">
                  cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start', 'update_termux')
                }
                className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'update_termux' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'update_termux' ? '已复制 Termux 更新命令' : '复制 Termux 一键更新'}</span>
              </button>
            </div>

            {/* 2. Linux VPS */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-sky-400">🐧 Linux VPS / 云服务器</span>
                  <span className="text-xs text-slate-500">PM2 / Systemd</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">生产级拉取与平滑重载</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  拉取代码后清除 `dist` 旧静态文件，重新执行 `npm run build`，并通过 PM2 零停机重载：
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-sky-300 break-all leading-relaxed mb-2">
                  cd /var/www/shisanshui && git pull && rm -rf dist && npm run build && pm2 reload shisanshui
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('cd /var/www/shisanshui && git pull && rm -rf dist && npm run build && pm2 reload shisanshui', 'update_linux')
                }
                className="w-full py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'update_linux' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'update_linux' ? '已复制 Linux 更新命令' : '复制 Linux PM2 一键更新'}</span>
              </button>
            </div>

            {/* 3. Serv00 */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">🌐 Serv00 虚拟主机</span>
                  <span className="text-xs text-slate-500">FreeBSD 512MB</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">杀旧进程防超限 + 低内存编译</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  先杀旧 node 腾出 512MB 配额，删旧文件后使用专属低内存模式 `build:lowmem` 编译覆盖：
                </p>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-amber-300 break-all leading-relaxed mb-2">
                  cd ~/sx && killall -9 node; git pull && rm -rf dist && npm run build:lowmem && nohup npm run start:lowmem &gt; server.log 2&gt;&amp;1 &amp;
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('cd ~/sx && killall -9 node; git pull && rm -rf dist && npm run build:lowmem && nohup npm run start:lowmem > server.log 2>&1 &', 'update_serv00')
                }
                className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'update_serv00' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'update_serv00' ? '已复制 Serv00 更新命令' : '复制 Serv00 一键更新'}</span>
              </button>
            </div>
          </div>

          {/* Detailed step breakdown */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>分步命令详解（建议按步骤执行以排查错误）</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col gap-1.5">
                <span className="font-semibold text-amber-300">步骤 1：拉取最新代码并安装可能新增的依赖</span>
                <code className="text-[11px] text-emerald-400 font-mono">git pull origin main && npm install</code>
                <span className="text-[11px] text-slate-500">拉取 GitHub 上的最新提交，自动同步 package.json 变更。</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col gap-1.5">
                <span className="font-semibold text-amber-300">步骤 2：彻底清除旧静态编译目录与缓存</span>
                <code className="text-[11px] text-emerald-400 font-mono">rm -rf dist node_modules/.vite (或 npm run clean)</code>
                <span className="text-[11px] text-slate-500">确保旧版本打包残留彻底删除，绝不留存带旧哈希的历史文件。</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col gap-1.5">
                <span className="font-semibold text-amber-300">步骤 3：全新编译并生成静态资源覆盖</span>
                <code className="text-[11px] text-emerald-400 font-mono">npm run build (Serv00使用: npm run build:lowmem)</code>
                <span className="text-[11px] text-slate-500">在 dist 目录生成全新优化的前端静态文件，耗时约数十秒。</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col gap-1.5">
                <span className="font-semibold text-amber-300">步骤 4：刷新客户端浏览器缓存</span>
                <span className="text-[11px] text-slate-400">电脑端按 <code className="text-emerald-300">Ctrl + F5</code> 强刷，手机端建议在无痕模式或清除浏览器缓存后重新进入。</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Document Viewer */}
      {activeSubTab === 'full_doc' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-slate-100 font-mono">DEPLOYMENT.md 完整内容预览</span>
            <button
              onClick={() => copyText(document.getElementById('full_doc_code')?.innerText || '', 'full_doc_copy')}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              {copiedKey === 'full_doc_copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'full_doc_copy' ? '已复制全文' : '复制全文 Markdown'}</span>
            </button>
          </div>

          <div id="full_doc_code" className="flex flex-col gap-4 font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
            {`# 🀄 十三水 (Chinese Poker) 全平台多人对战系统部署与运维手册

> 📦 官方开源仓库: https://github.com/wen95266/sx.git
> 💻 支持平台: Android Termux | Linux VPS (Ubuntu/Debian) | Serv00 (FreeBSD) | Docker

## 1. 跨平台统一极速起步
git clone https://github.com/wen95266/sx.git
cd sx
npm install
npm run build
npm start

## 2. 核心：代码更新、删除旧文件与重新编译覆盖
当远程仓库更新后，为了杜绝旧文件缓存残留或哈希错乱，必须在拉取更新后删除旧编译文件重新编译覆盖：

• Android Termux 手机端:
  pkill -f node
  git pull origin main && npm install
  rm -rf dist node_modules/.vite
  npm run build
  npm start
  一键命令: cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start

• Linux VPS 云服务器 (PM2 守护):
  cd /var/www/shisanshui
  git pull origin main && npm install
  rm -rf dist node_modules/.vite
  npm run build
  pm2 reload shisanshui
  一键命令: git pull && rm -rf dist && npm run build && pm2 reload shisanshui

• Serv00 (FreeBSD 512MB 内存严格配额):
  cd ~/sx
  killall -9 node
  git pull origin main
  rm -rf dist node_modules/.vite
  npm run build:lowmem
  nohup npm run start:lowmem > server.log 2>&1 &
  一键命令: cd ~/sx && killall -9 node; git pull && rm -rf dist && npm run build:lowmem && nohup npm run start:lowmem > server.log 2>&1 &

## 3. Telegram 机器人运维配置
在 .env 文件中设置:
PORT=8080
TG_BOT_TOKEN="你的Telegram_Bot_Token"
TG_ADMIN_ID="你的Telegram_User_ID"
启动命令: npm run bot

## 4. 免费公网联机 (Cloudflare Tunnel)
pkg install -y cloudflared
cloudflared tunnel --url http://127.0.0.1:8080
生成临时 HTTPS 网址即可分享好友跨网联机对战！`}
          </div>
        </div>
      )}

      {/* Tab 3: Network Scenarios */}
      {activeSubTab === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Wifi className="w-4 h-4" />
              <span>方案 A: 同一局域网 WiFi</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              家庭、宿舍、办公室中最常见方案。所有手机连接同一个 WiFi，房主在 Termux 输入 <code className="text-amber-300">ifconfig</code> 查询 <code className="text-emerald-300">wlan0</code> 地址（如 192.168.1.108），好友直接连入即可对战。
            </p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Radio className="w-4 h-4" />
              <span>方案 B: 手机个人热点</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              适合聚餐、露营、旅行中户外无 WiFi 场景。房主开启手机热点，其他 3 人连入房主热点。房主启动服务，好友直接连接 <code className="text-emerald-300">192.168.43.1:8080</code>。
            </p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>方案 C: 异地跨城远程联机</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              适合身处不同城市的玩家。推荐在手机安装 <strong>Tailscale</strong> 组建虚拟局域网，或者在 Termux 运行 <code className="text-emerald-300">ngrok http 8080</code> 获取公网域名，好友通过公网地址直连对战。
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: FAQ */}
      {activeSubTab === 'faq' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-amber-300">Q1: 执行 pkg update 时报错提示无法连接或 404？</span>
            <p className="text-slate-400 leading-relaxed">
              Termux 默认使用国外官方源。在终端中输入 <code className="text-emerald-400">termux-change-repo</code>，选择 Mirrors by Tsinghua（清华大学镜像源）即可高速下载。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-amber-300">Q2: 提示 bind: address already in use (端口被占用)？</span>
            <p className="text-slate-400 leading-relaxed">
              说明之前的服务端还在后台运行。输入 <code className="text-emerald-400">pkill -f "./server"</code> 杀掉旧进程，然后重新运行 <code className="text-emerald-400">bash start.sh</code> 即可。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-amber-300">Q3: 手机锁屏后好友就断开连接了？</span>
            <p className="text-slate-400 leading-relaxed">
              安卓系统休眠了 Termux 的 CPU。请在 Termux 运行 <code className="text-emerald-400">termux-wake-lock</code>，并在手机电池管理中把 Termux 的省电策略设为“无限制”。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
