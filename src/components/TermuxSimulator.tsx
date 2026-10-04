import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, Sparkles, Send, Zap, CheckCircle2 } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'success' | 'error' | 'highlight' | 'banner';
}

export const TermuxSimulator: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'Android Termux aarch64 (Linux 6.1)', type: 'banner' },
    { text: '★ 点击下方「⚡ 一键全自动启动 (start.sh)」体验 1条命令搞定一切！', type: 'highlight' },
    { text: '---------------------------------------------------', type: 'output' }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (text: string, type: TerminalLine['type'] = 'output') => {
    setLines((prev) => [...prev, { text, type }]);
  };

  const handleRunCommand = (cmd: string) => {
    if (!cmd.trim() || isBusy) return;
    const cleanCmd = cmd.trim();
    addLine(`$ ${cleanCmd}`, 'input');
    setInputVal('');

    if (cleanCmd === 'clear') {
      setLines([]);
      return;
    }

    if (cleanCmd === 'help') {
      addLine('=== 极简一条龙命令清单 ===', 'highlight');
      addLine('  bash start.sh         : 【推荐】全自动环境检查/安装/编译/后台服务/直接进游戏');
      addLine('  curl ... | bash       : 远程一条命令全自动运行');
      addLine('  ./server              : 单独启动服务端');
      addLine('  ./client              : 单独启动客户端');
      addLine('  clear                 : 清空终端');
      return;
    }

    if (cleanCmd.startsWith('bash start.sh') || cleanCmd === './start.sh' || cleanCmd.includes('start.sh')) {
      setIsBusy(true);
      addLine('[1/4] 自动检测系统环境与依赖...', 'output');
      setTimeout(() => {
        addLine('✓ 环境检测通过 (Go 1.22 / Git / Net-Tools 已就绪)', 'success');
        setTimeout(() => {
          addLine('[2/4] 自动检查编译状态: 正在生成 ./server 与 ./client 可执行文件...', 'output');
          setTimeout(() => {
            addLine('✓ 编译完成 (缓存就绪)', 'success');
            setTimeout(() => {
              addLine('[3/4] 正在后台启动十三水多人服务端 (端口: 8080)...', 'output');
              addLine('==================================================', 'highlight');
              addLine('🎉 服务端已在后台正常运行！(PID: 28419)', 'success');
              addLine('   - 本机局域网 IP: 192.168.1.108:8080', 'highlight');
              addLine('   - 提示: 同一 WiFi/热点的好友可直接连入对战！', 'output');
              addLine('==================================================', 'highlight');
              setTimeout(() => {
                addLine('[4/4] 正在为您直接接入游戏...', 'output');
                setTimeout(() => {
                  addLine('==================================================', 'highlight');
                  addLine('      🀄 十三水 Termux 命令行多人对战终端', 'highlight');
                  addLine('==================================================', 'highlight');
                  addLine('>> 连接至 127.0.0.1:8080 成功！欢迎 玩家 [Termux大侠]', 'success');
                  addLine('[1] 本局收到的 13 张手牌:', 'highlight');
                  addLine('    ♠A  ♠K  ♠Q  ♥10  ♦10  ♣10  ♠9  ♥8  ♦7  ♣6  ♠5  ♥3  ♦2', 'output');
                  addLine('', 'output');
                  addLine('[2] AI 智能最优理牌推荐 (已自动为您锁定最高战力方案):', 'highlight');
                  addLine('    🎴 头道 (3张): ♠A  ♠K  ♠Q      [乌龙 A高]');
                  addLine('    🎴 中道 (5张): ♥10 ♦10 ♣10 ♥8 ♦7 [三条 10]');
                  addLine('    🎴 尾道 (5张): ♠9  ♥8  ♦7  ♣6  ♠5  [顺子 9高]');
                  addLine('', 'output');
                  addLine('✓ 摆牌完毕！已锁定出牌，等待同桌其他 3 位玩家...', 'success');
                  setIsBusy(false);
                }, 600);
              }, 600);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
      return;
    }

    if (cleanCmd.startsWith('./server')) {
      setIsBusy(true);
      addLine('[+] 服务端独立启动在 8080 端口...', 'success');
      setIsBusy(false);
      return;
    }

    if (cleanCmd.startsWith('./client')) {
      setIsBusy(true);
      addLine('>> 正在连接至 ws://127.0.0.1:8080/ws ...', 'success');
      setIsBusy(false);
      return;
    }

    addLine(`termux: command not found: ${cleanCmd}. 输入 "bash start.sh" 启动。`, 'error');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-amber-400" />
            <span>Termux 终端极简命令模拟器</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            体验单条命令自动完成所有检查、编译、后台启动与直接发牌的极简过程！
          </p>
        </div>

        {/* The Golden Super Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunCommand('bash start.sh')}
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>⚡ 一键全自动启动 (start.sh)</span>
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono">
        {/* Terminal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-400 ml-2 font-mono">termux@android: ~/shisanshui</span>
          </div>

          <button
            onClick={() => handleRunCommand('clear')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>清屏</span>
          </button>
        </div>

        {/* Terminal Content */}
        <div className="p-4 min-h-[360px] max-h-[460px] overflow-y-auto flex flex-col gap-1 text-xs">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`leading-relaxed whitespace-pre-wrap ${
                line.type === 'input'
                  ? 'text-amber-400 font-bold'
                  : line.type === 'success'
                  ? 'text-emerald-400'
                  : line.type === 'error'
                  ? 'text-rose-400'
                  : line.type === 'highlight'
                  ? 'text-cyan-300 font-semibold'
                  : line.type === 'banner'
                  ? 'text-amber-300 font-bold'
                  : 'text-slate-300'
              }`}
            >
              {line.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand(inputVal);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-t border-slate-800"
        >
          <span className="text-emerald-400 font-bold">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isBusy}
            placeholder={isBusy ? '正在全自动执行中...' : '输入 "bash start.sh" 或点击上方按钮'}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isBusy || !inputVal.trim()}
            className="p-1.5 text-slate-400 hover:text-amber-400 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
