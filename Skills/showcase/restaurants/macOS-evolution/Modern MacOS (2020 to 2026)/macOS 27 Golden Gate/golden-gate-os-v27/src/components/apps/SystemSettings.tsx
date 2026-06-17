import React, { useState, useEffect } from 'react';
import {
  Search01Icon,
  Settings01Icon,
  InformationCircleIcon,
  Database01Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  LockIcon,
  Alert01Icon,
  ArrowRight01Icon,
  BatteryCharging01Icon,
  FlashIcon,
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import type { UserAccount } from '../../contexts/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { App_Version } from '../../hooks/useSoftwareUpdate';

const BatteryGraph = () => {
  const points = '0,80 20,70 40,85 60,60 80,75 100,40 120,55 140,30 160,45 180,20 200,35';
  return (
    <svg viewBox="0 0 200 100" className="w-full h-24 mt-4 overflow-visible">
      <defs>
        <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      />
      <path d={`M ${points} V 100 H 0 Z`} fill="url(#graphGradient)" />
      <line x1="0" y1="20" x2="200" y2="20" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
      <line x1="0" y1="50" x2="200" y2="50" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
      <line x1="0" y1="80" x2="200" y2="80" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
    </svg>
  );
};

export const SystemSettings: React.FC = () => {
  const {
    systemState,
    updateSystemState,
    resetSystem,
    hardware,
    setShowAboutWindow,
    battery,
    showConfirm,
    showAlert,
    activeUser,
    switchUser,
    addUser,
    removeUser,
    updateUser,
    verifyPassword,
  } = useSystem();

  const [currentTab, setCurrentTab] = useState('Appearance');
  const [resetStep, setResetStep] = useState(0);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const [brightness, setBrightness] = useState(80);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 512, percent: 0 });
  const [isLocked, setIsLocked] = useState(true);
  const [unlockPw, setUnlockPw] = useState('');
  const [unlockErr, setUnlockErr] = useState(false);

  const username = activeUser.accountName || activeUser.fullName || 'Architect';
  const base = (import.meta as any).env?.BASE_URL || '/';

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = Math.round((estimate.usage || 0) / 1024 / 1024);
        const total = 512; // Simulated Chromebook limit
        setStorageInfo({ used, total, percent: (used / total) * 100 });
      });
    }

    const handleOpenTab = (e: any) => {
      if (e.detail?.tab) setCurrentTab(e.detail.tab);
      if (e.detail?.step !== undefined) setResetStep(e.detail.step);
    };
    window.addEventListener('open-settings-tab', handleOpenTab);
    return () => window.removeEventListener('open-settings-tab', handleOpenTab);
  }, []);

  const handleReset = () => resetSystem('activation');
  const handlePasswordUnlock = () => {
    if (password === activeUser.password || !activeUser.password) setResetStep(4);
    else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };
  const checkUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const response = await fetch('/version.json?t=' + Date.now());
      const data = await response.json();
      setTimeout(async () => {
        setIsCheckingUpdate(false);
        if (data.version !== App_Version) {
          const confirmed = await showConfirm(
            `A new software update (macOS Golden Gate ${data.version}) is available. Would you like to update and restart now?`,
            'Software Update',
          );
          if (confirmed) {
            await showAlert('Downloading update and preparing system restart...', 'macOS Updater');
            window.location.href = 'https://macos-27-golden-gate.vercel.app';
          }
        } else {
          await showAlert('Your Mac is up to date.', 'Software Update');
        }
      }, 2000);
    } catch (e) {
      console.error('Update check failed', e);
      setIsCheckingUpdate(false);
    }
  };

  const [latestCommit, setLatestCommit] = useState<string | null>(null);

  useEffect(() => {
    if (systemState.betaUpdates) {
      fetch('https://api.github.com/repos/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/commits/main')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.sha) setLatestCommit(data.sha.substring(0, 7));
        })
        .catch((err) => console.error(err));
    }
  }, [systemState.betaUpdates]);

  const [gpuInfo, setGpuInfo] = useState('Apple GPU');
  const [deviceType, setDeviceType] = useState('Desktop');

  useEffect(() => {
    // 1. The Intelligence: Classify the device
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua) || (navigator as any).userAgentData?.mobile;
    const isTablet =
      /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) ||
      (!isMobile && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    // 4. Real-Time Flex: GPU Info
    const getGPU = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer.replace(/ANGLE \(|\)|Direct3D.*|vs_.*|ps_.*/g, '').trim();
          }
        }
      } catch {
        // webgl not supported or blocked
      }
      return 'Apple M-Series GPU';
    };

    const timer = setTimeout(() => {
      if (isMobile) setDeviceType('Smartphone');
      else if (isTablet) setDeviceType('Tablet');
      else if (battery && (battery.level < 1 || !battery.isCharging)) setDeviceType('Laptop');
      else setDeviceType('Desktop');

      setGpuInfo(getGPU());
    }, 0);

    return () => clearTimeout(timer);
  }, [battery]);

  const renderDeviceImage = () => {
    const base = (import.meta as any).env?.BASE_URL || '/';

    switch (deviceType) {
      case 'Smartphone':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img
              src={`${base}${FileSystemResolver.getDeviceIcon('phone-apple-iphone')}`}
              className="w-24 h-24 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              alt="iPhone"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      case 'Tablet':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img
              src={`${base}${FileSystemResolver.getDeviceIcon('tablet')}`}
              className="w-32 h-32 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              alt="iPad"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      case 'Laptop':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img
              src={`${base}${FileSystemResolver.getDeviceIcon('computer-laptop', true)}`}
              className="w-36 h-36 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              alt="MacBook"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      default:
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img
              src={`${base}${FileSystemResolver.getDeviceIcon('computer', true)}`}
              className="w-36 h-36 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              alt="Mac Studio"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
    }
  };

  const renderGeneralContent = () => {
    switch (resetStep) {
      case 5:
        return (
          <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-hide pb-12">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition">
                <ArrowLeft01Icon size={20} className="hugeicon-golden-gate" />
              </button>
              <h2 className="text-2xl font-semibold">About</h2>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center">
              <div className="mb-8 drop-shadow-2xl">{renderDeviceImage()}</div>

              <h3 className="text-3xl font-black mb-1">
                macOS <span className="font-light">Golden Gate</span>
              </h3>
              <p className="text-xs text-white/40 mb-10 font-black uppercase tracking-[0.3em]">
                Version 27.0.0 (Build 27A405)
              </p>

              <div className="w-full space-y-6 max-w-md text-left font-mono text-[11px]">
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Processor</span>
                  <span className="text-white font-medium">
                    {hardware.cores} Cores ({navigator.platform || 'Unknown'})
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Graphics</span>
                  <span className="text-white font-medium">{gpuInfo}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Memory</span>
                  <span className="text-white font-medium">{hardware.memory} GB</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Storage</span>
                  <span className="text-white font-medium">{storageInfo.total} GB</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Serial Number</span>
                  <span className="text-blue-500 font-bold">Auto-Generated</span>
                </div>
              </div>

              <div className="mt-12 flex gap-3 w-full max-w-md">
                <button
                  onClick={() => setShowAboutWindow(true)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition"
                >
                  System Report...
                </button>
                <a
                  href="https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition flex items-center justify-center"
                >
                  Feedback
                </a>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Regulatory Certification</span>
                  <span className="text-[10px] text-white/30">United States, European Union, Japan, China</span>
                </div>
                <ArrowRight01Icon size={16} className="text-white/20" />
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Limited Warranty</span>
                  <span className="text-xs text-green-500 font-bold">Active</span>
                </div>
                <span className="text-xs text-white/40">Expires: June 22, 2027</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Technical Support</span>
                  <span className="text-xs text-white/40">Complimentary telephone support: Active</span>
                </div>
                <ArrowRight01Icon size={16} className="text-white/20" />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition">
                <ArrowLeft01Icon size={20} className="hugeicon-golden-gate" />
              </button>
              <h2 className="text-2xl font-semibold">Software Update</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center text-center">
              {isCheckingUpdate ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
                  />
                  <h3 className="text-xl font-medium">Checking for updates...</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                    <Settings01Icon size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">macOS Golden Gate {App_Version}</h3>
                  <p className="text-white/50 mb-8">
                    {systemState.betaUpdates && latestCommit ? `Beta Build ${latestCommit}` : 'Your Mac is up to date.'}
                  </p>
                  <button
                    onClick={checkUpdates}
                    className="px-8 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
                  >
                    Check for Updates
                  </button>
                </>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Beta Updates</h4>
                <p className="text-xs text-white/50">Receive pre-release builds from GitHub.</p>
              </div>
              <button
                onClick={() => updateSystemState({ betaUpdates: !systemState.betaUpdates })}
                className={`w-12 h-6 rounded-full relative transition-colors ${systemState.betaUpdates ? 'bg-blue-500' : 'bg-white/10'}`}
              >
                <motion.div
                  animate={{ x: systemState.betaUpdates ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition">
                <ArrowLeft01Icon size={20} className="hugeicon-golden-gate" />
              </button>
              <h2 className="text-2xl font-semibold">Storage</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                  <span className="text-lg font-bold">Macintosh HD</span>
                  <span className="text-xs text-white/40">
                    {storageInfo.used} MB of {storageInfo.total} MB used
                  </span>
                </div>
                <span className="text-sm font-black text-blue-400">{Math.round(100 - storageInfo.percent)}% Free</span>
              </div>
              <div className="w-full h-10 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.max(2, storageInfo.percent)}%` }}
                  title="Apps"
                />
                <div className="h-full bg-purple-500" style={{ width: '8%' }} title="System" />
                <div className="h-full bg-orange-500" style={{ width: '4%' }} title="Cache" />
              </div>
              <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-white/60">Apps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-white/60">System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold text-white/60">Cache</span>
                </div>
              </div>
              <div className="mt-12 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Database01Icon size={28} className="text-blue-400" />
                  <div>
                    <h4 className="font-bold text-sm">Optimize Storage</h4>
                    <p className="text-xs text-white/50">Automatically remove old files to free up space.</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-black transition">
                  Turn On...
                </button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition">
                <ArrowLeft01Icon size={20} className="hugeicon-golden-gate" />
              </button>
              <h2 className="text-2xl font-semibold">Transfer or Reset</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Database01Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Prepare for New Mac</h3>
                  <p className="text-sm text-white/50">Move your data to a new Mac seamlessly.</p>
                </div>
              </div>
              <button className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition mb-4">
                Get Started
              </button>
              <div className="border-t border-white/5 my-6" />
              <button
                onClick={() => setResetStep(2)}
                className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition px-4 text-left"
              >
                Erase All Content and Settings...
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center max-w-lg mx-auto py-8">
            <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-6">
              <Delete02Icon size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center">Erase All Content and Settings</h2>
            <p className="text-center text-white/60 mb-8">
              All settings, data, and media will be erased. This cannot be undone.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setResetStep(1)}
                className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setResetStep(3)}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition shadow-lg shadow-blue-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center max-w-sm mx-auto py-12">
            <motion.div
              animate={{ x: error ? [0, -10, 10, -10, 10, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <LockIcon size={24} className={error ? 'text-red-500' : 'text-white/60'} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Required</h2>
              <p className="text-center text-white/50 text-sm mb-8">Enter password for "{username}".</p>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none transition-all mb-4`}
                autoFocus
              />
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setResetStep(2)}
                  className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordUnlock}
                  className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center max-w-lg mx-auto py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white mb-6 shadow-2xl">
              <Alert01Icon size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Are you sure?</h2>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleReset}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all"
              >
                Erase All Content & Settings
              </button>
              <button
                onClick={() => setResetStep(0)}
                className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-hide pb-12">
            <h2 className="text-2xl font-semibold mb-6">General</h2>
            <div className="space-y-1 mb-8">
              {[
                { name: 'About', icon: InformationCircleIcon, action: () => setResetStep(5) },
                { name: 'Software Update', icon: Settings01Icon, action: () => setResetStep(6) },
                { name: 'Storage', icon: Database01Icon, action: () => setResetStep(7) },
                { name: 'Transfer or Reset', icon: ArrowLeft01Icon, action: () => setResetStep(1) },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                      <item.icon size={20} className="text-white/70" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ArrowRight01Icon size={16} className="text-white/20 group-hover:text-white/50" />
                </div>
              ))}
            </div>


          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full text-white bg-black/40 backdrop-blur-3xl overflow-hidden">
      <div className="w-56 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="p-3">
          <div className="relative">
            <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white/10 border border-white/10 rounded-md py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
          <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer mb-4 bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-3xl overflow-hidden relative bg-white/10">
              <img
                src="/assets/categories/user-identity.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('[data-fallback]');
                    if (fallback) (fallback as HTMLElement).style.display = '';
                  }
                }}
              />
              <span data-fallback style={{ display: 'none' }}>{activeUser.avatar || '👤'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold truncate w-24">{activeUser.fullName || username}</span>
              <span className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">Apple Account</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-2 tracking-widest uppercase">
            Connectivity
          </div>
          <SidebarItem
            name="Wi-Fi"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('network-wireless-hotspot')}`}
            color="bg-blue-500"
            active={currentTab === 'Wi-Fi'}
            onClick={() => setCurrentTab('Wi-Fi')}
          />
          <SidebarItem
            name="Bluetooth"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-system-bluetooth')}`}
            color="bg-blue-600"
            active={currentTab === 'Bluetooth'}
            onClick={() => setCurrentTab('Bluetooth')}
          />
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">
            Personalization
          </div>
          <SidebarItem
            name="Appearance"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-theme-global')}`}
            color="bg-gradient-to-br from-indigo-500 to-blue-600"
            active={currentTab === 'Appearance'}
            onClick={() => {
              setCurrentTab('Appearance');
              setResetStep(0);
            }}
          />
          <SidebarItem
            name="Dock"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-theme-windowdecorations')}`}
            color="bg-gradient-to-br from-orange-500 to-yellow-600"
            active={currentTab === 'Dock'}
            onClick={() => {
              setCurrentTab('Dock');
              setResetStep(0);
            }}
          />
          <SidebarItem
            name="Wallpaper"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-wallpaper')}`}
            color="bg-gradient-to-br from-pink-500 to-red-600"
            active={currentTab === 'Wallpaper'}
            onClick={() => setCurrentTab('Wallpaper')}
          />
          <SidebarItem
            name="General"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-system')}`}
            color="bg-gray-500"
            active={currentTab === 'General'}
            onClick={() => {
              setCurrentTab('General');
              setResetStep(0);
            }}
          />
          <SidebarItem
            name="Users & Groups"
            iconUrl={`${base}assets/preferences/system-users.png`}
            color="bg-indigo-500"
            active={currentTab === 'Users'}
            onClick={() => {
              setCurrentTab('Users');
              setResetStep(0);
            }}
          />
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">
            Hardware
          </div>
          <SidebarItem
            name="Display"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-display')}`}
            color="bg-blue-400"
            active={currentTab === 'Display'}
            onClick={() => setCurrentTab('Display')}
          />
          <SidebarItem
            name="Sound"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-sound')}`}
            color="bg-pink-500"
            active={currentTab === 'Sound'}
            onClick={() => setCurrentTab('Sound')}
          />
          <SidebarItem
            name="Battery"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-system-power')}`}
            color="bg-green-500"
            active={currentTab === 'Battery'}
            onClick={() => setCurrentTab('Battery')}
          />
          <SidebarItem
            name="Wallet & Apple Pay"
            iconUrl={`${base}${FileSystemResolver.getPreferenceIcon('preferences-desktop-cryptography')}`}
            color="bg-zinc-900"
            active={currentTab === 'Wallet'}
            onClick={() => setCurrentTab('Wallet')}
          />{' '}
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + resetStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentTab === 'Appearance' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <div>
                    <h3 className="font-medium text-lg text-white">Theme</h3>
                    <p className="text-sm text-white/50">Choose how macOS Golden Gate looks.</p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <AppearanceCard
                      mode="Light"
                      active={systemState.appearance === 'light'}
                      onClick={() => updateSystemState({ appearance: 'light' })}
                    />
                    <AppearanceCard
                      mode="Dark"
                      active={systemState.appearance === 'dark'}
                      onClick={() => updateSystemState({ appearance: 'dark' })}
                    />
                    <AppearanceCard
                      mode="Auto"
                      active={systemState.appearance === 'auto'}
                      onClick={() => updateSystemState({ appearance: 'auto' })}
                    />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
                  <div className="mb-5">
                    <h3 className="font-medium text-lg text-white">Liquid Glass 2.0</h3>
                    <p className="text-sm text-white/50">
                      Single-axis control: Ultra Frosted to Ultra Glass.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Glass Intensity</span>
                      <span className="text-xs font-mono text-white/40">{systemState.glassMode}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30 w-20 text-right">Ultra Frosted</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={systemState.glassMode}
                        onChange={(e) => updateSystemState({ glassMode: parseInt(e.target.value) })}
                        className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white/30 w-20">Ultra Glass</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
                  <div className="mb-5">
                    <h3 className="font-medium text-lg text-white">Icon Mode</h3>
                    <p className="text-sm text-white/50">Choose between manual Dark/Light app icons or Dynamic time-based switching.</p>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {(['off', 'dynamic'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateSystemState({ iconMode: mode })}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          systemState.iconMode === mode
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {mode === 'off' ? 'Off (Manual)' : 'Dynamic (Auto)'}
                      </button>
                    ))}
                  </div>
                  {systemState.iconMode === 'off' && (
                    <div className="flex gap-2">
                      {(['light', 'dark'] as const).map((sel) => (
                        <button
                          key={sel}
                          onClick={() => updateSystemState({ iconModeSelection: sel })}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            systemState.iconModeSelection === sel
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {sel === 'light' ? 'Light Icons' : 'Dark Icons'}
                        </button>
                      ))}
                    </div>
                  )}
                  {systemState.iconMode === 'dynamic' && (
                    <p className="text-xs text-white/40 mt-2">Icons switch automatically at 5:00 AM (light) and 5:30 PM (dark).</p>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-medium text-lg text-white">Notch</h3>
                      <p className="text-sm text-white/50">Show the hardware notch on Intel Mac and MacBook Air bezel builds.</p>
                    </div>
                    <button
                      onClick={() => updateSystemState({ notchVisible: !systemState.notchVisible })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        systemState.notchVisible ? 'bg-blue-500' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full shadow transition-all ${
                          systemState.notchVisible ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
                  <div className="mb-5">
                    <h3 className="font-medium text-lg text-white">Terminal</h3>
                    <p className="text-sm text-white/50">Customize Terminal appearance.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Background Color</span>
                        <span className="text-xs font-mono text-white/40">{systemState.terminalBgColor}</span>
                      </div>
                      <input
                        type="color"
                        value={systemState.terminalBgColor}
                        onChange={(e) => updateSystemState({ terminalBgColor: e.target.value })}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Ribbon Color</span>
                        <span className="text-xs font-mono text-white/40">{systemState.terminalRibbonColor}</span>
                      </div>
                      <input
                        type="color"
                        value={systemState.terminalRibbonColor}
                        onChange={(e) => updateSystemState({ terminalRibbonColor: e.target.value })}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Background Opacity</span>
                        <span className="text-xs font-mono text-white/40">{Math.round(systemState.terminalOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(systemState.terminalOpacity * 100)}
                        onChange={(e) => updateSystemState({ terminalOpacity: parseInt(e.target.value) / 100 })}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            {currentTab === 'Dock' && (
              <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-hide pb-12">
                <h2 className="text-2xl font-semibold mb-6">Dock</h2>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Size</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockSize}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockSize}
                      onChange={(e) => updateSystemState({ dockSize: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Corner Radius</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockCornerRadius}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockCornerRadius}
                      onChange={(e) => updateSystemState({ dockCornerRadius: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Icon Scaler</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockIconScaler}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockIconScaler}
                      onChange={(e) => updateSystemState({ dockIconScaler: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Hover Smoothness</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockHoverSmoothness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockHoverSmoothness}
                      onChange={(e) => updateSystemState({ dockHoverSmoothness: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Depth</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockDepth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockDepth}
                      onChange={(e) => updateSystemState({ dockDepth: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Blur Strength</span>
                      <span className="text-xs font-mono text-white/40">{systemState.dockBlurStrength}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.dockBlurStrength}
                      onChange={(e) => updateSystemState({ dockBlurStrength: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Magnification</span>
                      <p className="text-xs text-white/40 mt-0.5">Icons enlarge when hovered</p>
                    </div>
                    <button
                      onClick={() => updateSystemState({ dockMagnifier: !systemState.dockMagnifier })}
                      className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${systemState.dockMagnifier ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <motion.div
                        animate={{ x: systemState.dockMagnifier ? 26 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Auto-Hide Dock</span>
                      <p className="text-xs text-white/40 mt-0.5">Dock hides when not in use</p>
                    </div>
                    <button
                      onClick={() => updateSystemState({ autoHideDock: !systemState.autoHideDock })}
                      className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${systemState.autoHideDock ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <motion.div
                        animate={{ x: systemState.autoHideDock ? 26 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'General' && renderGeneralContent()}
            {currentTab === 'Users' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Users & Groups</h2>

                {isLocked && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center">
                      <LockIcon size={36} className="text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm max-w-xs">
                      Settings locked. Click the lock at the bottom to make changes.
                    </p>
                  </div>
                )}

                {!isLocked && (
                  <>
                    {/* Current User Card — Editable */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                      <h3 className="font-bold text-sm text-white/60 uppercase tracking-widest mb-4">Current User</h3>
                      <CurrentUserEditor
                        user={activeUser}
                        onUpdate={(updates) => updateUser(activeUser.id, updates)}
                      />
                    </div>

                    {/* All Users */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                      <h3 className="font-bold text-sm text-white/60 uppercase tracking-widest mb-4">All Users</h3>
                      <div className="space-y-2">
                        {systemState.users.map((u) => (
                          <div
                            key={u.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              u.id === systemState.activeUserId
                                ? 'bg-blue-500/10 border-blue-500/30'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xl overflow-hidden relative bg-white/10">
                                <img
                                  src="/assets/categories/user-identity.png"
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('[data-fallback]');
                                      if (fallback) (fallback as HTMLElement).style.display = '';
                                    }
                                  }}
                                />
                                <span data-fallback style={{ display: 'none' }}>{u.avatar || '👤'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.fullName || 'Unnamed'}</p>
                                <p className="text-[10px] text-white/40">{u.accountName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {u.id !== systemState.activeUserId && (
                                <button
                                  onClick={async () => {
                                    const ok = await showConfirm(`Switch to user "${u.fullName || u.accountName}"?`);
                                    if (ok) switchUser(u.id);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                  Switch
                                </button>
                              )}
                              {u.id === systemState.activeUserId && (
                                <span className="px-3 py-1.5 text-xs font-bold text-blue-400">Active</span>
                              )}
                              {systemState.users.length > 1 && u.id !== systemState.activeUserId && (
                                <button
                                  onClick={async () => {
                                    const ok = await showConfirm(`Remove user "${u.fullName || u.accountName}"?`);
                                    if (ok) removeUser(u.id);
                                  }}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  <Delete02Icon size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add New User */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="font-bold text-sm text-white/60 uppercase tracking-widest mb-4">Add New User</h3>
                      <NewUserForm onAdd={addUser} />
                    </div>
                  </>
                )}

                {/* Lock / Unlock Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (!isLocked) {
                          setIsLocked(true);
                          setUnlockPw('');
                          setUnlockErr(false);
                        } else {
                          if (verifyPassword(unlockPw)) {
                            setIsLocked(false);
                            setUnlockPw('');
                            setUnlockErr(false);
                          } else {
                            setUnlockErr(true);
                          }
                        }
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isLocked
                          ? 'bg-white/10 text-white/70 hover:bg-white/20'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      <LockIcon size={16} />
                    </button>
                    {isLocked ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={unlockPw}
                          onChange={(e) => {
                            setUnlockPw(e.target.value);
                            setUnlockErr(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (verifyPassword(unlockPw)) {
                                setIsLocked(false);
                                setUnlockPw('');
                                setUnlockErr(false);
                              } else {
                                setUnlockErr(true);
                              }
                            }
                          }}
                          placeholder="Enter password to unlock"
                          className={`w-48 px-3 py-1.5 bg-white/5 border ${
                            unlockErr ? 'border-red-500/50' : 'border-white/10'
                          } rounded-lg text-xs text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors`}
                        />
                        {unlockErr && (
                          <span className="text-[10px] text-red-400 font-bold">Wrong password</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-blue-400 font-medium">Unlocked</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'Battery' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Battery</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                      <span className="text-4xl font-black">{Math.round(battery.level * 100)}%</span>
                      <span className="text-sm text-white/40 font-bold uppercase tracking-widest">
                        {battery.isCharging ? 'Power Adapter' : 'On Battery'}
                      </span>
                    </div>
                    <div
                      className={`w-16 h-16 rounded-3xl bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]`}
                    >
                      <BatteryCharging01Icon size={32} />
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <FlashIcon size={24} className="text-yellow-400" />
                        <div>
                          <h4 className="font-bold text-sm">Low Power Mode</h4>
                          <p className="text-xs text-white/40">Disables Gaussian blurs to preserve RAM.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSystemState({ lowPowerMode: !systemState.lowPowerMode })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${systemState.lowPowerMode ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                        <motion.div
                          animate={{ x: systemState.lowPowerMode ? 26 : 2 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Battery Health</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Maximum Capacity</span>
                        <span className="text-sm font-black">100%</span>
                      </div>
                      <p className="text-xs text-white/40">
                        Healthy: Normal. Your battery is currently supporting normal peak performance.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">
                      Power Usage (Last 24h)
                    </h4>
                    <BatteryGraph />
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'Wallpaper' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Wallpaper</h2>
                <div className="grid grid-cols-4 gap-4 pb-8">
                  <div
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === '/wallpapers/golden-gate-light.png' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() =>
                      updateSystemState({ wallpaperUrl: '/wallpapers/golden-gate-light.png', wallpaperType: 'image' })
                    }
                  >
                    <img
                      src="/wallpapers/golden-gate-light.png"
                      alt="Golden Gate Light"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Golden Gate Light
                    </div>
                  </div>
                  <div
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === '/wallpapers/golden-gate-dark.png' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() =>
                      updateSystemState({ wallpaperUrl: '/wallpapers/golden-gate-dark.png', wallpaperType: 'image' })
                    }
                  >
                    <img
                      src="/wallpapers/golden-gate-dark.png"
                      alt="Golden Gate Dark"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Golden Gate Dark
                    </div>
                  </div>
                  <div
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === '/wallpapers/Golden%20Gate%20Dynamic%20Wallpaper.mp4' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() =>
                      updateSystemState({
                        wallpaperUrl: '/wallpapers/Golden%20Gate%20Dynamic%20Wallpaper.mp4',
                        wallpaperType: 'video',
                      })
                    }
                  >
                    <video
                      src="/wallpapers/Golden%20Gate%20Dynamic%20Wallpaper.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Golden Gate
                    </div>
                  </div>
                  <div
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() =>
                      updateSystemState({
                        wallpaperUrl:
                          'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4',
                        wallpaperType: 'video',
                      })
                    }
                  >
                    <video
                      src="https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Khabardar
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-sm">Auto Wallpaper</h4>
                      <p className="text-xs text-white/50">Automatically switch wallpaper based on time of day.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(['off', 'static', 'dynamic'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateSystemState({ wallpaperMode: mode })}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          systemState.wallpaperMode === mode
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {mode === 'off' ? 'Off' : mode === 'static' ? 'Static' : 'Dynamic'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Upload Wallpaper</h4>
                      <p className="text-xs text-white/50">Supports .png, .jpg, .jpeg, .webp, .mp4, .mov, .webm</p>
                    </div>
                    <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-bold cursor-pointer transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const isVideo = file.type.startsWith('video/');
                          if (isVideo) {
                            const url = URL.createObjectURL(file);
                            updateSystemState({ wallpaperUrl: url, wallpaperType: 'video' });
                          } else {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              updateSystemState({ wallpaperUrl: dataUrl, wallpaperType: 'image' });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'Display' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Display</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                  <div className="w-full space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Brightness</span>
                        <span className="text-white/50">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <h4 className="font-bold text-sm">True Tone</h4>
                        <p className="text-xs text-white/40">Automatically adapt display to ambient lighting.</p>
                      </div>
                      <button className="w-10 h-5 rounded-full bg-blue-500 relative">
                        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const CurrentUserEditor: React.FC<{
  user: UserAccount;
  onUpdate: (updates: Partial<UserAccount>) => void;
}> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [accountName, setAccountName] = useState(user.accountName);
  const [pw, setPw] = useState('');
  const [showPwField, setShowPwField] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-4xl overflow-hidden relative bg-white/10">
          <img
            src="/assets/categories/user-identity.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const fallback = parent.querySelector('[data-fallback]');
                if (fallback) (fallback as HTMLElement).style.display = '';
              }
            }}
          />
          <span data-fallback style={{ display: 'none' }}>{user.avatar || '👤'}</span>
        </div>
        <div>
          <p className="text-lg font-bold">{user.fullName || 'Unnamed User'}</p>
          <p className="text-sm text-white/50">{user.accountName || 'No account name'}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 block">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 block">Account Name</label>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 block">Password</label>
          {showPwField ? (
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/50">{user.password ? '••••••••' : 'Not set'}</span>
              <button
                onClick={() => setShowPwField(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          const updates: Partial<UserAccount> = {};
          if (fullName.trim() && fullName !== user.fullName) updates.fullName = fullName.trim();
          if (accountName.trim() && accountName !== user.accountName) updates.accountName = accountName.trim();
          if (pw) updates.password = pw;
          if (Object.keys(updates).length > 0) onUpdate(updates);
        }}
        className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
};

const NewUserForm: React.FC<{ onAdd: (user: Omit<UserAccount, 'id'>) => void }> = ({ onAdd }) => {
  const [fullName, setFullName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPw] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 text-sm font-medium transition-all"
      >
        + Add User Account
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    onAdd({
      fullName: fullName.trim(),
      accountName: accountName.trim() || fullName.trim().toLowerCase().replace(/\s+/g, ''),
      password: password || undefined,
      avatar: '👤',
    });
    setFullName('');
    setAccountName('');
    setPw('');
    setShowForm(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
      />
      <input
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        placeholder="Account Name (optional)"
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Password (optional)"
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Create User
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SidebarItem = ({ name, iconUrl, color, active, onClick }: any) => (
  <div
    onClick={onClick}
    className={`px-2 py-1.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${active ? 'bg-blue-500 text-white shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
  >
    <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center shadow-sm`}>
      {iconUrl ? <img src={iconUrl} alt={name} className="w-4 h-4 object-contain" loading="lazy" /> : null}
    </div>
    <span className="text-sm font-medium">{name}</span>
  </div>
);

const AppearanceCard = ({ mode, active, onClick }: any) => (
  <div className="flex flex-col gap-2 items-center cursor-pointer group" onClick={onClick}>
    <div
      className={`w-24 h-16 rounded-md border-2 transition-all ${active ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
    >
      <div
        className={`w-full h-full rounded-sm ${mode === 'Light' ? 'bg-gray-100' : mode === 'Dark' ? 'bg-zinc-800' : 'bg-gradient-to-r from-gray-100 to-zinc-800'}`}
      />
    </div>
    <span className={`text-xs font-medium ${active ? 'text-blue-400' : 'text-white/70 group-hover:text-white'}`}>
      {mode}
    </span>
  </div>
);
