import React, { useState } from 'react';
import { GO_SOURCE_FILES, GoSourceFile } from '../utils/goSources';
import { Copy, Check, FileCode, FolderGit2, Download, Terminal, Cpu } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<GoSourceFile>(GO_SOURCE_FILES[1]); // Default to server main.go
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'server' | 'client' | 'deploy' | 'docs'>('all');

  const filteredFiles = GO_SOURCE_FILES.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Go 语言十三水完整源码中心</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            包含高并发 WebSocket 多人对战服务端、Termux 交互式 TUI 客户端、智能理牌求解器与自动化部署脚本。
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: '全部文件' },
            { id: 'server', label: '服务端' },
            { id: 'client', label: 'Termux客户端' },
            { id: 'core', label: '核心算法' },
            { id: 'deploy', label: '部署脚本' },
            { id: 'docs', label: '文档' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main IDE-style split view */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* File Tree / List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 md:col-span-1">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>项目源码清单 ({filteredFiles.length})</span>
          </div>

          <div className="flex flex-col gap-1 mt-1 max-h-[500px] overflow-y-auto">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setActiveFile(file)}
                className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                  activeFile.path === file.path
                    ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <FileCode className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono font-medium truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{file.path}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Editor View */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col md:col-span-3">
          {/* File Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-amber-400">{activeFile.path}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">{activeFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制代码'}</span>
              </button>
              <button
                onClick={handleDownloadSingleFile}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-500/30 rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载文件</span>
              </button>
            </div>
          </div>

          {/* Syntax Code Box */}
          <pre className="p-4 text-xs font-mono leading-relaxed text-slate-200 overflow-x-auto max-h-[550px] selection:bg-amber-500/30">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
