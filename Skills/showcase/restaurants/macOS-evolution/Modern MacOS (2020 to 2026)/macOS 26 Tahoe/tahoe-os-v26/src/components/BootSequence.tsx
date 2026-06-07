import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';

export const BootSequence: React.FC = () => {
  const { systemState, setBootState } = useSystem();
  const [progress, setProgress] = useState(0);
  const [breathe, setBreathe] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isDeadDrive, setIsDeadDrive] = useState(false);
  const recoveryTriggered = useRef(false);
  const isDeadDriveRef = useRef(false);

  useEffect(() => {
    isDeadDriveRef.current = isDeadDrive;
  }, [isDeadDrive]);

  useEffect(() => {
    const isInfected = localStorage.getItem('tahoe_infected') === 'true' && systemState.isSystemInfected;
    
    // Keyboard listener for Recovery Mode (Ctrl + M acting as Cmd + R)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        recoveryTriggered.current = true;
        console.log("Recovery Mode Triggered via Keyboard Shortcut");
        if (isDeadDriveRef.current) {
          setIsDeadDrive(false);
          startBoot();
        } else {
          setIsDeadDrive(false); // Recovery overrides dead drive
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Play Startup Chime from public/sounds
    const playChime = () => {
      try {
        const audio = new Audio('/sounds/startup chime.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Startup chime blocked", e));
      } catch (e) {
        console.error("Audio playback error", e);
      }
    };

    const chimeTimeout = setTimeout(playChime, 500);

    // Progress animation: fast to 60%, pause 1.2s, accelerate to 100%
    const startBoot = async () => {
      if (isInfected && !recoveryTriggered.current) {
        await new Promise((r) => setTimeout(r, 2000));
        setIsDeadDrive(true);
        return;
      }

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

    startBoot();

    return () => {
      clearTimeout(chimeTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [systemState.setup_complete, systemState.isSystemInfected, setBootState]);

  if (isDeadDrive) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-between z-50 py-16">
        {/* Empty top spacer to keep the question mark centered */}
        <div className="h-8"></div>

        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {/* Flashing Question Mark */}
          <span className="text-white text-8xl font-normal select-none">?</span>
        </motion.div>

        {/* Support restore link at the bottom */}
        <div className="text-center">
          <a
            href="https://support.apple.com/mac/restore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors text-xs tracking-wider font-light"
          >
            support.apple.com/mac/restore
          </a>
        </div>
      </div>
    );
  }

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
        <svg viewBox="0 0 814 1000" className="w-24 h-24 fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
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
