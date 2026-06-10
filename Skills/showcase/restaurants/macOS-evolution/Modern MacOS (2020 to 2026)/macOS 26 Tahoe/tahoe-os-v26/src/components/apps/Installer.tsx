import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { Tick01Icon, LockKeyIcon, ArrowRight01Icon, ArrowLeft01Icon } from 'hugeicons-react';

type InstallStep = 'auth' | 'welcome' | 'license' | 'select' | 'installing' | 'complete';

const TERMS = `macOS 27 Golden Gate Software License Agreement

PLEASE READ THE FOLLOWING LICENSE AGREEMENT CAREFULLY. BY INSTALLING OR USING THIS SOFTWARE, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT.

1. Grant of License
Apple Inc. grants you a limited, non-exclusive, non-transferable license to install and use macOS 27 Golden Gate on a single Apple-branded computer.

2. System Requirements
macOS 27 Golden Gate requires an Apple M5 Virtual Silicon or later. This software may not be compatible with earlier hardware generations.

3. Updates & Upgrades
This license entitles you to receive all updates and upgrades to macOS 27 Golden Gate during its release cycle. Future major versions may require separate licensing.

4. Privacy
Your privacy is important. macOS 27 Golden Gate collects system diagnostics, usage data, and crash reports to improve the experience. You may opt out of sharing analytics data in System Settings.

5. Internet Services
Some features require an internet connection and may incur data charges. Apple is not responsible for third-party content accessed through the software.

6. Backup Recommendation
Apple strongly recommends creating a full backup of your system before installing any major software upgrade. Data loss, while rare, can occur during the upgrade process.

7. Limitation of Liability
To the maximum extent permitted by law, Apple shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use this software.

8. Termination
This license is effective until terminated. Your rights under this license will terminate automatically without notice if you fail to comply with any terms.

9. Governing Law
This agreement is governed by the laws of California, United States, excluding its conflict of law principles.

10. Open Source Components
This software includes open source components. Licenses and source code availability information can be found at apple.com/oss.

By clicking "Agree", you acknowledge that you have read and agree to the terms of this software license agreement.`;

