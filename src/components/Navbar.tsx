import React from 'react';
import {
  Terminal,
  Download,
  Play,
  BookOpen,
  Code2,
  Server,
  Bot,
  Github,
  Globe,
  Cloud,
  Smartphone,
  User,
  Key
} from 'lucide-react';
import { UserProfile } from '../utils/authStorage';

export type NavTabType =
  | 'game'
  | 'webclient'
  | 'cftunnel'
  | 'tgbot'
  | 'github'
  | 'code'
  | 'termux'
  | 'deploy'
  | 'rules';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onDownloadCode: () => void;
  currentUser?: UserProfile;
  onOpenAuth?: () => void;
  onOpenBotGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadCode,
  currentUser,
  onOpenAuth,
  onOpenBotGuide
}) => {
  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 gap-2">
      {/* Zone 1: Brand single text wordmark */}
      <div className="flex items-center justify-between md:justify-start gap-3">
        <button
          onClick={() => setActiveTab('game')}
          className="text-base md:text-xl font-bold tracking-tight text-amber-400 font-serif flex items-center gap-1.5 cursor-pointer"
        >
          <span>🀄</span> 十三水 Go · Termux
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            CF 隧道已适配
          </span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
            TG-Bot+Git
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="flex items-center gap-2 md:gap-4 text-xs font-medium text-slate-300 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'game'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="font-bold">🀄 游戏大厅</span>
        </button>

        <button
          onClick={() => setActiveTab('webclient')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'webclient'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : 'hover:text-white text-emerald-300/80'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">📱 大厅设计预览</span>
        </button>

        <button
          onClick={() => setActiveTab('cftunnel')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'cftunnel'
              ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'hover:text-white text-sky-300/80'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span>Cloudflare 穿透</span>
        </button>

        <button
          onClick={() => setActiveTab('tgbot')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'tgbot'
              ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-sky-400" />
          <span>TG 机器人</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'github'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub 部署</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'code'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>源码全集</span>
        </button>

        <button
          onClick={() => setActiveTab('termux')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'termux'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Termux 终端</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 whitespace-nowrap ${
            activeTab === 'rules'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>规则秘籍</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        {onOpenBotGuide && (
          <button
            onClick={onOpenBotGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="查看 Bot ID 与 Token 配置位置与使用指南"
          >
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Bot配置</span>
          </button>
        )}

        {currentUser && onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="管理玩家昵称、头像与战绩"
          >
            <span>{currentUser.avatar}</span>
            <span className="hidden sm:inline font-bold">{currentUser.nickname}</span>
            <span className="text-[10px] text-amber-400 font-mono">({currentUser.chips}水)</span>
          </button>
        )}

        <button
          onClick={onDownloadCode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出完整代码包</span>
        </button>
      </div>
    </header>
  );
};
