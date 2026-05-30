import { useState, useEffect, useRef } from 'react';
import { useSystem } from '../contexts/SystemContext';

export const App_Version = "5.0.0";

export const useSoftwareUpdate = () => {
  const { showConfirm, showAlert, initiateRestart, bootState } = useSystem();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    // Preload notification sound
    const audio = new Audio('/sounds/Blow.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    const checkForUpdates = async () => {
      // Only check if we are on the desktop and haven't prompted yet
      if (bootState !== 'desktop' || hasPromptedRef.current) return;

      try {
        // Fetch version.json from the deployment (Vercel)
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();

        if (data && data.version) {
          console.log(`[OTA] Local: ${App_Version}, Remote: ${data.version}`);
          
          // Simple version comparison (can be enhanced for semver)
          if (data.version !== App_Version) {
            setUpdateAvailable(true);
            
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => console.log('[OTA] Audio play failed:', e));
            }

            // Mark as prompted to avoid spamming
            hasPromptedRef.current = true;

            // Trigger System Notification / Dialog
            const confirmed = await showConfirm(
              `A new software update (macOS Tahoe ${data.version}) is available. Would you like to update and restart now?`,
              "Software Update"
            );

            if (confirmed) {
              await showAlert("Downloading update and preparing system restart...", "macOS Updater");
              initiateRestart();
            }
          }
        }
      } catch (error) {
        console.error('[OTA] Failed to check for updates:', error);
      }
    };

    // Initial check after desktop loads
    let timer: any;
    if (bootState === 'desktop') {
      timer = setTimeout(checkForUpdates, 10000); // 10s delay for smooth experience
    }

    // Periodic check every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(interval);
    };
  }, [bootState, showConfirm, showAlert, initiateRestart]);

  const dismissUpdate = () => setUpdateAvailable(false);

  return { updateAvailable, dismissUpdate, currentVersion: App_Version };
};
