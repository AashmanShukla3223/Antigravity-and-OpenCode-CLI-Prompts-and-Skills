import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';

export const BootSequence: React.FC = () => {
  const { systemState, setBootState } = useSystem();
  const [progress, setProgress] = useState(0);
  const [breathe, setBreathe] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const recoveryTriggered = useRef(false);

  useEffect(() => {
    // Keyboard listener for Recovery Mode (Ctrl + M acting as Cmd + R)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        recoveryTriggered.current = true;
        console.log("Recovery Mode Triggered via Keyboard Shortcut");
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Play Startup Chime from public/sounds
    const playChime = () => {
      try {
        const audio = new Audio('/sounds/startup chime.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Startup chime blocked by browser policy. User interaction required.", e));
      } catch (e) {
        console.error("Audio playback error", e);
      }
    };

    const chimeTimeout = setTimeout(playChime, 500);

    // Progress animation: fast to 60%, pause 1.2s, accelerate to 100%
    const startBoot = async () => {
      console.log("🥾 Boot: startBoot() called");
      setProgress(60);
      await new Promise((r) => setTimeout(r, 1200));
      setProgress(100);
      
      await new Promise((r) => setTimeout(r, 400));
      setBreathe(true);
      
      await new Promise((r) => setTimeout(r, 500));
      setFadeOut(true);

      await new Promise((r) => setTimeout(r, 800));
      
      console.log("🥾 Boot: Transitioning from booting stage. setup_complete:", systemState.setup_complete);
      
      // Transition to next boot state
      if (recoveryTriggered.current) {
        console.log("Boot: Transitioning to recovery");
        setBootState('recovery');
      } else if (!systemState.setup_complete) {
        console.log("Boot: Transitioning to setup");
        setBootState('setup');
      } else {
        console.log("Boot: Transitioning to login");
        setBootState('login');
      }
    };

    // Safety timeout: if boot doesn't complete in 15s, force transition
    const safetyTimeout = setTimeout(() => {
      console.warn("Boot sequence timeout, forcing transition");
      if (recoveryTriggered.current) {
        setBootState('recovery');
      } else if (!systemState.setup_complete) {
        setBootState('setup');
      } else {
        setBootState('login');
      }
    }, 15000);

    startBoot();

    return () => {
      clearTimeout(chimeTimeout);
      clearTimeout(safetyTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [systemState.setup_complete, setBootState]);

  return (
    <motion.div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1, filter: fadeOut ? 'blur(20px)' : 'blur(0px)' }}
      transition={{ duration: 0.8 }}
    >
      {/* High-res Apple Logo with subtle refractive glow */}
      <motion.div
        className="relative flex justify-center items-center"
        animate={{ scale: breathe ? 1.05 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="absolute w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-[40px]"></div>
        <svg viewBox="0 0 384 512" className="w-24 h-24 fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.7-119.3-65.2-30.7-61.7-90-61.8-91.3zM250.8 131c22.9-26.7 20.8-63.6 15-84.2-22.7 1.8-59 16.5-80.4 39.8-19.7 21-24.9 57.5-17.3 84.4 25.1 1.7 56.4-16.2 82.7-40z"/>
        </svg>
      </motion.div>

      {/* Progress Bar Track */}
      <div className="absolute mt-60 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-white/80 to-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: progress === 60 ? 1 : 0.4, 
            ease: progress === 60 ? "easeOut" : "easeIn" 
          }}
        />
      </div>
    </motion.div>
  );
};