export const Installer: React.FC = () => {
  const { closeApp, systemState } = useSystem();
  const [step, setStep] = useState<InstallStep>('auth');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [licenseAccepted, setLicenseAccepted] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('macintosh-hd');
  const [installProgress, setInstallProgress] = useState(0);
  const [showScrolled, setShowScrolled] = useState(false);
  const base = (import.meta as any).env?.BASE_URL || '/';
  const termsRef = useRef<HTMLDivElement>(null);

  const sidebarSteps = [
    { key: 'welcome', label: 'Introduction' },
    { key: 'license', label: 'License' },
    { key: 'select', label: 'Destination Select' },
    { key: 'installing', label: 'Installation' },
    { key: 'complete', label: 'Summary' },
  ];

  const currentStepIndex = sidebarSteps.findIndex(s => s.key === step) + 1;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = systemState.user.password || 'tahoe2026';
    if (password === correctPassword || password === 'admin') {
      setStep('welcome');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 500);
      setPassword('');
    }
  };

  const handleTermsScroll = () => {
    if (!termsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
    if (scrollHeight - scrollTop - clientHeight < 5) {
      setShowScrolled(true);
      setLicenseAccepted(true);
    }
  };

  const handleInstall = () => {
    setStep('installing');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 500);
      }
      setInstallProgress(Math.min(100, progress));
    }, 350);
  };

  const handleRestart = () => {
    window.location.href = 'https://macos-27-golden-gate.vercel.app';
  };

  if (step === 'auth') {
    return (
      <div className="h-full w-full bg-[#F6F6F6] flex items-center justify-center p-8 rounded-b-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, x: authError ? [-10, 10, -10, 10, 0] : 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center mb-6">
            <img src={`${base}icons/tahoe-installer.png`} className="w-12 h-12 object-contain" alt="Installer" />
          </div>
          <h2 className="text-xl font-bold text-black mb-1">Installer wants to make changes.</h2>
          <p className="text-[13px] text-black/50 mb-8 px-4">Enter your password to allow this.</p>
          <form onSubmit={handleAuth} className="w-full space-y-4">
            <div className="relative">
              <LockKeyIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full h-11 bg-white border border-black/10 rounded-xl px-11 text-black text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-black/20"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => closeApp('installer')}
                className="px-6 py-1.5 text-[13px] font-medium text-black/60 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[13px] font-semibold shadow-sm transition-colors"
              >
                OK
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white select-none overflow-hidden rounded-b-xl font-sans text-black installer-window-content">
      <div className="w-[220px] bg-[#F6F6F6] border-r border-black/10 flex flex-col pt-8 flex-shrink-0">
        {sidebarSteps.map((item, idx) => {
          const isActive = sidebarSteps.findIndex(s => s.key === step) === idx;
          const isPast = sidebarSteps.findIndex(s => s.key === step) > idx;
          return (
            <div
              key={item.key}
              className={`px-6 py-1.5 flex items-center gap-3 text-[13px] transition-colors cursor-default ${isActive ? 'bg-black/5 font-bold text-black' : 'text-black/60'}`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {isPast && <Tick01Icon size={14} className="text-green-600 font-bold" />}
              </div>
              {item.label}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col relative bg-white">
        {step === 'welcome' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg flex items-center justify-center mb-8">
              <img src={`${base}icons/golden-gate-upgrade-installer.png`} className="w-16 h-16 object-contain" alt="Golden Gate" />
            </div>
            <h1 className="text-[32px] font-bold text-black mb-3 tracking-tight">macOS 27 Golden Gate</h1>
            <p className="text-[15px] text-black/60 max-w-md leading-relaxed">
              Update your Mac to macOS 27 Golden Gate — the next-generation operating system with breakthrough performance, redesigned experiences, and powerful new capabilities.
            </p>
            <div className="flex gap-3 mt-10">
              <button
                onClick={() => closeApp('installer')}
                className="px-8 py-2 bg-white border border-black/10 rounded-lg text-[13px] text-black/60 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('license')}
                className="px-8 py-2 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                Continue <ArrowRight01Icon size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'license' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col px-12 py-8 min-h-0">
            <h2 className="text-[22px] font-bold text-black mb-1">Software License Agreement</h2>
            <p className="text-[13px] text-black/40 mb-4">Please read the license agreement before continuing.</p>
            <div
              ref={termsRef}
              onScroll={handleTermsScroll}
              className="flex-1 bg-[#F6F6F6] border border-black/5 rounded-xl p-6 text-[12px] text-black/70 leading-relaxed overflow-y-auto whitespace-pre-line font-mono min-h-0"
            >
              {TERMS}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="agree"
                checked={licenseAccepted}
                onChange={() => setLicenseAccepted(!licenseAccepted)}
                className="w-4 h-4 rounded border-black/20 accent-[#007AFF]"
              />
              <label htmlFor="agree" className={`text-[13px] ${showScrolled ? 'text-black' : 'text-black/30'}`}>
                {showScrolled ? 'I have read and agree to the license agreement.' : 'Please scroll to the end to accept.'}
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setStep('welcome')}
                className="px-6 py-1.5 bg-white border border-black/10 rounded-lg text-[13px] text-black/60 hover:text-black transition-colors flex items-center gap-1"
              >
                <ArrowLeft01Icon size={14} /> Go Back
              </button>
              <button
                onClick={() => setStep('select')}
                disabled={!licenseAccepted}
                className={`px-8 py-1.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2 ${licenseAccepted ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white' : 'bg-black/5 text-black/30 cursor-not-allowed'}`}
              >
                Agree <ArrowRight01Icon size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col px-12 py-8">
            <h2 className="text-[22px] font-bold text-black mb-6">Select Installation</h2>
            <p className="text-[13px] text-black/40 mb-6">Choose how you want to install macOS 27 Golden Gate.</p>

            <div className="space-y-3">
              <div
                onClick={() => setSelectedDestination('macintosh-hd')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedDestination === 'macintosh-hd' ? 'border-[#007AFF] bg-[#007AFF]/5' : 'border-black/5 bg-[#F6F6F6] hover:border-black/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                    <img src={`${base}icons/golden-gate-upgrade-installer.png`} className="w-8 h-8 object-contain" alt="Golden Gate" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-black">macOS 27 Golden Gate</h3>
                    <p className="text-[12px] text-black/50 mt-0.5">Major upgrade — macOS 26 Tahoe → macOS 27 Golden Gate</p>
                    <p className="text-[11px] text-black/30 mt-1">Version 27.0.0 (Build 27A001) — ~8.2 GB</p>
                  </div>
                  {selectedDestination === 'macintosh-hd' && (
                    <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center">
                      <Tick01Icon size={14} className="text-white font-bold" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-black/5 bg-black/[0.02] opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                    <span className="text-lg font-bold text-black/30">T</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-black/50">macOS 26 Tahoe</h3>
                    <p className="text-[12px] text-black/30 mt-0.5">Current version installed</p>
                  </div>
                  <div className="ml-auto text-[11px] text-black/30 font-mono">{'{current}'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-auto pt-8">
              <button
                onClick={() => setStep('license')}
                className="px-6 py-1.5 bg-white border border-black/10 rounded-lg text-[13px] text-black/60 hover:text-black transition-colors flex items-center gap-1"
              >
                <ArrowLeft01Icon size={14} /> Go Back
              </button>
              <button
                onClick={handleInstall}
                className="px-8 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                Install <ArrowRight01Icon size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'installing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg flex items-center justify-center mb-8">
              <img src={`${base}icons/golden-gate-upgrade-installer.png`} className="w-16 h-16 object-contain" alt="Golden Gate" />
            </div>
            <h2 className="text-[22px] font-bold text-black mb-2">Installing macOS 27 Golden Gate...</h2>
            <p className="text-[13px] text-black/50 mb-8">Your Mac will restart automatically after the installation.</p>
            <div className="w-full max-w-sm">
              <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${installProgress}%` }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{ willChange: 'width' }}
                />
              </div>
              <p className="text-[12px] text-black/40 mt-3 font-mono">{Math.round(installProgress)}% complete</p>
            </div>
            <p className="text-[11px] text-black/20 mt-8 max-w-xs leading-relaxed">
              Estimated time remaining: {installProgress < 30 ? 'About 3 minutes' : installProgress < 60 ? 'About 2 minutes' : installProgress < 90 ? 'About 1 minute' : 'Finishing...'}
            </p>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center px-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg flex items-center justify-center mb-8">
              <Tick01Icon size={48} className="text-white" />
            </div>
            <h2 className="text-[26px] font-bold text-black mb-2 tracking-tight">Installation Complete</h2>
            <p className="text-[15px] text-black/60 max-w-md leading-relaxed mb-2">
              macOS 27 Golden Gate has been successfully installed on your Mac.
            </p>
            <p className="text-[13px] text-black/40 max-w-sm leading-relaxed mb-10">
              Your Mac will restart to apply the changes. All your documents and settings have been preserved.
            </p>
            <button
              onClick={handleRestart}
              className="px-12 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl text-[15px] font-bold shadow-lg transition-all flex items-center gap-2"
            >
              Restart <ArrowRight01Icon size={18} />
            </button>
          </motion.div>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="text-[11px] text-black/20 font-mono">
            Step {currentStepIndex} of 5
          </div>
        </div>
      </div>
    </div>
  );
};
