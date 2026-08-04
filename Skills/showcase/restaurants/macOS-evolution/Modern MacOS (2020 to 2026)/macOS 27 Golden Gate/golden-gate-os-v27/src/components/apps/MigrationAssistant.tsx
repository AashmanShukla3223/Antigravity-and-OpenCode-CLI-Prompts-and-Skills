import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComputerIcon, SmartPhone01Icon, ArrowRight01Icon, Tick01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const MigrationAssistant: React.FC = () => {
  const { closeApp } = useSystem();
  const [step, setStep] = useState<'source' | 'searching' | 'transferring' | 'complete'>('source');
  const [selectedSource, setSelectedSource] = useState<'galaxy' | 'c5000'>('galaxy');
  const [progress, setProgress] = useState(0);

  const startTransfer = () => {
    setStep('transferring');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 400);
      }
    }, 150);
  };

  return (
    <div className="h-full w-full bg-neutral-900 text-white flex flex-col justify-between p-8 font-sans select-none relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <ComputerIcon size={32} className="text-blue-500" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Migration Assistant</h2>
          <p className="text-xs text-white/50">Transfer Information to This Mac</p>
        </div>
      </div>

      {/* Main Body */}
      <div className="my-auto flex flex-col items-center text-center max-w-lg mx-auto">
        {step === 'source' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-6">
            <h3 className="text-lg font-semibold">How do you want to transfer your information?</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedSource('galaxy')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${selectedSource === 'galaxy' ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'}`}
              >
                <SmartPhone01Icon size={40} className="text-blue-400" />
                <div className="font-bold text-sm">Galaxy S2 System</div>
                <div className="text-[10px] text-white/40">Samsung Web Ecosystem</div>
              </div>
              <div
                onClick={() => setSelectedSource('c5000')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${selectedSource === 'c5000' ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'}`}
              >
                <ComputerIcon size={40} className="text-purple-400" />
                <div className="font-bold text-sm">Samsung C5000</div>
                <div className="text-[10px] text-white/40">Feature Phone Matrix</div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'transferring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <h3 className="text-lg font-bold">Transferring Settings & Wallpapers...</h3>
            <p className="text-xs text-white/50">
              Importing preferences from {selectedSource === 'galaxy' ? 'Galaxy S2' : 'Samsung C5000'} simulation state...
            </p>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mt-4">
              <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-blue-400 font-mono font-bold">{progress}%</span>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 mb-2">
              <Tick01Icon size={32} />
            </div>
            <h3 className="text-2xl font-black text-green-400">Migration Complete</h3>
            <p className="text-xs text-white/60">
              Your system configurations from {selectedSource === 'galaxy' ? 'Galaxy S2' : 'Samsung C5000'} have been successfully linked to Golden Gate OS.
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        {step === 'complete' ? (
          <button
            onClick={() => closeApp('migrationassistant')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg"
          >
            Done
          </button>
        ) : (
          <button
            onClick={startTransfer}
            disabled={step === 'transferring'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
          >
            Continue <ArrowRight01Icon size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
