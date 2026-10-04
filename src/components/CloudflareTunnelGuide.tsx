import React, { useState } from 'react';
import {
  Globe,
  Cloud,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Server,
  Terminal,
  Activity,
  ArrowRight,
  Wifi
} from 'lucide-react';

export const CloudflareTunnelGuide: React.FC = () => {
  const [tunnelDomain, setTunnelDomain] = useState('https://poker.yourdomain.com');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let testUrl = tunnelDomain.trim();
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }
      const targetApi = `${testUrl.replace(/\/+$/, '')}/api/info`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(targetApi, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setTestResult(`✓ 连接成功！服务端在线 (当前玩家: ${data.players || 0}人, 运行时间: ${data.uptime || '刚刚'})`);
      } else {
        setTestResult(`! 收到 HTTP 状态码: ${res.status}。请确认 Cloudflare Tunnel 是否正确反代到 Termux 的 8080 端口。`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        setTestResult('! 连接超时。请检查域名 DNS 解析与 cloudflared 隧道是否正在运行。');
      } else {
        setTestResult(`! 探测反馈: 若跨域(CORS)受限属正常现象，您可直接在新标签页打开 ${tunnelDomain} 验证！`);
      }
    } finally {
      setTesting(false);
    }
  };

  const cloudflaredQuickCmd = `# 在 Termux 安装并运行临时免费 Cloudflare 快速隧道
pkg install -y cloudflared
cloudflared tunnel --url http://localhost:8080`;

  const cloudflaredCustomDomainCmd = `# 绑定到您的自定义域名 (推荐)
# 1. 登录 Cloudflare 认证
cloudflared tunnel login

# 2. 创建命名隧道
cloudflared tunnel create shisanshui-tunnel

# 3. 关联域名路由 (将 poker.yourdomain.com 路由至隧道)
cloudflared tunnel route dns shisanshui-tunnel poker.yourdomain.com

# 4. 运行隧道指向 Termux 本地 8080 端口
cloudflared tunnel run --url http://localhost:8080 shisanshui-tunnel`;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Cloud className="w-5 h-5 text-amber-400" />
            <span>Cloudflare Tunnel 隧道公网直连指南</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            已配置 Cloudflare Tunnel？玩家无需在同一 WiFi，直接在手机或电脑浏览器输入您的域名即可进入游戏！
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HTTPS + WSS 自动加密</span>
          </div>
        </div>
      </div>

      {/* Online Domain Connect & Test Box */}
      <div className="p-6 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">输入您配置好的 Cloudflare 隧道域名：</h3>
              <p className="text-[11px] text-slate-400">玩家打开此网址即可加载前端网页并自动建立 WebSocket 联机</p>
            </div>
          </div>

          <a
            href={tunnelDomain.startsWith('http') ? tunnelDomain : `https://${tunnelDomain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors self-start md:self-auto"
          >
            <span>直接在新窗口打开</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={tunnelDomain}
            onChange={(e) => setTunnelDomain(e.target.value)}
            placeholder="例如: https://poker.yourdomain.com"
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>{testing ? '正在探测...' : '测试隧道连通性'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono ${
              testResult.startsWith('✓')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {testResult}
          </div>
        )}
      </div>

      {/* How it works Architecture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>全链路工作原理：前端页面 + 后端 Go + WebSocket 单端口闭环</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-sky-400">1. 玩家浏览器打开</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              输入 <code>https://域名</code>，Cloudflare 全球 CDN 自动处理 SSL 证书，加密穿透到达手机。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-amber-400">2. Termux cloudflared</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              手机上的 Cloudflare 守护进程接收请求，原样转发给本地 <code>http://127.0.0.1:8080</code>。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-emerald-400">3. Go 服务端托管前端</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Go 程序内置静态文件服务器，直接向玩家返回精美的十三水网页应用（HTML/CSS/JS）。
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-rose-400">4. WSS 实时双向联机</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              网页自动握手 <code>wss://域名/ws</code>，实现 4 人秒级发牌、实时摆牌比拼与互动弹幕！
            </p>
          </div>
        </div>
      </div>

      {/* Cloudflared Configuration Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">模式一</span>
              <span className="text-xs text-slate-500">临时免证书试玩</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 mb-1">Quick Tunnel 极速临时穿透</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              无需拥有个人域名，由 Cloudflare 随机分配一个可分享的公网网址：
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              <code>{cloudflaredQuickCmd}</code>
            </pre>
          </div>
          <button
            onClick={() => handleCopy(cloudflaredQuickCmd, 'quick_tunnel')}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedKey === 'quick_tunnel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'quick_tunnel' ? '已复制命令' : '复制临时穿透命令'}</span>
          </button>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-sky-400">模式二 (推荐)</span>
              <span className="text-xs text-slate-500">固定个性化域名</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 mb-1">Named Tunnel 自定义专属域名</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              绑定您的独立域名（如 <code>poker.yourdomain.com</code>），7x24小时稳定开黑：
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-28">
              <code>{cloudflaredCustomDomainCmd}</code>
            </pre>
          </div>
          <button
            onClick={() => handleCopy(cloudflaredCustomDomainCmd, 'custom_tunnel')}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedKey === 'custom_tunnel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'custom_tunnel' ? '已复制命令' : '复制自定义域名隧道命令'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
