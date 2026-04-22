import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield01Icon, 
  LockIcon, 
  Clock01Icon, 
  Download01Icon, 
  Compass01Icon, 
  HardDriveIcon,
  UserIcon,
  ArrowRight01Icon,
  Database01Icon,
  Cancel01Icon,
  PlusSignIcon,
  MinusSignIcon
} from 'hugeicons-react';
import { useSystem } from '../contexts/SystemContext';

export const MacOSRecovery: React.FC = () => {
  const { setBootState, systemState } = useSystem();
  const [step, setStep] = useState(1); // 1: Select User, 2: Password, 3: Utilities, 4: TM, 5: Reinstall, 6: Safari, 7: Disk Utility
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const [reinstallStep, setReinstallStep] = useState(1);
  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [selectedDisk, setSelectedDisk] = useState<string | null>(null);

  const username = systemState.user.fullName || 'Architect';

  const utilities = [
    { id: 'tm', name: 'Restore from Time Machine', desc: 'Restore from a local backup or neural snapshot.', icon: Clock01Icon, color: 'bg-green-500' },
    { id: 'reinstall', name: 'Reinstall macOS Tahoe', desc: 'Download and reinstall a fresh copy of macOS.', icon: Download01Icon, color: 'bg-blue-500' },
    { id: 'safari', name: 'Safari', desc: 'Browse Apple Support to get help with your Mac.', icon: Compass01Icon, color: 'bg-white' },
    { id: 'disk', name: 'Disk Utility', desc: 'Repair or erase a disk using Disk Utility.', icon: HardDriveIcon, color: 'bg-gray-500' },
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

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center font-sans select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.1),_transparent_70%)]" />
      
      <AnimatePresence mode="wait">
        {/* STEP 1: SELECT USER */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 flex flex-col items-center max-w-md w-full p-8 text-center">
            <h1 className="text-3xl font-bold mb-12 tracking-tight text-white/90">Recovery Mode</h1>
            <div 
              onClick={() => setStep(2)}
              className="group cursor-pointer flex flex-col items-center p-6 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 shadow-2xl"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserIcon size={48} className="text-white/80 hugeicon-tahoe" />
              </div>
              <span className="text-xl font-medium">{username}</span>
            </div>
            <p className="mt-12 text-white/30 text-xs">Select a user you know the password for to unlock the M5 Max SSD.</p>
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
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <LockIcon size={24} className={`hugeicon-tahoe ${error ? 'text-red-500' : ''}`} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Enter Password</h1>
            <p className="text-white/40 text-sm mb-8 text-center">Enter the password for "{username}" to unlock the disk.</p>
            <input 
              type="password" 
              autoFocus 
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500'} mb-8`}
              placeholder="Password"
            />
            <div className="flex gap-4 w-full">
              <button onClick={() => setStep(1)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition">Back</button>
              <button onClick={handlePasswordNext} disabled={!password} className="flex-1 h-12 bg-white text-black disabled:opacity-50 rounded-xl font-bold transition">Unlock</button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: UTILITIES MENU */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center max-w-2xl w-full p-8">
             <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20"><Shield01Icon size={24} className="hugeicon-tahoe" /></div>
               <h1 className="text-3xl font-bold tracking-tight">macOS Utilities</h1>
             </div>

             <div className="grid grid-cols-1 gap-4 w-full">
               {utilities.map(util => (
                 <div 
                   key={util.id}
                   onClick={() => setStep(util.id === 'tm' ? 4 : util.id === 'reinstall' ? 5 : util.id === 'safari' ? 6 : 7)}
                   className="flex items-center gap-6 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all group"
                 >
                    <div className={`w-14 h-14 rounded-2xl ${util.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                       <util.icon size={28} className={util.id === 'safari' ? 'text-blue-500 hugeicon-tahoe' : 'text-white hugeicon-tahoe'} />
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-semibold">{util.name}</h3>
                       <p className="text-sm text-white/40">{util.desc}</p>
                    </div>
                    <ArrowRight01Icon size={20} className="text-white/20 group-hover:text-white/50 transition-colors hugeicon-tahoe" />
                 </div>
               ))}
             </div>
             
             <button 
               onClick={handleFinish}
               className="mt-12 text-white/40 hover:text-white transition-colors text-sm font-medium"
             >
               Restart...
             </button>
          </motion.div>
        )}

        {/* STEP 4: TIME MACHINE */}
        {step === 4 && <UtilityWindow title="Restore from Time Machine" onClose={() => setStep(3)}>
            <div className="p-8 flex flex-col items-center text-center">
               <Clock01Icon size={64} className="text-green-500 mb-6 hugeicon-tahoe" />
               <h2 className="text-2xl font-bold mb-4">Restore from Backup</h2>
               <p className="text-white/50 mb-8 max-w-sm">Select a Time Machine backup to restore your files and settings to a previous state.</p>
               <div className="w-full space-y-2 bg-white/5 rounded-2xl border border-white/10 p-2">
                  <div className="p-4 bg-white/10 rounded-xl flex justify-between items-center cursor-pointer border border-white/10">
                     <div className="text-left">
                        <div className="font-bold">Today, 10:45 AM</div>
                        <div className="text-xs text-white/40">M5 Max Incremental Snapshot</div>
                     </div>
                     <span className="text-green-400 font-bold text-xs uppercase">Latest</span>
                  </div>
                  <div className="p-4 hover:bg-white/5 rounded-xl flex justify-between items-center cursor-pointer transition-colors">
                     <div className="text-left">
                        <div className="font-medium text-white/70">April 14, 2026, 9:00 PM</div>
                        <div className="text-xs text-white/30">System Update Backup</div>
                     </div>
                  </div>
               </div>
            </div>
        </UtilityWindow>}

        {/* STEP 5: REINSTALL */}
        {step === 5 && <UtilityWindow title="Install macOS Tahoe" onClose={() => setStep(3)}>
          {reinstallStep === 1 && (
            <div className="p-8 flex flex-col items-center text-center h-full">
               <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-2xl flex items-center justify-center border border-white/20">
                  <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20" />
               </div>
               <h2 className="text-3xl font-bold mb-2">macOS Tahoe</h2>
               <p className="text-white/40 mb-8">To set up the installation of macOS Tahoe, click Continue.</p>
               <div className="mt-auto w-full flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition">Back</button>
                  <button onClick={() => setReinstallStep(2)} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition">Continue</button>
               </div>
            </div>
          )}
          {reinstallStep === 2 && (
            <div className="p-8 flex flex-col h-full relative text-center">
               <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
               <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 overflow-y-auto mb-6 text-sm text-white/70 text-left space-y-4">
                 <p className="font-bold">PLEASE READ THIS SOFTWARE LICENSE AGREEMENT CAREFULLY BEFORE USING THE APPLE SOFTWARE.</p>
                 <p>By using the Apple software, you are agreeing to be bound by the terms of this license. If you do not agree to the terms of this license, do not install or use the software.</p>
                 <p>This software includes components of the neural-accelerated "Tahoe" core architecture, liquid glass rendering engines, and M5 specific optimizations. Reverse engineering, decompilation, or disassembly of the Software is strictly prohibited.</p>
                 <p>Apple reserves the right to update or modify these terms at any time. Your continued use of the OS constitutes acceptance of these changes.</p>
               </div>
               <div className="mt-auto w-full flex gap-4">
                  <button onClick={() => setReinstallStep(1)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition">Back</button>
                  <button onClick={() => setShowAgreeModal(true)} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition">Agree</button>
               </div>

               {showAgreeModal && (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
                   <div className="bg-[#2c2c2e] border border-white/10 p-6 rounded-2xl w-80 shadow-2xl flex flex-col items-center">
                     <h3 className="text-lg font-bold mb-2">Agree to Terms?</h3>
                     <p className="text-sm text-white/60 mb-6 text-center">I have read and agree to the macOS Software License Agreement.</p>
                     <div className="flex gap-3 w-full">
                       <button onClick={() => setShowAgreeModal(false)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition">Disagree</button>
                       <button onClick={() => { setShowAgreeModal(false); setReinstallStep(3); }} className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-bold transition">Agree</button>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}
          {reinstallStep === 3 && (
            <div className="p-8 flex flex-col items-center text-center h-full">
               <h2 className="text-2xl font-bold mb-2">Select the disk</h2>
               <p className="text-white/40 mb-12 text-sm">Select the disk where you want to install macOS Tahoe.</p>
               
               <div className="flex justify-center gap-6 mb-auto w-full">
                 <div 
                   onClick={() => setSelectedDisk('Macintosh HD')}
                   className={`flex flex-col items-center p-6 rounded-2xl cursor-pointer border-2 transition-all w-48 ${selectedDisk === 'Macintosh HD' ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                 >
                   <HardDriveIcon size={64} className={selectedDisk === 'Macintosh HD' ? 'text-blue-500 mb-4 hugeicon-tahoe' : 'text-white/60 mb-4 hugeicon-tahoe'} />
                   <span className="font-semibold text-lg mb-1">Macintosh HD</span>
                   <span className="text-xs text-white/40">512 GB total</span>
                 </div>
               </div>

               <div className="mt-auto w-full flex gap-4">
                  <button onClick={() => setReinstallStep(2)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition">Back</button>
                  <button 
                    disabled={!selectedDisk} 
                    onClick={() => setBootState('activation')} 
                    className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 rounded-xl font-bold transition"
                  >
                    Next
                  </button>
               </div>
            </div>
          )}
        </UtilityWindow>}

        {/* STEP 6: SAFARI (HELP) */}
        {step === 6 && <UtilityWindow title="Safari" onClose={() => setStep(3)}>
            <div className="flex flex-col h-full bg-zinc-900">
               <div className="h-10 bg-black/40 border-b border-white/10 flex items-center px-4 gap-4">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-white/10" />
                     <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 h-6 bg-white/5 rounded-md border border-white/10 flex items-center px-3 text-[10px] text-white/50">
                     https://support.apple.com/mac/recovery
                  </div>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <Compass01Icon size={48} className="text-blue-500 mb-6 hugeicon-tahoe" />
                  <h2 className="text-xl font-bold mb-4">Apple Support</h2>
                  <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                     You are browsing the web in Recovery Mode. Some Safari features may be limited.
                  </p>
               </div>
            </div>
        </UtilityWindow>}

        {/* STEP 7: DISK UTILITY */}
        {step === 7 && <UtilityWindow title="Disk Utility" onClose={() => setStep(3)}>
            <div className="flex h-full bg-zinc-900">
               {/* Sidebar */}
               <div className="w-56 border-r border-white/10 flex flex-col p-4 bg-black/20">
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Internal</div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                     <HardDriveIcon size={24} className="text-blue-400 hugeicon-tahoe" />
                     <div>
                        <div className="text-xs font-bold">M5 Max SSD</div>
                        <div className="text-[10px] text-white/40">512 GB APFS</div>
                     </div>
                  </div>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-8 mb-4">External</div>
                  <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                     <Database01Icon size={24} className="text-white/40 hugeicon-tahoe" />
                     <div>
                        <div className="text-xs font-medium">Backup SSD</div>
                        <div className="text-[10px] text-white/30">2 TB ExFAT</div>
                     </div>
                  </div>
               </div>
               {/* Main */}
               <div className="flex-1 flex flex-col">
                  <div className="h-14 border-b border-white/10 flex items-center justify-end px-6 gap-4">
                     <button className="flex flex-col items-center gap-0.5 group">
                        <div className="w-8 h-8 rounded-lg group-hover:bg-white/5 flex items-center justify-center transition-colors"><PlusSignIcon size={16} className="text-white/60 hugeicon-tahoe" /></div>
                        <span className="text-[8px] uppercase font-bold text-white/40">Volume</span>
                     </button>
                     <button className="flex flex-col items-center gap-0.5 group">
                        <div className="w-8 h-8 rounded-lg group-hover:bg-white/5 flex items-center justify-center transition-colors"><MinusSignIcon size={16} className="text-white/60 hugeicon-tahoe" /></div>
                        <span className="text-[8px] uppercase font-bold text-white/40">Erase</span>
                     </button>
                  </div>
                  <div className="flex-1 p-8 flex flex-col items-center">
                     <HardDriveIcon size={80} className="text-blue-500 mb-8 opacity-20 hugeicon-tahoe" />
                     <h2 className="text-2xl font-bold mb-1">M5 Max SSD</h2>
                     <p className="text-xs text-white/30 mb-8 font-mono">Device: disk0s2 | Container: Apple M5 High-Speed</p>
                     
                     <div className="w-full max-w-md h-12 bg-white/5 border border-white/10 rounded-full flex overflow-hidden p-1">
                        <div className="w-[60%] h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/20" />
                        <div className="w-[10%] h-full bg-purple-500 rounded-full ml-1" />
                     </div>
                     <div className="flex justify-between w-full max-w-md mt-4 text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
                        <span>Used: 312 GB</span>
                        <span>Free: 200 GB</span>
                     </div>
                  </div>
               </div>
            </div>
        </UtilityWindow>}
      </AnimatePresence>
    </div>
  );
};

const UtilityWindow = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 1.05 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="fixed inset-20 bg-black/60 backdrop-blur-[80px] border border-white/20 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-50 pointer-events-auto"
  >
     <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
        <div className="flex gap-2">
           <button onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 transition flex items-center justify-center"><Cancel01Icon size={10} className="text-black opacity-0 hover:opacity-100 hugeicon-tahoe" /></button>
           <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
           <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
        </div>
        <div className="text-sm font-semibold tracking-tight text-white/80">{title}</div>
        <div className="w-16" />
     </div>
     <div className="flex-1 overflow-hidden">
        {children}
     </div>
  </motion.div>
);
