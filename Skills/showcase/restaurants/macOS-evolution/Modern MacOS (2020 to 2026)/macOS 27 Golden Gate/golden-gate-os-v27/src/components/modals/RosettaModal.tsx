import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '../common/AppIcon';

interface RosettaModalProps {
  isOpen: boolean;
  osVersion: 'golden-gate' | 'macos-28';
  onNotNow: () => void;
  onInstallComplete: () => void;
  onOpenAppStore: () => void;
  onClose: () => void;
}

export const RosettaModal: React.FC<RosettaModalProps> = ({
  isOpen,
  osVersion,
  onNotNow,
  onInstallComplete,
  onOpenAppStore,
  onClose,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleInstallClick = () => {
    setIsInstalling(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsInstalling(false);
          setProgress(0);
          onInstallComplete();
        }, 400);
      }
      setProgress(p);
    }, 250);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-[460px] bg-neutral-900/90 border border-white/20 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-white select-none relative overflow-hidden"
        >
          {osVersion === 'golden-gate' ? (
            /* Golden Gate Rosetta Install Modal */
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-black/30 p-1 flex items-center justify-center border border-white/10 shadow-lg">
                  <AppIcon id="geometrydash" size={56} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-white/95">
                    To open &quot;Geometry Dash&quot;, you need to install Rosetta 2. Do you want to install it now?
                  </h3>
                  <p className="text-[12px] leading-relaxed text-white/70">
                    Rosetta enables Intel-based features to run on Apple silicon Macs. Reopening applications after installation is required to start using Rosetta.
                  </p>
                  <p className="text-[11px] leading-relaxed text-white/50">
                    Use of this software is subject to the original license agreement that accompanied the software being updated. A list of Apple SLAs may be found here:{' '}
                    <a
                      href="https://www.apple.com/legal/sla/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      https://www.apple.com/legal/sla/
                    </a>
                  </p>
                </div>
              </div>

              {isInstalling ? (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Installing Rosetta 2...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={onNotNow}
                    className="px-5 py-1.5 rounded-lg text-[13px] font-medium bg-white/10 hover:bg-white/20 active:bg-white/5 transition-colors border border-white/10"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleInstallClick}
                    className="px-5 py-1.5 rounded-lg text-[13px] font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                  >
                    Install
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* macOS 28 Hard-Block Deprecation Modal */
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-black/30 p-1 flex items-center justify-center border border-white/10 shadow-lg">
                  <AppIcon id="geometrydash" size={56} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-white/95">
                    &quot;Geometry Dash&quot; can&apos;t be opened.
                  </h3>
                  <p className="text-[12px] leading-relaxed text-white/70">
                    Rosetta is no longer available on this Mac. To use this app, you&apos;ll need a version made for Apple silicon.
                  </p>
                  <p className="text-[12px] leading-relaxed text-white/70">
                    Check the App Store for an updated version of this app.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-5 py-1.5 rounded-lg text-[13px] font-medium bg-white/10 hover:bg-white/20 active:bg-white/5 transition-colors border border-white/10"
                >
                  OK
                </button>
                <button
                  onClick={onOpenAppStore}
                  className="px-5 py-1.5 rounded-lg text-[13px] font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                  App Store
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
