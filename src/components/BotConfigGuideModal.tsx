import React, { useState } from 'react';
import {
  Bot,
  Key,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode,
  Sliders,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
  Play
} from 'lucide-react';

interface BotConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  initialAdminId?: string;
  onSaveConfig?: (token: string, adminId: string) => void;
}

export const BotConfigGuideModal: React.FC<BotConfigGuideModalProps> = ({
  isOpen,
  onClose,
  initialToken = '',
  initialAdminId = '',
  onSaveConfig
}) => {
  const [token, setToken] = useState(initialToken || '7182938491:AAH8F...YOUR_TOKEN');
  const [adminId, setAdminId] = useState(initialAdminId || '583920192');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig(token, adminId);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const isValidToken = /^\d+:[A-Za-z0-9_-]{35,}$/.test(token.trim());
  const isValidAdminId = /^\d{5,15}$/.test(adminId.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Telegram Bot 的 Token 与 ID 在哪里配置？</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                  运维配置向导
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                掌握 4 种官方支持的配置途径与 Telegram 官方获取凭证教程
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          {/* Quick Summary Banner */}
          <div className="bg-gradient-to-r from-sky-950/70 to-slate-900 border border-sky-500/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sky-300 font-semibold">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>核心答案：服务端支持以下 4 种配置位置（推荐第 1 或 第 2 种）</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-sky-400 font-bold">① 启动参数:</span>
                <code>./server -tg-token="xxx" -tg-admin="123"</code>
              </li>
              <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">② 配置文件:</span>
                <span>在 <code>shisanshui/config.json</code> 中填写</span>
              </li>
              <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold">③ 环境变量:</span>
                <code>export TG_BOT_TOKEN="xxx"</code>
              </li>
              <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">④ 界面配置:</span>
                <span>在「🤖 TG Bot 管理」标签输入并一键测试</span>
              </li>
            </ul>
          </div>

          {/* Interactive Form for testing and generating commands */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>在线填写并生成您的专属启动配置</span>
              </h3>
              <span className="text-[11px] text-slate-400">实时校验格式</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>1. Telegram Bot Token:</span>
                  <span className="text-[10px] text-slate-500">来自 @BotFather</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="例如: 7182938491:AAH8F5e...xKq"
                    className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none ${
                      isValidToken
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  {isValidToken && (
                    <span className="absolute right-2.5 top-2.5 text-emerald-400 text-[10px] flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> 格式正确
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>2. Admin Chat ID (纯数字):</span>
                  <span className="text-[10px] text-slate-500">来自 @userinfobot</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="例如: 583920192"
                    className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none ${
                      isValidAdminId
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  {isValidAdminId && (
                    <span className="absolute right-2.5 top-2.5 text-emerald-400 text-[10px] flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> 格式正确
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Run Command */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>自动生成的 Termux / Linux 启动命令:</span>
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `./server -port=8080 -tg-token="${token}" -tg-admin="${adminId}"`,
                      'gen_cmd'
                    )
                  }
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'gen_cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'gen_cmd' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <code className="text-[11px] text-emerald-300 font-mono break-all block bg-slate-950 p-2 rounded border border-slate-800/80">
                ./server -port=8080 -tg-token="{token}" -tg-admin="{adminId}"
              </code>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                <span>{savedSuccess ? '配置已保存并在控制台生效！' : '保存此配置并同步到控制台'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Tutorial: How to get Token & ID */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>手把手教学：如何获取真实的 Bot Token 与 Admin ID？</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: BotFather */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">1</span>
                    <span className="font-semibold text-white">获取 Bot Token</span>
                  </div>
                  <span className="text-[10px] text-sky-400">@BotFather</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>打开 Telegram，在搜索栏输入并进入官方认证的 <code className="text-sky-300">@BotFather</code>。</li>
                  <li>发送命令 <code className="text-amber-300">/newbot</code>。</li>
                  <li>按提示输入机器人的显示名称（如：十三水管理员）。</li>
                  <li>输入机器人的用户名，必须以 <code className="text-sky-300">bot</code> 结尾（如：<code className="text-emerald-300">my_shisanshui_bot</code>）。</li>
                  <li>@BotFather 会返回一段形如 <code className="text-amber-300">7182938491:AAH8F...</code> 的 Token，直接复制填入上方即可！</li>
                </ol>
              </div>

              {/* Step 2: userinfobot */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">2</span>
                    <span className="font-semibold text-white">获取 Admin Chat ID</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">@userinfobot</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>打开 Telegram，在搜索栏输入并进入 <code className="text-emerald-300">@userinfobot</code> 或 <code className="text-emerald-300">@getmyid_bot</code>。</li>
                  <li>点击底部的 <code className="text-amber-300">/start</code> 按钮。</li>
                  <li>机器人会立即回复您的个人账号信息。</li>
                  <li>找到 <code className="text-sky-300">Id: 583920192</code> 这一行，这串纯数字就是您的个人专属 Telegram User ID！</li>
                  <li>将其复制填入上方 Admin ID 输入框即可，仅此 ID 拥有执行 <code>/kick</code> 等高权指令。</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Configuration Location 2: config.json */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>永久配置文件位置：<code>shisanshui/config.json</code></span>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(
                      {
                        server: { port: 8080, room_timeout_sec: 30 },
                        telegram_bot: {
                          enabled: true,
                          bot_token: token,
                          admin_chat_id: Number(adminId) || 583920192,
                          alert_on_grand_slam: true,
                          alert_on_special_hand: true
                        }
                      },
                      null,
                      2
                    ),
                    'copy_json'
                  )
                }
                className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'copy_json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>复制完整 config.json</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "server": {
    "port": 8080
  },
  "telegram_bot": {
    "enabled": true,
    "bot_token": "${token}",
    "admin_chat_id": ${adminId || '583920192'},
    "alert_on_grand_slam": true,
    "alert_on_special_hand": true
  }
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Token 与 Admin ID 仅在您自建的 Termux 服务端与 Telegram 官方 API 通信，安全无泄漏</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            关闭向导
          </button>
        </div>
      </div>
    </div>
  );
};

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);
