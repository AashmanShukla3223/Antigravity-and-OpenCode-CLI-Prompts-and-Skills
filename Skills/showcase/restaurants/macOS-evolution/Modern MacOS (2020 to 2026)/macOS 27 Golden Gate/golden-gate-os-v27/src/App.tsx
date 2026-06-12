import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSystem } from './contexts/SystemContext';
import { BootSequence } from './components/BootSequence';
import { SetupAssistant } from './components/SetupAssistant';
import { LoginScreen } from './components/LoginScreen';
import { Desktop } from './components/desktop/Desktop';
import { MacOSRecovery } from './components/MacOSRecovery';
import { MacOSActivation } from './components/MacOSActivation';
import { DeviceRecovery } from './components/DeviceRecovery';
import { StructuredData } from './components/StructuredData';
import { usePageMetadata } from './hooks/usePageMetadata';

const SCHEMA_WEBAPP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'macOS 27 Golden Gate',
  description: 'A high-fidelity web-based macOS simulation representing the Unit 7 era of Apple computing.',
  applicationCategory: 'Simulation',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

function App() {
  const { bootState, systemState, triggerSystemError, isShuttingDown, shutdownStep } = useSystem();

  usePageMetadata();

  useEffect(() => {
    if (systemState.isSystemInfected && bootState === 'desktop') {
      const timer = setTimeout(() => {
        triggerSystemError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [systemState.isSystemInfected, bootState, triggerSystemError]);

  useEffect(() => {
    console.log('🖥️ App: bootState changed to:', bootState);
  }, [bootState]);

  return (
    <div className={`h-full w-full ${isShuttingDown && shutdownStep >= 4 ? 'cursor-none' : isShuttingDown && shutdownStep >= 3 ? 'is-busy' : ''}`}>
      <DeviceRecovery />
      <StructuredData id="ld-webapp-dynamic" data={SCHEMA_WEBAPP} />
      <AnimatePresence mode="wait">
        {bootState === 'booting' && <BootSequence key="boot" />}
        {bootState === 'setup' && <SetupAssistant key="setup" />}
        {bootState === 'login' && <LoginScreen key="login" />}
        {bootState === 'desktop' && <Desktop key="desktop" />}
        {bootState === 'recovery' && <MacOSRecovery key="recovery" />}
        {bootState === 'activation' && <MacOSActivation key="activation" />}
      </AnimatePresence>

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
