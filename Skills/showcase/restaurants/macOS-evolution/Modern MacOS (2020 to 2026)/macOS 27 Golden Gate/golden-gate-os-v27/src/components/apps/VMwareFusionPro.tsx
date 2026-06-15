import React, { useState } from 'react';
import { ArrowLeft01Icon } from 'hugeicons-react';

interface VM {
  id: string;
  name: string;
  version: string;
  url: string;
  icon: string;
}

const VMS: VM[] = [
  {
    id: 'tahoe',
    name: 'macOS Tahoe',
    version: '26.0',
    url: 'https://macos-26-tahoe.vercel.app',
    icon: '🏔️',
  },
  {
    id: 'golden-gate',
    name: 'macOS Golden Gate',
    version: '27.0',
    url: 'https://macos-27-golden-gate.vercel.app',
    icon: '🌉',
  },
];

export const VMwareFusionPro: React.FC = () => {
  const [activeVM, setActiveVM] = useState<VM | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const launchVM = (vm: VM) => {
    setActiveVM(vm);
    setShowUpgrade(false);
  };

  const handleUpgrade = () => {
    const goldenGate = VMS[1];
    setActiveVM(goldenGate);
    setShowUpgrade(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white">
      {activeVM ? (
        <>
          <div className="h-10 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveVM(null);
                setShowUpgrade(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded text-xs font-medium transition"
            >
              <ArrowLeft01Icon size={14} />
              Library
            </button>
            <div className="w-px h-5 bg-[#3c3c3c]" />
            <span className="text-sm font-medium flex items-center gap-2">
              <span>{activeVM.icon}</span>
              {activeVM.name}
            </span>
            <span className="text-[10px] text-white/40 ml-1">macOS {activeVM.version}</span>
            <div className="flex-1" />
            {activeVM.id === 'tahoe' && !showUpgrade && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition"
              >
                Software Update Available
              </button>
            )}
          </div>
          <iframe
            src={activeVM.url}
            className="w-full flex-1 border-0"
            title={activeVM.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="clipboard-read; clipboard-write"
          />
          {showUpgrade && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#2d2d2d] border border-[#3c3c3c] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-4xl mb-4 text-center">🌉</div>
                <h2 className="text-xl font-bold text-center mb-2">macOS Golden Gate</h2>
                <p className="text-sm text-white/60 text-center mb-6">
                  Version 27.0 — A new era of silicon-native glass.
                </p>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      <span>Liquid Glass design system</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      <span>Apple Intelligence integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      <span>Enhanced Siri AI capabilities</span>
                    </div>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm transition"
                  >
                    Upgrade & Restart
                  </button>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="w-full h-10 bg-white/10 hover:bg-white/15 rounded-xl text-sm transition"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#3c3c3c] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#4a4a4a]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">VMware Fusion Pro</h1>
            <p className="text-white/40 text-sm mt-1">Select a virtual machine to start</p>
          </div>
          <div className="flex gap-6">
            {VMS.map((vm) => (
              <button
                key={vm.id}
                onClick={() => launchVM(vm)}
                className="group w-64 bg-[#2d2d2d] border border-[#3c3c3c] hover:border-blue-500/50 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
              >
                <div className="text-5xl mb-4">{vm.icon}</div>
                <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{vm.name}</h3>
                <p className="text-xs text-white/40 mt-1">macOS {vm.version}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-white/30">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Powered On</span>
                  <span className="ml-auto">⬤ Running</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
