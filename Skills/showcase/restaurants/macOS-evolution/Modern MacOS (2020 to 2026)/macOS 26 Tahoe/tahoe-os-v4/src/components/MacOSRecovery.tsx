import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield01Icon, 
  LockIcon, 
  Clock01Icon, 
  Compass01Icon, 
  HardDriveIcon,
  UserIcon,
  ArrowRight01Icon,
  Database01Icon,
  Cancel01Icon,
  PlusSignIcon,
  MinusSignIcon,
  Search01Icon,
  MagicWand01Icon
} from 'hugeicons-react';
import { useSystem } from '../contexts/SystemContext';
import { SystemMenuBar } from './common/SystemMenuBar';

export const MacOSRecovery: React.FC = () => {
  const { setBootState, systemState, showAlert } = useSystem();
  const [step, setStep] = useState(1); // 1: Select User, 2: Password, 3: Utilities, 4: TM, 5: Reinstall, 6: Safari, 7: Disk Utility
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  
  // Sub-app states
  const [reinstallStep, setReinstallStep] = useState(1);
  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [selectedDisk, setSelectedDisk] = useState<string | null>(null);
  const [reinstallProgress, setReinstallProgress] = useState(0);

  const [tmRestoring, setTmRestoring] = useState(false);
  const [tmProgress, setTmProgress] = useState(0);

  const [safariUrl] = useState('https://support.apple.com/mac/recovery');
  
  const [diskUtilityAction, setDiskUtilityAction] = useState<string | null>(null);
  const [diskUtilityProgress, setDiskUtilityProgress] = useState(0);

  const username = systemState.user.fullName || 'Architect';

  const utilities = [
    { id: 'tm', name: 'Restore from Time Machine', desc: 'Restore from a local backup or neural snapshot.', iconPath: '/icons/time-machine.png' },
    { id: 'reinstall', name: 'Reinstall macOS Tahoe', desc: 'Download and reinstall a fresh copy of macOS.', iconPath: '/icons/tahoe-installer.png' },
    { id: 'safari', name: 'Safari', desc: 'Browse Apple Support to get help with your Mac.', iconPath: '/icons/safari.png' },
    { id: 'disk', name: 'Disk Utility', desc: 'Repair or erase a disk using Disk Utility.', iconPath: '/icons/disk-utility.png' },
  ];

  const handleFinish = () => setBootState('booting');

  const handlePasswordNext = () => {
    if (password === systemState.user.password || !systemState.user.password) {
      setStep(3);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const startReinstall = () => {
    setReinstallStep(4);
    let p = 0;
    const interval = setInterval(() => {
      p += 0.5;
      setReinstallProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setBootState('activation'), 1000);
      }
    }, 100);
  };

  const startTmRestore = () => {
    setTmRestoring(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setTmProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setBootState('booting'), 1000);
      }
    }, 50);
  };

  const runFirstAid = () => {
    setDiskUtilityAction('Running First Aid on "M5 Max SSD"...');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setDiskUtilityProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDiskUtilityAction(null);
          setDiskUtilityProgress(0);
          showAlert('First Aid process has completed successfully.', 'First Aid Complete');
        }, 500);
      }
    }, 30);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center font-sans select-none overflow-hidden z-[150]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.1),_transparent_70%)]" />
      
      <SystemMenuBar 
        mode="Recovery" 
        showUtilities={step >= 3} 
        onTerminalOpen={() => setTerminalOpen(true)} 
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: SELECT USER */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 flex flex-col items-center max-w-md w-full p-8 text-center">
            <h1 className="text-3xl font-bold mb-12 tracking-tight text-white/90">Recovery Mode</h1>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="group cursor-pointer flex flex-col items-center p-8 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 mb-4 flex items-center justify-center shadow-xl group-hover:shadow-blue-500/20 transition-all">
                <UserIcon size={48} className="text-white/80 hugeicon-tahoe" />
              </div>
              <span className="text-xl font-bold tracking-tight">{username}</span>
            </motion.div>
            <p className="mt-12 text-white/30 text-xs font-medium uppercase tracking-widest">Select a user to unlock the M5 Max SSD.</p>
          </motion.div>
        )}

        {/* STEP 2: PASSWORD */}
        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ 
              opacity: 1, 
              x: error ? [0, -10, 10, -10, 10, 0] : 0 
            }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ x: { duration: 0.4 } }}
            className="relative z-10 flex flex-col items-center max-w-sm w-full p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 backdrop-blur-xl">
              <LockIcon size={24} className={`hugeicon-tahoe ${error ? 'text-red-500' : 'text-white/80'}`} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Enter Password</h1>
            <p className="text-white/40 text-sm mb-8 text-center">Enter the password for "{username}" to unlock the disk.</p>
            <input 
              type="password" 
              autoFocus 
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handlePasswordNext()}
              className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500'} mb-8 shadow-xl backdrop-blur-md transition-all`}
              placeholder="Password"
            />
            <div className="flex gap-4 w-full">
              <button onClick={() => setStep(1)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition border border-white/5">Back</button>
              <button onClick={handlePasswordNext} disabled={!password} className="flex-1 h-12 bg-white text-black disabled:opacity-50 rounded-xl font-bold transition shadow-lg shadow-white/10">Unlock</button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: UTILITIES MENU */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center max-w-2xl w-full p-8">
             <div className="flex items-center gap-4 mb-12">
               <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 backdrop-blur-xl shadow-xl"><Shield01Icon size={28} className="hugeicon-tahoe" /></div>
               <h1 className="text-4xl font-bold tracking-tight text-white/90">macOS Utilities</h1>
             </div>

             <div className="grid grid-cols-1 gap-4 w-full">
               {utilities.map(util => (
                 <motion.div 
                   key={util.id}
                   whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                   whileTap={{ scale: 0.99 }}
                   onClick={() => setStep(util.id === 'tm' ? 4 : util.id === 'reinstall' ? 5 : util.id === 'safari' ? 6 : 7)}
                   className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-[32px] cursor-pointer transition-all group backdrop-blur-xl shadow-2xl"
                 >
                    <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform overflow-hidden p-2">
                       <img src={util.iconPath} alt={util.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-white/90">{util.name}</h3>
                       <p className="text-sm text-white/40 font-medium">{util.desc}</p>
                    </div>
                    <ArrowRight01Icon size={24} className="text-white/20 group-hover:text-white/50 transition-colors hugeicon-tahoe" />
                 </motion.div>
               ))}
             </div>
             
             <button 
               onClick={handleFinish}
               className="mt-12 text-white/30 hover:text-white transition-colors text-sm font-bold uppercase tracking-[0.2em]"
             >
               Restart...
             </button>
          </motion.div>
        )}

        {/* STEP 4: TIME MACHINE */}
        {step === 4 && <UtilityWindow title="Restore from Time Machine" onClose={() => setStep(3)}>
            <div className="p-12 flex flex-col items-center text-center h-full">
               {!tmRestoring ? (
                 <>
                   <Clock01Icon size={80} className="text-green-500 mb-8 hugeicon-tahoe drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]" />
                   <h2 className="text-3xl font-bold mb-4 tracking-tight">Restore from Backup</h2>
                   <p className="text-white/50 mb-10 max-w-sm font-medium leading-relaxed">Select a Time Machine backup to restore your files and settings to a previous state.</p>
                   <div className="w-full space-y-3 bg-white/5 rounded-3xl border border-white/10 p-3 mb-12">
                      <div className="p-5 bg-white/10 rounded-2xl flex justify-between items-center cursor-pointer border border-white/20 shadow-xl group">
                         <div className="text-left">
                            <div className="font-bold text-lg">Today, 10:45 AM</div>
                            <div className="text-xs text-white/40 font-bold uppercase tracking-wider">M5 Max Incremental Snapshot</div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold text-xs uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded-md">Latest</span>
                            <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                               <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                         </div>
                      </div>
                      <div className="p-5 hover:bg-white/5 rounded-2xl flex justify-between items-center cursor-pointer transition-colors border border-transparent">
                         <div className="text-left">
                            <div className="font-bold text-white/70">April 14, 2026, 9:00 PM</div>
                            <div className="text-xs text-white/30 font-bold uppercase tracking-wider">System Update Backup</div>
                         </div>
                      </div>
                   </div>
                   <div className="mt-auto flex gap-4 w-full max-w-md">
                      <button onClick={() => setStep(3)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition border border-white/10">Back</button>
                      <button onClick={startTmRestore} className="flex-1 h-14 bg-green-500 hover:bg-green-600 rounded-2xl font-bold transition shadow-lg shadow-green-500/20">Restore</button>
                   </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full w-full max-w-md">
                    <Clock01Icon size={64} className="text-green-500 mb-12 animate-pulse hugeicon-tahoe" />
                    <h3 className="text-2xl font-bold mb-2">Restoring from Backup</h3>
                    <p className="text-white/40 text-sm mb-12 uppercase tracking-widest font-bold">Time remaining: 2 minutes</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                       <motion.div 
                         className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                         initial={{ width: 0 }}
                         animate={{ width: `${tmProgress}%` }}
                       />
                    </div>
                 </div>
               )}
            </div>
        </UtilityWindow>}

        {/* STEP 5: REINSTALL */}
        {step === 5 && <UtilityWindow title="Install macOS Tahoe" onClose={() => setStep(3)}>
          {reinstallStep === 1 && (
            <div className="p-12 flex flex-col items-center text-center h-full">
               <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-blue-500 to-indigo-600 mb-10 shadow-2xl flex items-center justify-center border border-white/20 relative group">
                  <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full group-hover:blur-[50px] transition-all" />
                  <div className="w-28 h-28 rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner" />
                  <img src="/icons/tahoe-installer.png" className="absolute w-24 h-24 object-contain drop-shadow-2xl" alt="Installer" />
               </div>
               <h2 className="text-4xl font-bold mb-4 tracking-tight">macOS Tahoe</h2>
               <p className="text-white/40 mb-12 text-lg font-medium">To set up the installation of macOS Tahoe, click Continue.</p>
               <div className="mt-auto w-full flex gap-4 max-w-md">
                  <button onClick={() => setStep(3)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition border border-white/10">Back</button>
                  <button onClick={() => setReinstallStep(2)} className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 rounded-2xl font-bold transition shadow-lg shadow-blue-500/20">Continue</button>
               </div>
            </div>
          )}
          {reinstallStep === 2 && (
            <div className="p-12 flex flex-col h-full relative text-center">
               <h2 className="text-3xl font-bold mb-6 tracking-tight">Terms and Conditions</h2>
               <div className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-8 overflow-y-auto mb-8 text-white/70 text-left space-y-6 backdrop-blur-xl scrollbar-hide shadow-inner">
                 <p className="font-bold text-white uppercase tracking-wider">PLEASE READ THIS SOFTWARE LICENSE AGREEMENT CAREFULLY BEFORE USING THE APPLE SOFTWARE.</p>
                 <p>By using the Apple software, you are agreeing to be bound by the terms of this license. If you do not agree to the terms of this license, do not install or use the software.</p>
                 <p>This software includes components of the neural-accelerated "Tahoe" core architecture, liquid glass rendering engines, and M5 specific optimizations. Reverse engineering, decompilation, or disassembly of the Software is strictly prohibited.</p>
                 <p>Apple reserves the right to update or modify these terms at any time. Your continued use of the OS constitutes acceptance of these changes.</p>
                 <p>The "Unit 7" era computing principles apply here. Privacy is a silicon-native primitive, not an afterthought. Your neural signatures are encrypted on the M5 Enclave.</p>
               </div>
               <div className="mt-auto w-full flex gap-4 max-w-md mx-auto">
                  <button onClick={() => setReinstallStep(1)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition border border-white/10">Back</button>
                  <button onClick={() => setShowAgreeModal(true)} className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 rounded-2xl font-bold transition shadow-lg shadow-blue-500/20">Agree</button>
               </div>

               {showAgreeModal && (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
                   <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#2c2c2e]/90 border border-white/10 p-8 rounded-[40px] w-96 shadow-2xl flex flex-col items-center backdrop-blur-3xl">
                     <h3 className="text-2xl font-bold mb-3 tracking-tight">Agree to Terms?</h3>
                     <p className="text-sm text-white/60 mb-8 text-center font-medium leading-relaxed">I have read and agree to the macOS Software License Agreement for macOS Tahoe.</p>
                     <div className="flex gap-4 w-full">
                       <button onClick={() => setShowAgreeModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition border border-white/5">Disagree</button>
                       <button onClick={() => { setShowAgreeModal(false); setReinstallStep(3); }} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-2xl text-sm font-bold transition">Agree</button>
                     </div>
                   </motion.div>
                 </div>
               )}
            </div>
          )}
          {reinstallStep === 3 && (
            <div className="p-12 flex flex-col items-center text-center h-full">
               <h2 className="text-3xl font-bold mb-3 tracking-tight">Select the disk</h2>
               <p className="text-white/40 mb-16 text-lg font-medium">Select the disk where you want to install macOS Tahoe.</p>
               
               <div className="flex justify-center gap-8 mb-auto w-full">
                 <motion.div 
                   whileHover={{ y: -5 }}
                   onClick={() => setSelectedDisk('Macintosh HD')}
                   className={`flex flex-col items-center p-8 rounded-[40px] cursor-pointer border-2 transition-all w-64 backdrop-blur-xl ${selectedDisk === 'Macintosh HD' ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                 >
                   <div className="w-24 h-24 mb-6 relative">
                      <div className={`absolute inset-0 blur-2xl rounded-full transition-opacity ${selectedDisk === 'Macintosh HD' ? 'bg-blue-500/40 opacity-100' : 'bg-white/10 opacity-0'}`} />
                      <HardDriveIcon size={96} className={selectedDisk === 'Macintosh HD' ? 'text-blue-500 relative z-10 hugeicon-tahoe' : 'text-white/60 relative z-10 hugeicon-tahoe'} />
                   </div>
                   <span className="font-bold text-xl mb-1">Macintosh HD</span>
                   <span className="text-xs text-white/40 font-bold uppercase tracking-widest">512 GB APFS Container</span>
                 </motion.div>
               </div>

               <div className="mt-auto w-full flex gap-4 max-w-md">
                  <button onClick={() => setReinstallStep(2)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition border border-white/10">Back</button>
                  <button 
                    disabled={!selectedDisk} 
                    onClick={startReinstall} 
                    className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 rounded-2xl font-bold transition shadow-lg shadow-blue-500/20"
                  >
                    Install
                  </button>
               </div>
            </div>
          )}
          {reinstallStep === 4 && (
            <div className="p-12 flex flex-col items-center justify-center h-full w-full max-w-md">
                <div className="w-32 h-32 mb-12 flex items-center justify-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24"><path d="M12.15 4.39A2.95 2.95 0 0 0 14 3a2.82 2.82 0 0 0-2-1A2.83 2.83 0 0 0 10 4a2.7 2.7 0 0 0 2 1zm4.84 4.88c-.09-2.35 1.76-3.4 1.83-3.44a3.52 3.52 0 0 0-2.82-1.78c-1.2-.13-2.35.7-2.95.7s-1.55-.68-2.55-.65A4.6 4.6 0 0 0 6.6 6.37C5.35 8.5 4.7 11.83 6 14.1c.6 1.05 1.3 2.2 2.45 2.15 1.1-.05 1.55-.7 2.9-.7s1.75.7 2.9.7 1.75-1.15 2.4-2.15a6.45 6.45 0 0 0 1-2.05 3.33 3.33 0 0 1-1.9-3.32z" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Installing macOS Tahoe</h2>
                <p className="text-white/40 text-sm mb-12 uppercase tracking-widest font-bold">About 15 minutes remaining</p>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                   <motion.div 
                     className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${reinstallProgress}%` }}
                   />
                </div>
            </div>
          )}
        </UtilityWindow>}

        {/* STEP 6: SAFARI (HELP) */}
        {step === 6 && <UtilityWindow title="Safari" onClose={() => setStep(3)}>
            <div className="flex flex-col h-full bg-[#111]">
               <div className="h-12 bg-black/40 border-b border-white/10 flex items-center px-6 gap-6 backdrop-blur-xl">
                  <div className="flex gap-2.5">
                     <div className="w-3.5 h-3.5 rounded-full bg-red-500/20" />
                     <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20" />
                     <div className="w-3.5 h-3.5 rounded-full bg-green-500/20" />
                  </div>
                  <div className="flex-1 h-8 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 text-xs text-white/50 font-medium">
                     <Search01Icon size={14} className="mr-3 opacity-40" />
                     {safariUrl}
                  </div>
                  <div className="w-20 flex items-center justify-end">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><PlusSignIcon size={16} className="text-white/40" /></div>
                  </div>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1),_transparent_70%)]" />
                  <Compass01Icon size={80} className="text-blue-500 mb-8 hugeicon-tahoe drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                  <h2 className="text-3xl font-bold mb-4 tracking-tight">Apple Support</h2>
                  <p className="text-lg text-white/40 max-w-sm font-medium leading-relaxed">
                     You are browsing the web in Recovery Mode. Your neural identity is protected by the Silicon Enclave.
                  </p>
                  <div className="mt-12 w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
                     <div className="text-left space-y-4">
                        <div className="font-bold text-white/90">Common Topics:</div>
                        <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-colors border border-white/5">Forgot login password?</div>
                        <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-colors border border-white/5">Activation Lock support</div>
                        <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-colors border border-white/5">Hardware diagnostics</div>
                     </div>
                  </div>
               </div>
            </div>
        </UtilityWindow>}

        {/* STEP 7: DISK UTILITY */}
        {step === 7 && <UtilityWindow title="Disk Utility" onClose={() => setStep(3)}>
            <div className="flex h-full bg-[#111]">
               {/* Sidebar */}
               <div className="w-72 border-r border-white/10 flex flex-col p-6 bg-black/20 backdrop-blur-2xl">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-6 px-2">Internal Storage</div>
                  <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/5">
                     <HardDriveIcon size={32} className="text-blue-400 hugeicon-tahoe" />
                     <div>
                        <div className="text-sm font-bold text-white/90">M5 Max SSD</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">512 GB APFS</div>
                     </div>
                  </div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-10 mb-6 px-2">External Devices</div>
                  <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent">
                     <Database01Icon size={32} className="text-white/40 hugeicon-tahoe" />
                     <div>
                        <div className="text-sm font-bold text-white/60">Backup SSD</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">2 TB ExFAT</div>
                     </div>
                  </div>
               </div>
               {/* Main */}
               <div className="flex-1 flex flex-col relative">
                  <div className="h-16 border-b border-white/10 flex items-center justify-end px-8 gap-6 backdrop-blur-xl">
                     <button onClick={runFirstAid} className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors border border-transparent hover:border-white/10"><MagicWand01Icon size={20} className="text-white/60 hugeicon-tahoe group-hover:text-blue-400" /></div>
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">First Aid</span>
                     </button>
                     <button className="flex flex-col items-center gap-1 group">
                        <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors border border-transparent hover:border-white/10"><PlusSignIcon size={20} className="text-white/60 hugeicon-tahoe" /></div>
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Partition</span>
                     </button>
                     <button className="flex flex-col items-center gap-1 group opacity-50">
                        <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors border border-transparent hover:border-white/10"><MinusSignIcon size={20} className="text-white/60 hugeicon-tahoe" /></div>
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Erase</span>
                     </button>
                  </div>
                  
                  <div className="flex-1 p-12 flex flex-col items-center overflow-y-auto">
                     <div className="w-32 h-32 mb-10 relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full" />
                        <HardDriveIcon size={128} className="text-blue-500 opacity-20 relative z-10 hugeicon-tahoe" />
                     </div>
                     <h2 className="text-3xl font-bold mb-2 tracking-tight">M5 Max SSD</h2>
                     <p className="text-xs text-white/20 mb-12 font-black uppercase tracking-[0.3em]">Device: disk0s2 | Apple M5 Neural Core</p>
                     
                     <div className="w-full max-w-lg h-16 bg-white/5 border border-white/10 rounded-[28px] flex overflow-hidden p-1.5 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-blue-500 rounded-[22px] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                        <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }} className="h-full bg-purple-500 rounded-[22px] ml-1.5 shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                     </div>
                     <div className="flex justify-between w-full max-w-lg mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/30 px-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                           <span>Used: 312 GB</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                           <span>System: 45 GB</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                           <span>Free: 155 GB</span>
                        </div>
                     </div>

                     <div className="w-full max-w-lg mt-16 space-y-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Shield01Icon size={24} className="text-green-400" />
                              <span className="text-sm font-bold">SMART Status</span>
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-3 py-1.5 rounded-xl">Verified</span>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <LockIcon size={24} className="text-blue-400" />
                              <span className="text-sm font-bold">FileVault Encryption</span>
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-xl">Active</span>
                        </div>
                     </div>
                  </div>

                  {/* Action Overlay */}
                  <AnimatePresence>
                    {diskUtilityAction && (
                      <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-12">
                         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-[#2c2c2e]/90 border border-white/10 rounded-[40px] p-10 flex flex-col items-center shadow-2xl backdrop-blur-3xl">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-8 border border-blue-500/20"><MagicWand01Icon size={32} className="text-blue-400 animate-pulse" /></div>
                            <h3 className="text-2xl font-bold mb-2 text-center tracking-tight">{diskUtilityAction}</h3>
                            <p className="text-white/40 text-sm mb-10 font-bold uppercase tracking-widest">Checking volume hierarchy...</p>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                               <motion.div 
                                 className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${diskUtilityProgress}%` }}
                               />
                            </div>
                         </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
        </UtilityWindow>}
      </AnimatePresence>

      {/* Terminal Simulation */}
      <AnimatePresence>
        {terminalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-20 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-3xl h-[550px] bg-black/90 backdrop-blur-3xl border border-white/20 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="h-12 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex gap-2.5">
                  <div onClick={() => setTerminalOpen(false)} className="w-3.5 h-3.5 rounded-full bg-red-500 cursor-pointer hover:bg-red-600 transition shadow-lg shadow-red-500/20" />
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[11px] font-black opacity-40 uppercase tracking-[0.3em] text-white">Terminal — zsh — 80x24</span>
                <div className="w-16" />
              </div>
              <div className="flex-1 p-8 font-mono text-[13px] text-green-400 space-y-3 overflow-y-auto scrollbar-hide">
                <p className="opacity-50 tracking-widest"># macOS Recovery Shell v4.0.26 (M5 Max)</p>
                <p className="opacity-50 tracking-widest"># Neural architecture identified. Secure enclave online.</p>
                <p className="pt-4 flex gap-2">root@recovery <span className="text-white">~</span> % <span className="w-2 h-5 bg-green-500 animate-pulse" /></p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UtilityWindow = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 1.05 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="fixed inset-20 bg-black/60 backdrop-blur-[100px] border border-white/20 rounded-[48px] shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-[250] pointer-events-auto"
  >
     <div className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-3xl">
        <div className="flex gap-2.5">
           <button onClick={onClose} className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition flex items-center justify-center group shadow-lg shadow-red-500/10"><Cancel01Icon size={12} className="text-black opacity-0 group-hover:opacity-100 hugeicon-tahoe" /></button>
           <div className="w-4 h-4 rounded-full bg-zinc-700 shadow-inner" />
           <div className="w-4 h-4 rounded-full bg-zinc-700 shadow-inner" />
        </div>
        <div className="text-sm font-bold tracking-tight text-white/90">{title}</div>
        <div className="w-20" />
     </div>
     <div className="flex-1 overflow-hidden relative">
        {children}
     </div>
  </motion.div>
);
