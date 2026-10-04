import React, { useState } from 'react';
import { Github, Zap, Check, Copy, Sparkles, FolderGit2, Rocket, ArrowRight, ShieldCheck } from 'lucide-react';

export const GitHubHub: React.FC = () => {
  const [repoUser, setRepoUser] = useState('your-github-username');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanUser = repoUser.trim() || 'your-github-username';
  const rawUrl = `https://raw.githubusercontent.com/${cleanUser}/shisanshui/main/start.sh`;
  const oneLinerCmd = `curl -sSL ${rawUrl} | bash`;
  const cloneCmd = `git clone https://github.com/${cleanUser}/shisanshui.git && cd shisanshui && bash start.sh`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const initGitScript = `# 1. 在本地项目文件夹初始化并提交
git init
git add .
git commit -m "feat: 十三水 Go 极简一键全自动版 (支持 Termux + Telegram Bot)"
git branch -M main

# 2. 关联并推送到您的 GitHub 远程仓库
git remote add origin https://github.com/${cleanUser}/shisanshui.git
git push -u origin main`;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Super One-Command Spotlight Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
              <Zap className="w-7 h-7 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                  终极极简体验
                </span>
                <span className="text-xs text-amber-300 font-mono">Zero-Config Automation</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif mt-0.5">
                无需记任何命令：只需一条命令，全自动搞定一切！
              </h2>
            </div>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
          不需要手动敲 <code className="text-amber-300">pkg install</code>，不需要手动敲 <code className="text-amber-300">go build</code>，更不需要手动查 IP！在手机 Termux 里直接粘贴这一条指令，系统全自动<strong>检查依赖 ➔ 自动安装 ➔ 自动拉取 ➔ 自动编译 ➔ 后台拉起服务 ➔ 直接带您进入牌局！</strong>
        </p>

        {/* GitHub Username Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/80 p-2 border border-slate-700/80 rounded-2xl">
          <span className="text-xs text-slate-400 pl-3 shrink-0">您的 GitHub 用户名：</span>
          <input
            type="text"
            value={repoUser}
            onChange={(e) => setRepoUser(e.target.value)}
            placeholder="例如: octocat"
            className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* The Golden One-Liner Box */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-slate-950 border border-amber-500/50 rounded-2xl shadow-inner">
          <div className="font-mono text-xs md:text-sm text-emerald-400 break-all select-all flex items-center gap-2">
            <span className="text-amber-400 font-bold">$</span>
            <span>{oneLinerCmd}</span>
          </div>

          <button
            onClick={() => handleCopy(oneLinerCmd, 'golden_oneliner')}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/25 active:scale-95 shrink-0 whitespace-nowrap"
          >
            {copiedKey === 'golden_oneliner' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'golden_oneliner' ? '已复制命令！直接粘贴到 Termux' : '一键复制全自动命令'}</span>
          </button>
        </div>

        {/* Automation Feature Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>自动安装 Go/Git 编译器</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>自动拉取最新源码</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>后台静默启动 WebSocket</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>直接唤起 TUI 发牌对战</span>
          </div>
        </div>
      </div>

      {/* Two-Column Detail Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Step 1: Push to GitHub */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">第一步</span>
              <span className="text-xs text-slate-500">仅需执行一次</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">把代码推送到您的 GitHub 仓库</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              在 GitHub 上新建一个仓库名为 <code className="text-amber-400">shisanshui</code>，然后在项目目录执行：
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              <code>{initGitScript}</code>
            </pre>
          </div>

          <button
            onClick={() => handleCopy(initGitScript, 'init_git')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedKey === 'init_git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'init_git' ? '已复制推送指令' : '复制 Git 推送指令'}</span>
          </button>
        </div>

        {/* Step 2: Alternative Git Clone & start.sh */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-sky-400">备选方案</span>
              <span className="text-xs text-slate-500">本地已克隆时</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">常规 Git Clone 方式启动</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              如果您喜欢先克隆到本地目录再运行，使用这条复合命令即可：
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              <code>{cloneCmd}</code>
            </pre>
          </div>

          <button
            onClick={() => handleCopy(cloneCmd, 'clone_cmd')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedKey === 'clone_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'clone_cmd' ? '已复制克隆命令' : '复制 Git Clone 命令'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
