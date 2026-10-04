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
  const [activeSubTab, setActiveSubTab] = useState<'quick' | 'full_doc' | 'network' | 'faq'>('quick');
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
        copyText('curl -sSL https://raw.githubusercontent.com/your-username/shisanshui/main/start.sh | bash', 'fallback');
      });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <span>十三水 Termux 完整部署与联机对战手册</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            包含 Android Termux 极速一键部署、GitHub 仓库同步、Telegram 机器人运维与后台防休眠配置。
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
            {`# 🀄 十三水 (Chinese Poker) Go 语言多人游戏 Termux 完整部署手册

## 1. 环境准备
• 必须使用 F-Droid 镜像下载 Termux (>= 0.118)，禁用 Google Play 停更版本。
• 开启后台防杀：在 Termux 输入 termux-wake-lock 防止锁屏断网。

## 2. GitHub 仓库推送
git init && git add . && git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shisanshui.git
git push -u origin main

## 3. Telegram 机器人配置
1) 找 @BotFather 输入 /newbot 获取 Token。
2) 找 @userinfobot 获取纯数字 Admin ID。
3) 启动命令: ./server -port=8080 -tg-token="TOKEN" -tg-admin="ADMIN_ID"

## 4. Termux 一键全自动启动
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/shisanshui/main/start.sh | bash
(自动检测依赖并安装、自动编译、后台拉起服务、自动进房发牌)`}
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
