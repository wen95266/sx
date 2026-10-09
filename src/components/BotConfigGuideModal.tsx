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
  Play,
  Globe,
  Radio,
  RefreshCw,
  Zap,
  Info
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
  const [activeTab, setActiveTab] = useState<'config' | 'webhook' | 'troubleshoot'>('config');
  const [token, setToken] = useState(initialToken || '7182938491:AAH8F...YOUR_TOKEN');
  const [adminId, setAdminId] = useState(initialAdminId || '583920192');
  const [domain, setDomain] = useState('poker.yourdomain.com');
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
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const webhookUrl = `https://${cleanDomain || 'poker.yourdomain.com'}/api/telegram/webhook`;

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
                <span>Telegram Bot 运维配置与 Webhook 指南</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                  生产级全功能
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                支持 Webhook 零进程直推、长轮询防冲突自愈与一键排障
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>凭证配置与启动</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'webhook'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Webhook 启动设置 (推荐)</span>
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>🚨 Bot 无反应排查</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          {activeTab === 'config' && (
            <>
              {/* Quick Summary Banner */}
              <div className="bg-gradient-to-r from-sky-950/70 to-slate-900 border border-sky-500/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sky-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>服务端支持的配置模式：</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold">① Webhook 模式:</span>
                    <span>无需后台额外进程，由 <code>server.js</code> 直接响应</span>
                  </li>
                  <li className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-sky-400 font-bold">② 轮询模式:</span>
                    <span>执行 <code>npm run bot</code>，内置 409 冲突自愈</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Form for testing and generating commands */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span>在线配置您的 Telegram Bot 凭证</span>
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

                {/* Generated .env snippet */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>写入 .env 文件的标准格式:</span>
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `TG_BOT_TOKEN="${token}"\nTG_ADMIN_ID="${adminId}"\nPORT=8080`,
                          'gen_env'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'gen_env' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'gen_env' ? '已复制' : '复制配置'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-emerald-300 font-mono block bg-slate-950 p-2 rounded border border-slate-800/80">
{`TG_BOT_TOKEN="${token}"
TG_ADMIN_ID="${adminId}"
PORT=8080`}
                  </pre>
                </div>
              </div>

              {/* Step 1 & 2 Tutorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">1</span>
                      <span className="font-semibold text-white">获取 Bot Token</span>
                    </div>
                    <span className="text-[10px] text-sky-400">@BotFather</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                    <li>打开 Telegram，搜索进入官方认证的 <code className="text-sky-300">@BotFather</code>。</li>
                    <li>发送 <code className="text-amber-300">/newbot</code> 并按提示输入名称和英文用户名。</li>
                    <li>复制返回的形如 <code className="text-amber-300">7182938491:AAH8F...</code> 的 Token。</li>
                  </ol>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">2</span>
                      <span className="font-semibold text-white">获取 Admin Chat ID</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">@userinfobot</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                    <li>打开 Telegram，搜索进入 <code className="text-emerald-300">@userinfobot</code>。</li>
                    <li>发送任意消息或点击 <code>/start</code>。</li>
                    <li>复制回复中的数字 <code className="text-sky-300">Id: 583920192</code> 填入上方。</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Globe className="w-4 h-4" />
                  <span>为什么推荐设置 Webhook？（尤其在 Serv00 与 Linux VPS 上）</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Telegram 会在玩家发送消息时，主动将事件推送至您的服务器。
                  <b>无需在后台额外维护轮询进程</b>，不会被系统或 Serv00 杀后台，零闲置 CPU 占用，且几乎 0 延迟！
                </p>
              </div>

              {/* Webhook Configuration generator */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>生成您的 Webhook 地址与注册命令</span>
                </h3>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    您的公网 HTTPS 域名 (例如从 Cloudflare 或 Nginx 绑定的域名)：
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="poker.yourdomain.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Telegram 官方要求 Webhook 必须为 <code>https://</code> 协议且具有有效 SSL 证书。
                  </span>
                </div>

                {/* Webhook URL preview */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-[11px]">完整的 Webhook 接收端点：</span>
                    <button
                      onClick={() => handleCopy(webhookUrl, 'wh_url')}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'wh_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'wh_url' ? '已复制' : '复制 URL'}</span>
                    </button>
                  </div>
                  <code className="text-emerald-300 font-mono text-xs block bg-slate-950 p-2 rounded border border-slate-800">
                    {webhookUrl}
                  </code>
                </div>

                {/* Option A: .env configuration */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sky-300 flex items-center gap-1.5">
                    <span>方式 A：写入 .env 自动开机注册（最简便）</span>
                  </h4>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">在 .env 中追加以下这一行即可：</span>
                      <button
                        onClick={() => handleCopy(`TG_WEBHOOK_URL="${webhookUrl}"`, 'env_wh')}
                        className="text-sky-400 hover:text-sky-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'env_wh' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>复制</span>
                      </button>
                    </div>
                    <code className="text-sky-300 font-mono text-xs block bg-slate-950 p-2 rounded">
                      TG_WEBHOOK_URL="{webhookUrl}"
                    </code>
                    <p className="text-[10px] text-slate-400 mt-1">
                      保存后只需运行 <code>npm start</code>，主服务端就会自动向 Telegram 注册并在 <code>/api/telegram/webhook</code> 接收指令！
                    </p>
                  </div>
                </div>

                {/* Option B: One-click CLI command */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>方式 B：在终端执行一键注册命令</span>
                  </h4>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">在服务器终端直接运行：</span>
                      <button
                        onClick={() => handleCopy(`npm run bot:webhook ${webhookUrl}`, 'cmd_wh')}
                        className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cmd_wh' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>复制命令</span>
                      </button>
                    </div>
                    <code className="text-amber-300 font-mono text-xs block bg-slate-950 p-2 rounded">
                      npm run bot:webhook {webhookUrl}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              {/* Notice */}
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>为什么 Telegram Bot 会没有反应？（四大高发原因自查）</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <p className="font-bold text-rose-400">1. Webhook 与轮询 409 Conflict 冲突死锁（90% 的原因！）</p>
                    <p className="text-slate-400 mt-1">
                      Telegram 官方机制：如果曾经给这个 Bot 注册过 Webhook，官方会彻底封死 <code>getUpdates</code> 轮询！导致终端显示启动但永远收不到消息。
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('npm run bot:polling', 'cmd_poll')}
                        className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer hover:bg-rose-500/30"
                      >
                        {copiedKey === 'cmd_poll' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>执行一键解锁并轮询：npm run bot:polling</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <p className="font-bold text-amber-300">2. 服务端此前未开放 Webhook 路由</p>
                    <p className="text-slate-400 mt-1">
                      如果之前设置了 Webhook 但服务端没有对应路由，Telegram 会一直报 404。现在主服务已原生支持 <code>POST /api/telegram/webhook</code>。
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <p className="font-bold text-sky-300">3. 国内 Termux / 服务器无法直连 api.telegram.org (GFW 拦截)</p>
                    <p className="text-slate-400 mt-1">
                      国内环境下请求官方 API 会超时。可在 <code>.env</code> 中配置 <code>TG_API_BASE="你的反代地址"</code> 或 <code>HTTPS_PROXY="http://127.0.0.1:7890"</code>。
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis tools */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>一键健康诊断命令（秒级定位根因）</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  在服务器终端运行以下命令，系统将自动连接 Telegram 官方 API，测试 Token 有效性、网络连通性，并输出当前 Webhook 状态与错误日志：
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <code className="text-sky-300 font-mono text-xs">npm run bot:check</code>
                  <button
                    onClick={() => handleCopy('npm run bot:check', 'chk_cmd')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'chk_cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>复制</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-200 mb-1.5">浏览器在线诊断端点：</h4>
                  <p className="text-[11px] text-slate-400">
                    主服务启动后，您也可在浏览器中直接访问 <code>http://您的IP:8080/api/telegram/status</code> 实时查看 JSON 诊断结果。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>查阅详细文档：<code>docs/TELEGRAM_BOT_GUIDE.md</code></span>
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
