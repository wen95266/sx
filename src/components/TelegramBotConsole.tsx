import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  Activity,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Bell,
  MessageSquare,
  Server,
  Zap,
  HelpCircle,
  ExternalLink,
  Users,
  Radio,
  FileCode2,
  AlertCircle,
  Key,
  Sliders,
  Sparkles
} from 'lucide-react';
import { BotConfigGuideModal } from './BotConfigGuideModal';

interface TGMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  inlineButtons?: { label: string; cmd: string }[];
}

interface ServerLog {
  id: string;
  time: string;
  type: 'info' | 'warn' | 'action' | 'game';
  text: string;
}

export const TelegramBotConsole: React.FC = () => {
  const [messages, setMessages] = useState<TGMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `🀄 *十三水 Termux 管理员控制台已就绪*

欢迎使用 Telegram 远程运维管理机器人！
当前状态：🟢 服务端已连接 (Termux Linux arm64)

您可以直接输入指令，或点击下方内联快捷按钮：`,
      time: '14:30',
      inlineButtons: [
        { label: '📊 刷新状态', cmd: '/status' },
        { label: '🎴 活跃房间', cmd: '/rooms' },
        { label: '👥 在线玩家', cmd: '/players' },
        { label: '📢 全服广播', cmd: '/broadcast 尊敬的各位玩家，服务端运行正常，祝大家对局愉快！' },
        { label: '🏆 历史战绩', cmd: '/stats' },
        { label: '📜 系统日志', cmd: '/logs' }
      ]
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [botToken, setBotToken] = useState('7182938491:AAH8...YOUR_TOKEN');
  const [adminId, setAdminId] = useState('583920192');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([
    { id: 'l1', time: '14:28:10', type: 'info', text: 'WebSocket server listening on 0.0.0.0:8080' },
    { id: 'l2', time: '14:28:11', type: 'info', text: 'Telegram Bot polling goroutine started (@shisanshui_bot)' },
    { id: 'l3', time: '14:29:05', type: 'action', text: 'Admin 583920192 authenticated successfully' },
    { id: 'l4', time: '14:30:00', type: 'game', text: 'Room [room_888] created with 4 players, round started' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serverLogs]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTimeStr = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSendCommand = (cmdText: string) => {
    const text = cmdText.trim();
    if (!text) return;

    const userMsg: TGMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      time: getTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Append to live server logs
    setServerLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}`,
        time: getTimeStr(),
        type: 'action',
        text: `TG-Bot command received: "${text}" from admin ${adminId}`
      }
    ]);

    // Simulate Bot response with inline buttons
    setTimeout(() => {
      let botReply = '';
      let buttons: { label: string; cmd: string }[] | undefined = undefined;
      const parts = text.split(' ');
      const cmd = parts[0];

      if (cmd === '/start' || cmd === '/help') {
        botReply = `🀄 *十三水 Termux 管理员指令清单*
━━━━━━━━━━━━━━━━━━
/status        - 查看服务器系统状态(CPU/内存/在线人数)
/rooms         - 查看当前所有活跃房间与牌局状态
/players       - 查看当前在线玩家清单与 IP 归属
/broadcast <内容> - 向全服所有房间发送公告
/kick <玩家ID>   - 强制将某位玩家移出房间
/restartroom <房号> - 强制重置/清理卡死房间
/logs          - 查看最近服务器核心操作日志
/stats         - 查看全局对局统计
/help          - 显示此帮助菜单`;
        buttons = [
          { label: '📊 系统状态', cmd: '/status' },
          { label: '🎴 活跃房间', cmd: '/rooms' },
          { label: '🏆 历史战绩', cmd: '/stats' }
        ];
      } else if (cmd === '/status') {
        botReply = `📊 *十三水服务端运行状态报表*
━━━━━━━━━━━━━━━━━━
• 运行环境: Android Termux (Linux arm64)
• 运行时间: 4小时 15分 32秒
• 在线玩家: 4 人 (就绪: 4)
• 活跃房间: 1 个 (room_888)
• 内存占用: 15.24 MB (系统分配: 34.20 MB)
• Go 协程数: 22 个
• GC 回收: 48 次
• 延迟状态: 8ms (局域网直连)`;
        buttons = [
          { label: '🔄 再次刷新', cmd: '/status' },
          { label: '🎴 查看房间', cmd: '/rooms' }
        ];
      } else if (cmd === '/rooms') {
        botReply = `🎴 *当前活跃对战房间 (1/50)*
━━━━━━━━━━━━━━━━━━
• *房间 ID*: room_888
  - 牌局阶段: 🃏 理牌中 (ARRANGING)
  - 玩家成员:
    1. 🧑‍💻 我 (Termux玩家) [100 水]
    2. 🤖 西门吹水 (AI) [100 水]
    3. 🥷 北冥神手 (AI) [100 水]
    4. 🧙 东方雀圣 (AI) [100 水]
  - 倒计时: 15s`;
        buttons = [
          { label: '⚙️ 重置该房间', cmd: '/restartroom room_888' },
          { label: '👥 玩家详情', cmd: '/players' }
        ];
      } else if (cmd === '/players') {
        botReply = `👥 *当前在线玩家清单 (共 4 人)*
━━━━━━━━━━━━━━━━━━
1. \`user_8821\` | 我 (Termux玩家) | 127.0.0.1 | 房号: room_888
2. \`user_1022\` | 西门吹水 (AI) | 127.0.0.1 | 房号: room_888
3. \`user_3391\` | 北冥神手 (AI) | 127.0.0.1 | 房号: room_888
4. \`user_9182\` | 东方雀圣 (AI) | 127.0.0.1 | 房号: room_888`;
        buttons = [
          { label: '🎴 返回房间列表', cmd: '/rooms' },
          { label: '📊 系统状态', cmd: '/status' }
        ];
      } else if (cmd.startsWith('/broadcast')) {
        const broadcastContent = parts.slice(1).join(' ') || '尊敬的各位玩家，服务端运行良好，祝大家游戏愉快！';
        botReply = `✅ *系统公告已成功广播至全部房间！*
━━━━━━━━━━━━━━━━━━
广播内容：
"${broadcastContent}"`;
      } else if (cmd.startsWith('/restartroom')) {
        const roomId = parts[1] || 'room_888';
        botReply = `✅ *房间重置完成*：房间 [${roomId}] 的牌桌数据已安全清空并重置为就绪状态。`;
      } else if (cmd.startsWith('/kick')) {
        const targetId = parts[1] || 'user_9999';
        botReply = `✅ *操作成功*：玩家 [${targetId}] 已被管理员移出房间并断开 WebSocket 连接。`;
      } else if (cmd === '/stats') {
        botReply = `🏆 *十三水全局对局统计*
━━━━━━━━━━━━━━━━━━
• 总对局数: 168 局
• 全垒打通杀: 14 次
• 至尊青龙: 1 次
• 一条龙: 9 次
• 铁支炸弹: 51 次
• 倒牌违规判负: 5 次`;
      } else if (cmd === '/logs') {
        botReply = `📜 *最近服务器核心操作日志*
━━━━━━━━━━━━━━━━━━
[INFO] Server listening on :8080
[INFO] Client user_8821 connected from 127.0.0.1
[INFO] Table room_888 full (4/4 players)
[GAME] Dealing round #1 completed
[BOT] Admin 583920192 issued /status`;
      } else {
        botReply = `❓ 未知指令: ${cmd}。输入 /help 查看支持的管理员指令。`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: getTimeStr(),
          inlineButtons: buttons
        }
      ]);
    }, 350);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-400" />
            <span>Telegram Bot 管理员远程运维系统</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            专为 Termux 打造的超轻量 Telegram 机器人：状态监控、内联按钮、牌局重置、全服公告与战报自动推送。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded-xl text-sky-300 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>Bot Token/ID 配置在何处？</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>轮询守护中 (0 丢包)</span>
          </div>
        </div>
      </div>

      {/* Prominent Bot ID & Token Configuration Location Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📌 Bot 的 ID 和 Token 配置在哪里？（四大官方配置位置）</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              ① 启动命令参数：<code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">-tg-token="xxx" -tg-admin="123"</code><br className="hidden sm:inline" />
              ② 永久配置文件：<code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded">shisanshui/config.json</code> 中的 <code className="text-emerald-300">telegram_bot</code> 段<br className="hidden sm:inline" />
              ③ 系统环境变量：<code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded">export TG_BOT_TOKEN="xxx"</code> 与 <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded">export TG_ADMIN_ID="123"</code><br className="hidden sm:inline" />
              ④ 右侧控制台面板：直接在线输入并一键生成 Termux 完整运行指令。
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="shrink-0 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
        >
          <Sliders className="w-4 h-4" />
          <span>打开配置向导与教程</span>
        </button>
      </div>

      {/* Main Grid: Telegram Chat on Left, Server Telemetry & Config on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Telegram Chat UI */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[620px]">
          {/* Telegram Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                🀄
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>十三水运维机器人</span>
                  <span className="text-[10px] text-sky-400 font-normal">bot</span>
                </span>
                <span className="text-[10px] text-emerald-400">online · Termux 远程守护</span>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'm1',
                    sender: 'bot',
                    text: '🀄 十三水 Termux 管理员控制台已就绪。输入 /help 查看指令。',
                    time: getTimeStr(),
                    inlineButtons: [
                      { label: '📊 刷新状态', cmd: '/status' },
                      { label: '🎴 活跃房间', cmd: '/rooms' },
                      { label: '🏆 历史战绩', cmd: '/stats' }
                    ]
                  }
                ])
              }
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>清空对话</span>
            </button>
          </div>

          {/* Quick command buttons bar */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {[
              { label: '📊 /status 状态', cmd: '/status' },
              { label: '🎴 /rooms 房间', cmd: '/rooms' },
              { label: '👥 /players 玩家', cmd: '/players' },
              { label: '📢 /broadcast 公告', cmd: '/broadcast 各位玩家注意：服务端即将进行热更新' },
              { label: '⚙️ /restartroom 重置', cmd: '/restartroom room_888' },
              { label: '🏆 /stats 战绩', cmd: '/stats' },
              { label: '📜 /logs 日志', cmd: '/logs' }
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSendCommand(btn.cmd)}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-sky-500/20 hover:text-sky-300 border border-slate-700/80 rounded-lg text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap font-mono ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  {m.text}

                  {/* Inline Keyboard Buttons under Bot Messages */}
                  {m.inlineButtons && m.inlineButtons.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                      {m.inlineButtons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleSendCommand(btn.cmd)}
                          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-sky-500 hover:text-slate-950 text-[11px] text-sky-200 font-sans font-medium transition-colors cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCommand(inputVal);
            }}
            className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="输入 Telegram 指令 (如 /status, /rooms, /broadcast)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Live Server Telemetry Logs & Telegram Pairing Hub */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Live Action Logs Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span>实时运维事件日志 (Live Telemetry)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">轮询间隔 500ms</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 text-[11px] font-mono">
              {serverLogs.map((log) => (
                <div key={log.id} className="leading-snug">
                  <span className="text-slate-500">[{log.time}]</span>{' '}
                  <span
                    className={
                      log.type === 'action'
                        ? 'text-sky-400'
                        : log.type === 'game'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Quick Copy Command Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center justify-between">
              <span>Termux 启动命令生成器</span>
              <span className="text-[10px] text-slate-500 font-mono">bash</span>
            </h3>

            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bot Token:</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Admin User ID (纯数字):</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `./server -port=8080 -tg-token="${botToken}" -tg-admin="${adminId}"`,
                    'launch_cmd'
                  )
                }
                className="w-full mt-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                {copied === 'launch_cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'launch_cmd' ? '已复制启动命令' : '复制带 TG Bot 的 Termux 运行指令'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Configuration Guide Modal */}
      <BotConfigGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialToken={botToken}
        initialAdminId={adminId}
        onSaveConfig={(t, id) => {
          setBotToken(t);
          setAdminId(id);
        }}
      />
    </div>
  );
};
