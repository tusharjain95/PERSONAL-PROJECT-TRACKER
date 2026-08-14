import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Download, 
  Smartphone, 
  Laptop, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Zap, 
  WifiOff, 
  Layers 
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallClick?: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstallClick,
  isInstallable,
  isInstalled,
}) => {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden text-slate-900"
      >
        {/* Header with App Logo */}
        <div className="px-6 py-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img 
              src="/icon.svg" 
              alt="Projtrack Logo" 
              className="w-12 h-12 rounded-2xl shadow-md border border-white/20" 
            />
            <div>
              <h2 className="text-lg font-black tracking-tight">Install Projtrack App</h2>
              <p className="text-xs text-indigo-200">
                Run natively on your phone, tablet, Mac or Windows PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <Zap className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-xs font-bold text-slate-900">Instant Launch</span>
              <span className="text-[10px] text-slate-500">Opens in dedicated app window</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <WifiOff className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-xs font-bold text-slate-900">Offline Ready</span>
              <span className="text-[10px] text-slate-500">Full cache & local storage</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <Layers className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="text-xs font-bold text-slate-900">Multi-Device</span>
              <span className="text-[10px] text-slate-500">Live sync across all screens</span>
            </div>
          </div>

          {/* Installation Instructions / Button */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">Projtrack is already installed on this device!</span>
            </div>
          ) : isInstallable && onInstallClick ? (
            <div className="space-y-3">
              <button
                onClick={() => {
                  onInstallClick();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Install Projtrack Web App (1-Click)</span>
              </button>
              <p className="text-center text-[11px] text-slate-500">
                Adds Projtrack icon to your Home Screen, Dock, or Start Menu with zero download size.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5 text-xs text-indigo-950">
              <span className="font-bold block flex items-center gap-1.5 text-slate-900">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                How to install on iPhone & iPad:
              </span>
              <div className="space-y-1.5 text-slate-700 pl-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-indigo-600 mx-0.5" /> at the bottom of Safari.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-indigo-600 mx-0.5" />.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in top-right to launch Projtrack as a native app!</span>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop / Chrome / Edge Instructions */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-600" />
                Browser Install Option:
              </span>
              <p>
                Click the <strong>Install Projtrack</strong> icon located in your browser's address bar (URL bar) or browser menu (⋮ / ⋯) &gt; <strong>"Install Projtrack..."</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
