/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { GameTable } from './components/GameTable';
import { WebClientPreview } from './components/WebClientPreview';
import { CloudflareTunnelGuide } from './components/CloudflareTunnelGuide';
import { TelegramBotConsole } from './components/TelegramBotConsole';
import { GitHubHub } from './components/GitHubHub';
import { CodeViewer } from './components/CodeViewer';
import { TermuxSimulator } from './components/TermuxSimulator';
import { DeploymentGuide } from './components/DeploymentGuide';
import { RulesBook } from './components/RulesBook';
import { AuthModal } from './components/AuthModal';
import { BotConfigGuideModal } from './components/BotConfigGuideModal';
import { getStoredUser, UserProfile } from './utils/authStorage';
import { GO_SOURCE_FILES } from './utils/goSources';
import { Download, X, CheckCircle2, FileText, Bot, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('webclient');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBotGuideModal, setShowBotGuideModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [standalonePlayerMode, setStandalonePlayerMode] = useState(false);

  // Export full Go codebase bundle as a single shell script package
  const handleExportAllCode = () => {
    let scriptContent = '#!/usr/bin/env bash\n# 十三水 (Chinese Poker) Go 源码全集与 Telegram Bot 自动构建包\nmkdir -p shisanshui/cmd/server shisanshui/cmd/client shisanshui/pkg/game shisanshui/pkg/bot shisanshui/web/cards shisanshui/.github/workflows\ncd shisanshui\n\n';

    GO_SOURCE_FILES.forEach((f) => {
      scriptContent += `cat << 'EOF' > ${f.path}\n${f.code}\nEOF\n\n`;
    });

    scriptContent += 'echo "✓ 十三水 Go 源码与 Telegram Bot 模块生成完成！正在编译..."\n';
    scriptContent += 'go mod tidy 2>/dev/null || true\n';
    scriptContent += 'go build -o server cmd/server/main.go\n';
    scriptContent += 'go build -o client cmd/client/main.go\n';
    scriptContent += 'echo "✓ 编译成功！运行 ./server 启动服务端，运行 ./client 启动客户端。"\n';

    const blob = new Blob([scriptContent], { type: 'text/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shisanshui_full_project.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      setShowExportModal(false);
    }, 2500);
  };

  if (standalonePlayerMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
        {/* Floating exit button to return to developer workbench */}
        <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono shadow-lg backdrop-blur-sm hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>当前为部署后玩家独立纯净视角 (无开发者控制栏)</span>
          </div>
          <button
            onClick={() => setStandalonePlayerMode(false)}
            className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-xl cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>返回站长工作台 ✕</span>
          </button>
        </div>
        <GameTable />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadCode={() => setShowExportModal(true)}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenBotGuide={() => setShowBotGuideModal(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'game' && <GameTable />}
        {activeTab === 'webclient' && (
          <WebClientPreview
            onOpenGame={() => setActiveTab('game')}
            onToggleStandalonePlayerMode={() => setStandalonePlayerMode(true)}
          />
        )}
        {activeTab === 'cftunnel' && <CloudflareTunnelGuide />}
        {activeTab === 'tgbot' && <TelegramBotConsole />}
        {activeTab === 'github' && <GitHubHub />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'termux' && <TermuxSimulator />}
        {activeTab === 'deploy' && <DeploymentGuide />}
        {activeTab === 'rules' && <RulesBook />}
      </main>

      {/* Export Code Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">导出 Go 语言全套工程包 (支持 GitHub / TG Bot)</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              将打包导出全部 <strong className="text-amber-400">12 个 Go 核心模块文件</strong>、Telegram Bot 运维控制器、GitHub Actions CI/CD 配置与 Termux 自动化构建脚本。
              下载后执行 <code className="px-1.5 py-0.5 bg-slate-950 rounded text-emerald-400 font-mono">bash shisanshui_full_project.sh</code> 即可自动生成完整工程。
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>包含文件清单:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span>• cmd/server/main.go</span>
                <span>• cmd/client/main.go</span>
                <span>• web/index.html (网页端)</span>
                <span>• CLOUDFLARE_TUNNEL_DEPLOY.md</span>
                <span>• pkg/bot/telegram.go</span>
                <span>• pkg/game/stats.go</span>
                <span>• pkg/game/card.go</span>
                <span>• pkg/game/evaluator.go</span>
                <span>• pkg/game/special.go</span>
                <span>• pkg/game/solver.go</span>
                <span>• pkg/game/room.go</span>
                <span>• .github/workflows/build.yml</span>
                <span>• start.sh (一键启动)</span>
                <span>• config.example.json</span>
              </div>
            </div>

            {downloadSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>全套源码已成功打包下载！可直接推送至 GitHub 仓库</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleExportAllCode}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>立即下载项目脚本 (.sh)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Auth & Profile Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUserChange={(updated) => setCurrentUser(updated)}
      />

      {/* Bot Configuration Guide Modal */}
      <BotConfigGuideModal
        isOpen={showBotGuideModal}
        onClose={() => setShowBotGuideModal(false)}
      />

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>🀄 十三水 (Chinese Poker) Go 多人对战系统</span>
          <span>·</span>
          <span>支持 Telegram Bot 远程运维 & GitHub Actions 自动编译</span>
        </div>
        <div className="text-slate-600">
          Android Termux 原生轻量运行 · 局域网开黑
        </div>
      </footer>
    </div>
  );
}
