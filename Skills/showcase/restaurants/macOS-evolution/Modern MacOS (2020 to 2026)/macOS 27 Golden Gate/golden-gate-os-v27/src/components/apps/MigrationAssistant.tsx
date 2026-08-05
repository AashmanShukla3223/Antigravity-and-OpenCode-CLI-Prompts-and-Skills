import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import {
  ComputerIcon,
  SmartPhone01Icon,
  ArrowRight01Icon,
  Tick01Icon,
  ShieldKeyIcon,
  Folder01Icon,
  Settings01Icon,
  SoftwareIcon,
  RefreshIcon
} from 'hugeicons-react';

type MigrationStep = 'mode' | 'source' | 'searching' | 'security' | 'select' | 'transferring' | 'complete';
type TransferSource = 'mac_timemachine' | 'windows_pc' | 'to_mac';

interface DataCategory {
  id: string;
  name: string;
  desc: string;
  size: string;
  icon: any;
  selected: boolean;
}

export const MigrationAssistant: React.FC = () => {
  const { closeApp } = useSystem();
  const [step, setStep] = useState<MigrationStep>('mode');
  const [sourceType, setSourceType] = useState<TransferSource>('mac_timemachine');
  const [securityCode, setSecurityCode] = useState('4829');
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Preparing files...');

  const [categories, setCategories] = useState<DataCategory[]>([
    {
      id: 'apps',
      name: 'Applications',
      desc: 'Final Cut Pro, Logic Pro, Xcode, and system utilities',
      size: '24.8 GB',
      icon: SoftwareIcon,
      selected: true,
    },
    {
      id: 'users',
      name: 'User Accounts & Data',
      desc: 'Desktop, Documents, Downloads, and Home directory',
      size: '112.4 GB',
      icon: Folder01Icon,
      selected: true,
    },
    {
      id: 'settings',
      name: 'System Settings & Preferences',
      desc: 'Network passwords, wallpapers, displays, and accessibility',
      size: '1.2 GB',
      icon: Settings01Icon,
      selected: true,
    },
  ]);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSourceSelect = (type: TransferSource) => {
    setSourceType(type);
    if (type === 'to_mac') {
      setStep('searching');
      setTimeout(() => {
        setStep('complete');
      }, 3000);
      return;
    }

    setStep('searching');
    setTimeout(() => {
      setSecurityCode(Math.floor(1000 + Math.random() * 9000).toString());
      setStep('security');
    }, 2000);
  };

  const startTransfer = () => {
    setStep('transferring');
    setProgress(0);
    const steps = [
      'Reading source drive hierarchy...',
      'Copying Applications & Frameworks...',
      'Migrating User Library & Documents...',
      'Applying System Preferences & Network Keys...',
      'Verifying file checksums...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current < 25) setCurrentAction(steps[0]);
      else if (current < 50) setCurrentAction(steps[1]);
      else if (current < 75) setCurrentAction(steps[2]);
      else if (current < 95) setCurrentAction(steps[3]);
      else setCurrentAction(steps[4]);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 500);
      }
    }, 120);
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] text-white flex flex-col justify-between p-8 font-sans select-none relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-purple-950/20 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ComputerIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Migration Assistant</h2>
            <p className="text-xs text-white/50">Transfer information to or from this Mac</p>
          </div>
        </div>
        <div className="text-xs font-mono text-white/30 bg-white/5 px-2.5 py-1 rounded-md">
          macOS Golden Gate v26.0
        </div>
      </div>

      {/* Dynamic Main Step Content */}
      <div className="my-auto flex flex-col items-center text-center max-w-xl mx-auto w-full z-10 py-4">
        <AnimatePresence mode="wait">
          {step === 'mode' && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col gap-6"
            >
              <div>
                <h3 className="text-xl font-semibold mb-2">How do you want to transfer your information?</h3>
                <p className="text-xs text-white/50">
                  Select the transfer direction or target source machine.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-left">
                <div
                  onClick={() => setSourceType('mac_timemachine')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                    sourceType === 'mac_timemachine'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <ComputerIcon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">From a Mac, Time Machine backup, or Startup disk</div>
                    <div className="text-xs text-white/40">Transfer apps, user files, and settings over Wi-Fi or Ethernet</div>
                  </div>
                </div>

                <div
                  onClick={() => setSourceType('windows_pc')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                    sourceType === 'windows_pc'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <SmartPhone01Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">From a Windows PC</div>
                    <div className="text-xs text-white/40">Migrate documents, emails, and photos from Windows</div>
                  </div>
                </div>

                <div
                  onClick={() => setSourceType('to_mac')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                    sourceType === 'to_mac'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <ArrowRight01Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">To another Mac</div>
                    <div className="text-xs text-white/40">Set this Mac into receiver mode to export data</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-4 py-8"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <RefreshIcon size={24} className="absolute inset-0 m-auto text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold">Looking for Sources...</h3>
              <p className="text-xs text-white/50 max-w-sm">
                Ensure both devices are on the same Wi-Fi network or connected via Thunderbolt cable.
              </p>
            </motion.div>
          )}

          {step === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <ShieldKeyIcon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Confirm Security Code</h3>
                <p className="text-xs text-white/50">
                  Verify that this security code appears on your source device:
                </p>
              </div>
              <div className="text-4xl font-mono font-black tracking-[0.3em] text-blue-400 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl shadow-inner">
                {securityCode}
              </div>
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col gap-5"
            >
              <div>
                <h3 className="text-xl font-bold mb-1">Select Information to Transfer</h3>
                <p className="text-xs text-white/50">
                  Choose the data categories you wish to migrate to this system.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 text-left">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                        cat.selected
                          ? 'bg-blue-600/15 border-blue-500/60 text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={cat.selected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-blue-500 pointer-events-none"
                      />
                      <Icon size={20} className={cat.selected ? 'text-blue-400' : 'text-white/40'} />
                      <div className="flex-1">
                        <div className="font-bold text-xs">{cat.name}</div>
                        <div className="text-[11px] text-white/40">{cat.desc}</div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-white/60">{cat.size}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'transferring' && (
            <motion.div
              key="transferring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-5"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
              <div>
                <h3 className="text-xl font-bold mb-1">Transferring Information...</h3>
                <p className="text-xs font-mono text-blue-400">{currentAction}</p>
              </div>

              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mt-2 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-white/40 px-1">
                <span>{progress}% complete</span>
                <span>About 2 minutes remaining</span>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 mb-1">
                <Tick01Icon size={36} />
              </div>
              <h3 className="text-2xl font-extrabold text-green-400">Migration Completed</h3>
              <p className="text-xs text-white/60 max-w-md">
                Your selected documents, user configurations, and applications have been successfully integrated into macOS Golden Gate OS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10 z-10">
        <button
          onClick={() => closeApp('migrationassistant')}
          className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          {step === 'mode' && (
            <button
              onClick={() => handleSourceSelect(sourceType)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg flex items-center gap-1.5"
            >
              Continue <ArrowRight01Icon size={14} />
            </button>
          )}

          {step === 'security' && (
            <button
              onClick={() => setStep('select')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg flex items-center gap-1.5"
            >
              Confirm & Continue <ArrowRight01Icon size={14} />
            </button>
          )}

          {step === 'select' && (
            <button
              onClick={startTransfer}
              disabled={!categories.some((c) => c.selected)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-colors shadow-lg flex items-center gap-1.5"
            >
              Start Transfer <ArrowRight01Icon size={14} />
            </button>
          )}

          {step === 'complete' && (
            <button
              onClick={() => closeApp('migrationassistant')}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
