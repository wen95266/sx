import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2, AlertTriangle, ExternalLink, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInAppBrowser, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running in standalone PWA mode, show gentle status badge
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>桌面 App 模式</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all shrink-0"
        title="点击将十三水一键添加到手机桌面"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>桌面 APP</span>
      </button>

      {/* Tailored Mobile Browser Installation Guide Modal */}
      {showGuideModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-[#0F172A] border-2 border-amber-500/90 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm text-white">添加到手机桌面 (PWA原生全屏)</h4>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-App Browser Warning (WeChat / QQ / Weibo) */}
            {isInAppBrowser ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-2 text-xs text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>当前为微信/QQ内置浏览器</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  微信与QQ内置浏览器限制了桌面快捷方式生成。请点击页面右上角 **「···」** 或 **「分 享」**，选择 **「在浏览器中打开」** 后，再点击【桌面 APP】生成桌面应用。
                </p>
              </div>
            ) : isIOS ? (
              /* iOS Safari Step-by-Step Guide */
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white">点击 Safari 底部栏的「分享」图标</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      点击底部正中间的 <Share className="w-3.5 h-3.5 text-sky-400 inline" /> 分享按钮。
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">向上滑动，选择「添加到主屏幕」</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      点击 <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> 「添加到主屏幕」并确认。
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Android Chrome / Edge / Mobile Browser Step-by-Step Guide */
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1">
                      点击浏览器右上角菜单按钮 <MoreVertical className="w-3.5 h-3.5 text-amber-400 inline" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      点击浏览器右上角 **三个点「⋮」** 或底部 **菜单按钮「☰」**。
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">点击「添加到主屏幕」/「安装应用」</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      在菜单中选择 <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> 「添加到主屏幕」或「安装 App」。
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px]">
                  🎉 <strong>添加完成后：</strong> 手机桌面将自动生成「十三水」App 图标，点击直接以原生全屏模式畅玩！
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 mt-1"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
