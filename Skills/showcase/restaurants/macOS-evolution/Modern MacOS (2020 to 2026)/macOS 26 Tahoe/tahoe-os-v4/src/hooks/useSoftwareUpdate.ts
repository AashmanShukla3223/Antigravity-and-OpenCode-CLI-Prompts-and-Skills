import { useState, useEffect, useRef } from 'react';

export const useSoftwareUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Preload the "Blow" sound for Zero-Latency in Tahoe 26.4
    const audio = new Audio('/sounds/Blow.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    // 2. Beta Fetcher Logic
    const checkGitHubForUpdate = async () => {
      try {
        const repo = "google-gemini/macOS-Tahoe"; // Default target repo
        const response = await fetch(`https://api.github.com/repos/${repo}/contents`);
        const data = await response.json();

        if (!data || data.length === 0) return;

        const hasUpdate = data.find((item: any) => item.name === 'macOS-27' && item.type === 'dir');

        if (hasUpdate && !updateAvailable) {
          setUpdateAvailable(true);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      } catch (error) {
        console.error('Failed to fetch update info:', error);
      }
    };

    // Initial check after a short delay for wow-factor, then poll every 10 minutes
    const initialTimer = setTimeout(checkGitHubForUpdate, 3000);
    const pollInterval = setInterval(checkGitHubForUpdate, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollInterval);
    };
  }, [updateAvailable]);

  const dismissUpdate = () => setUpdateAvailable(false);

  return { updateAvailable, dismissUpdate };
};
