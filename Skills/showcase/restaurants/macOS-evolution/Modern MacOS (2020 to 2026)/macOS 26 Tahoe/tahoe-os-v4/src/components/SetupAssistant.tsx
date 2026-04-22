import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { GlobalIcon, ViewIcon, FlashIcon, InformationCircleIcon } from 'hugeicons-react';

const languages = ["hello", "hola", "bonjour", "namaste", "ciao"];

export const SetupAssistant: React.FC = () => {
  const { systemState, updateSystemState, setBootState } = useSystem();
  const { restoreSystemNodes } = useFileSystem();
  const [step, setStep] = useState(1);
  const [helloIndex, setHelloIndex] = useState(0);
  const [termsScrolled, setTermsScrolled] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('Architect');
  const [accountName, setAccountName] = useState('architect');
  const [password, setPassword] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👤');

  const emojis = ['👤', '🚀', '💻', '🎨', '🎸', '🕹️', '🍵', '🏔️', '🦁', '🦉', '🛸', '⚛️'];

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setHelloIndex(prev => (prev + 1) % languages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === 12) {
      console.log("Setup Step 12: Initializing finalization timer");
      // Automatic finalization after 3s (progress bar fills)
      // Capture form state at this moment
      const userData = { fullName, accountName, password, avatar: selectedEmoji };
      
      const timer = setTimeout(() => {
        console.log("Setup Step 12: Auto-finalizing setup with data:", userData);
        try {
          restoreSystemNodes();
          updateSystemState({
            setup_complete: true,
            user: userData
          });
          setBootState('desktop'); // Fade straight into the Desktop as per PRD
        } catch (e) {
          console.error("Setup finalization error:", e);
          // Force transition anyway
          setBootState('desktop');
        }
      }, 3000);
      return () => {
        console.log("Setup Step 12: Clearing finalization timer");
        clearTimeout(timer);
      };
    }
  }, [step, fullName, accountName, password, selectedEmoji, updateSystemState, setBootState, restoreSystemNodes]);

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 12));
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <motion.div 
      className={`fixed inset-0 z-50 transition-colors duration-1000 ${
        systemState.appearance === 'dark' ? 'bg-black text-white' : 
        systemState.appearance === 'light' ? 'bg-gray-100 text-black' : 
        'bg-zinc-900 text-white' // Auto defaults to dark-ish for now
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dynamic Background Blur - "Deep Obsidian" etc */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: HELLO */}
          {step === 1 && (
            <motion.div key="step1" className="flex flex-col items-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="h-64 flex items-center justify-center relative">
                {/* SVG Path Drawing simulation */}
                <motion.svg width="400" height="200" viewBox="0 0 400 200" className="absolute opacity-30">
                  <motion.path
                    d="M 50,100 Q 100,50 150,100 T 250,100 T 350,100"
                    fill="transparent"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff00ff" />
                      <stop offset="100%" stopColor="#00ffff" />
                    </linearGradient>
                  </defs>
                </motion.svg>
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={languages[helloIndex]}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 1 }}
                    className="text-7xl font-light italic bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 z-10"
                  >
                    {languages[helloIndex]}
                  </motion.h1>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* STEP 2: REGION */}
          {step === 2 && (
            <motion.div key="step2" className="flex flex-col items-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="w-48 h-48 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,150,255,0.3)] animate-spin-slow mb-8 flex items-center justify-center overflow-hidden">
                <GlobalIcon size={80} className="text-blue-400 drop-shadow-[0_0_20px_rgba(0,150,255,0.5)] hugeicon-tahoe" />
              </div>
              <h2 className="text-3xl font-semibold mb-4">Select Your Region</h2>
              <select className="w-64 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center outline-none">
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="apple">Apple Network</option>
              </select>
            </motion.div>
          )}

          {/* STEP 3: ACCESSIBILITY */}
          {step === 3 && (
            <motion.div key="step3" className="flex flex-col items-center text-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Accessibility</h2>
              <div className="flex gap-6">
                {[
                  { name: 'Vision', icon: ViewIcon },
                  { name: 'Motor', icon: FlashIcon },
                  { name: 'Hearing', icon: InformationCircleIcon }
                ].map(acc => (
                  <div key={acc.name} className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">
                    <acc.icon size={32} className="mb-2 text-white/70 group-hover:text-white transition-colors hugeicon-tahoe" />
                    <span>{acc.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: WI-FI */}
          {step === 4 && (
            <motion.div key="step4" className="flex flex-col items-center w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Select a Wi-Fi Network</h2>
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur">
                <div className="p-4 flex justify-between items-center bg-blue-500/20 rounded-xl cursor-pointer border border-blue-500/50">
                  <span className="font-medium">Apple_5G_Fiber</span>
                  <span className="text-blue-400">Connected 📶</span>
                </div>
                <div className="p-4 flex justify-between items-center hover:bg-white/5 rounded-xl cursor-pointer">
                  <span>Unit_7_Guest</span>
                  <span>🔒</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: MIGRATION */}
          {step === 5 && (
            <motion.div key="step5" className="flex flex-col items-center text-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Migration Assistant</h2>
              <div className="flex gap-6">
                {['From a Mac', 'From Windows XP Restaurant', 'Not Now'].map(mig => (
                  <div key={mig} className="w-40 h-48 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer transform hover:scale-105">
                    <span className="text-sm font-medium">{mig}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: APPLE ACCOUNT */}
          {step === 6 && (
            <motion.div key="step6" className="flex flex-col items-center text-center max-w-sm w-full" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-4">Sign in to the Evolution</h2>
              <p className="mb-8 opacity-70">Use your Apple Account to access all Tahoe features.</p>
              <input type="text" placeholder="Apple ID" className="w-full p-4 mb-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none" />
              <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none" />
            </motion.div>
          )}

          {/* STEP 7: TERMS */}
          {step === 7 && (
            <motion.div key="step7" className="flex flex-col items-center w-full max-w-2xl" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-4">Terms and Conditions</h2>
              <div 
                className="w-full h-64 overflow-y-auto bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-sm opacity-80"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
                    setTermsScrolled(true);
                  }
                }}
              >
                <p className="mb-4">Welcome to macOS Tahoe. By using this software, you agree to the principles of the Silicon Surge. Welcome to Apple Inc.</p>
                <p className="mb-4">1. You shall respect the Liquid Glass physics.</p>
                <p className="mb-4">2. You shall not disable 120fps animations.</p>
                <p className="mb-4">3. The Architect (@Aashmanshukla3223) reserves the right to update the UI at any time.</p>
                <p className="mb-4">4. Legacy Restaurants (Windows XP, Apple II) must be honored and maintained.</p>
                <p className="mb-4">5. The GitHub Profile must be maintained.</p>
                <p className="mb-4">6. You Shall say Apple Just Works.</p>
                <p className="mb-4">7. You Must Pay to access Apple Books, App Store and Music.</p>
                <p className="mb-4">8. You Must respect this project.</p>
                <p className="mb-4">9. You must set the password.</p>
                <p className="mb-4">10. You must agree that all assets are connected to Google Drive.</p>

                <div className="h-0"></div>
                <p>End of terms.</p>
                <p>Apple Inc.</p>
              </div>
              {!termsScrolled && <p className="text-xs text-red-400 mt-2">Scroll to bottom to agree</p>}
            </motion.div>
          )}

          {/* STEP 8: COMPUTER ACCOUNT */}
          {step === 8 && (
            <motion.div key="step8" className="flex flex-col items-center w-full max-w-2xl" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Create a Computer Account</h2>
              
              <div className="flex gap-12 items-start w-full">
                {/* Left: Avatar Selection */}
                <div className="flex flex-col items-center gap-4">
                   <div className="w-32 h-32 rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-6xl shadow-2xl">
                      {selectedEmoji}
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                      {emojis.map(e => (
                        <button 
                          key={e} 
                          onClick={() => setSelectedEmoji(e)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedEmoji === e ? 'bg-blue-500 scale-110 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                          {e}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Right: Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Aashman Shukla" 
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Account Name</label>
                    <input 
                      type="text" 
                      value={accountName}
                      onChange={e => setAccountName(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      placeholder="e.g. architect" 
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Required" 
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 9: LOCATION & ANALYTICS */}
          {step === 9 && (
            <motion.div key="step9" className="flex flex-col items-center w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Location & Analytics</h2>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>Enable Location Services</span>
                  <div className="w-12 h-6 bg-blue-500 rounded-full border border-white/20 shadow-[0_0_10px_rgba(0,150,255,0.5)] flex items-center p-1 justify-end">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>Share Mac Analytics</span>
                  <div className="w-12 h-6 bg-white/20 rounded-full border border-white/10 flex items-center p-1">
                    <div className="w-4 h-4 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 10: SIRI */}
          {step === 10 && (
            <motion.div key="step10" className="flex flex-col items-center text-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-12">Siri & Apple Intelligence</h2>
              <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div 
                  className="absolute w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 opacity-20 blur-[60px]"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-600 opacity-40 blur-[40px]"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 relative z-10 flex items-center justify-center shadow-[0_0_80px_rgba(192,38,211,0.6)] border border-white/20">
                  <motion.div 
                    className="w-24 h-24 rounded-full bg-white/10 mix-blend-overlay border border-white/30"
                    animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/10 backdrop-blur-[2px]" />
                </div>
              </div>
              <p className="mt-12 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/50">"Hey Siri, set up my Mac."</p>
            </motion.div>
          )}

          {/* STEP 11: APPEARANCE */}
          {step === 11 && (
            <motion.div key="step11" className="flex flex-col items-center text-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-semibold mb-8">Choose Your Look</h2>
              <div className="flex gap-6">
                {(['Light', 'Dark', 'Auto'] as const).map(mode => (
                  <div 
                    key={mode} 
                    onClick={() => updateSystemState({ appearance: mode.toLowerCase() as any })}
                    className={`w-32 h-40 rounded-2xl border backdrop-blur flex flex-col items-center justify-center cursor-pointer transition ${systemState.appearance === mode.toLowerCase() ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className={`w-16 h-16 rounded-full mb-4 ${mode === 'Light' ? 'bg-white' : mode === 'Dark' ? 'bg-black border border-white/20' : 'bg-gradient-to-r from-white to-black border border-white/20'}`} />
                    <span>{mode}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 12: FINALIZATION */}
          {step === 12 && (
            <motion.div key="step12" className="flex flex-col items-center text-center" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-4xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Setting Up Your Mac...</h2>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-12">
                <motion.div 
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(0,150,255,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => {
                  console.log("Setup: Manual 'Get Started' button clicked");
                  try {
                    restoreSystemNodes();
                    updateSystemState({
                      setup_complete: true,
                      user: { fullName, accountName, password, avatar: selectedEmoji }
                    });
                    console.log("Setup: Transitioning to desktop");
                    setBootState('desktop');
                  } catch (e) {
                    console.error("Setup error on Get Started:", e);
                    setBootState('desktop'); // Force transition anyway
                  }
                }}
                className="px-10 py-3 rounded-xl bg-white text-black font-bold shadow-2xl hover:scale-105 transition-transform"
              >
                Get Started
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM NAV */}
        <div className="absolute bottom-12 w-full flex justify-between px-16 max-w-5xl">
          {step > 1 && step < 12 ? (
            <button 
              onClick={() => setStep(p => p - 1)}
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition"
            >
              Back
            </button>
          ) : <div />}
          
          {step < 12 && (
            <button 
              onClick={handleNext}
              disabled={step === 7 && !termsScrolled}
              className={`px-8 py-2 rounded-full backdrop-blur transition shadow-[0_0_15px_rgba(255,255,255,0.2)] ${step === 7 && !termsScrolled ? 'bg-white/10 text-white/50 border border-white/5' : 'bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'}`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
