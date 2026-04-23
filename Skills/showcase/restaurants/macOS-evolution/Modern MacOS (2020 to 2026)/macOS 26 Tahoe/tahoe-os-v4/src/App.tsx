import { useEffect } from 'react';
import { useSystem } from './contexts/SystemContext';
import { BootSequence } from './components/BootSequence';
import { SetupAssistant } from './components/SetupAssistant';
import { LoginScreen } from './components/LoginScreen';
import { Desktop } from './components/desktop/Desktop';
import { MacOSRecovery } from './components/MacOSRecovery';
import { MacOSActivation } from './components/MacOSActivation';
import { DeviceRecovery } from './components/DeviceRecovery';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { bootState } = useSystem();

  useEffect(() => {
    console.log('🖥️ App: bootState changed to:', bootState);
  }, [bootState]);

  return (
    <>
      <DeviceRecovery />
      <AnimatePresence mode="wait">
        {bootState === 'booting' && <BootSequence key="boot" />}
        {bootState === 'setup' && <SetupAssistant key="setup" />}
        {bootState === 'login' && <LoginScreen key="login" />}
        {bootState === 'desktop' && <Desktop key="desktop" />}
        {bootState === 'recovery' && <MacOSRecovery key="recovery" />}
        {bootState === 'activation' && <MacOSActivation key="activation" />}
      </AnimatePresence>
    </>
  );
}

export default App;
