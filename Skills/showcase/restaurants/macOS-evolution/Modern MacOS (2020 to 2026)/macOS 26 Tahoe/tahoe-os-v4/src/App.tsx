import { useEffect, useState } from 'react';
import { useSystem } from './contexts/SystemContext';
import { BootSequence } from './components/BootSequence';
import { SetupAssistant } from './components/SetupAssistant';
import { LoginScreen } from './components/LoginScreen';
import { Desktop } from './components/desktop/Desktop';
import { MacOSRecovery } from './components/MacOSRecovery';
import { MacOSActivation } from './components/MacOSActivation';
import { DeviceRecovery } from './components/DeviceRecovery';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { bootState, setBootState, systemState, triggerSystemError, isShuttingDown, shutdownStep } = useSystem();

  useEffect(() => {
    // Robust Infection Lock: If infected and in desktop, ensure storm is running
    // But allow standard boot flow (booting -> login -> desktop)
    if (systemState.isSystemInfected && bootState === 'desktop') {
      const timer = setTimeout(() => {
        triggerSystemError();
      }, 5000); // Wait 5 seconds after reaching desktop
      return () => clearTimeout(timer);
    }
  }, [systemState.isSystemInfected, bootState, triggerSystemError]);

  useEffect(() => {
    console.log('🖥️ App: bootState changed to:', bootState);
  }, [bootState]);

  return (
    <div className={`h-full w-full ${isShuttingDown && shutdownStep >= 4 ? 'cursor-none' : isShuttingDown && shutdownStep >= 3 ? 'is-busy' : ''}`}>
      <DeviceRecovery />
      <AnimatePresence mode="wait">
        {bootState === 'booting' && <BootSequence key="boot" />}
        {bootState === 'setup' && <SetupAssistant key="setup" />}
        {bootState === 'login' && <LoginScreen key="login" />}
        {bootState === 'desktop' && <Desktop key="desktop" />}
        {bootState === 'recovery' && <MacOSRecovery key="recovery" />}
        {bootState === 'activation' && <MacOSActivation key="activation" />}
      </AnimatePresence>

      {/* Shutdown Fake Cursor for Fade Effect */}
      {isShuttingDown && shutdownStep >= 4 && (
        <ShutdownCursor />
      )}
    </div>
  );
}

const ShutdownCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <motion.img
      src="/assets/cursors/busy.png"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeIn" }}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 32,
        height: 32,
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};

export default App;
