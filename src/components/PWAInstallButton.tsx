import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed, hide prompt or show gentle badge
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>桌面App模式</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all animate-pulse shrink-0"
          title="点击将十三水一键安装到手机桌面"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>安装到桌面</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSModal(true)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all shrink-0"
          title="点击查看 iOS 添加到桌面教程"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>添加到主屏幕</span>
        </button>
      ) : (
        <button
          onClick={() => setShowIOSModal(true)}
          className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
          title="点击安装为桌面App"
        >
          <Download className="w-3 h-3 text-amber-400" />
          <span>桌面App</span>
        </button>
      )}

      {/* iOS Safari / Mobile Browser Install Guide Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-[#0F172A] border-2 border-amber-500/80 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm text-white">添加到手机桌面 (PWA全屏)</h4>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-white">在手机浏览器中点击「分享」按钮</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    Safari 浏览器底部栏的 <Share className="w-3.5 h-3.5 text-sky-400 inline" /> 分享图标，或 Chrome 浏览器右上角三点菜单。
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-white">向下滑动，选择「添加到主屏幕」</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    点击 <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> 「添加到主屏幕」并确认。
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px]">
                🎉 <strong>完成！</strong> 手机桌面将生成十三水 App 图标，点击直接以原生全屏运行，无浏览器网址栏阻碍！
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
