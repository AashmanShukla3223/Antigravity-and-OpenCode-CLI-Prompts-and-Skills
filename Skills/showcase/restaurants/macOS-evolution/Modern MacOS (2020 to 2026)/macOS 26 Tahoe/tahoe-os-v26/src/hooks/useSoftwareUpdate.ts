import { useState, useEffect, useRef } from 'react';
import { useSystem } from '../contexts/SystemContext';

export const App_Version = "26.0.1";

function semverCompare(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

const REMINDER_INTERVAL = 3 * 60 * 1000;

export const useSoftwareUpdate = () => {
  const { showConfirm, showAlert, initiateRestart, bootState } = useSystem();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reminderRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReminder = () => {
    if (reminderRef.current) clearTimeout(reminderRef.current);
    reminderRef.current = setTimeout(() => {
      setUpdateAvailable(true);
    }, REMINDER_INTERVAL);
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    scheduleReminder();
  };

  useEffect(() => {
    const audio = new Audio('/sounds/Blow.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    const checkForUpdates = async () => {
      if (bootState !== 'desktop') return;

      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();

        if (data && data.version) {
          console.log(`[OTA] Local: ${App_Version}, Remote: ${data.version}`);
          setLatestVersion(data.version);
          setUpdateNotes(data.release || '');

          if (semverCompare(data.version, App_Version) > 0) {
            setUpdateAvailable(true);

            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          }
        }
      } catch (error) {
        console.error('[OTA] Failed to check for updates:', error);
      }
    };

    let timer: any;
    if (bootState === 'desktop') {
      timer = setTimeout(checkForUpdates, 5000);
    }

    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(interval);
      if (reminderRef.current) clearTimeout(reminderRef.current);
    };
  }, [bootState, showConfirm, showAlert, initiateRestart]);

  return { updateAvailable, dismissUpdate, currentVersion: App_Version, latestVersion, updateNotes };
};
