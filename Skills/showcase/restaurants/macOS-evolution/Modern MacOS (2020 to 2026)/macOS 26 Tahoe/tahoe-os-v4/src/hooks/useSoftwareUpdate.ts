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
        // Fallback repo if environment variable isn't set (commented out for sim)
        // const repo = import.meta.env.VITE_GITHUB_REPO || 'owner/repo'; 
        
        // Simulated fetch for demonstration purposes so the user can experience it immediately
        // In a real scenario, this would be: 
        // const res = await fetch(`https://api.github.com/repos/${repo}/contents`);
        // const tree = await res.json();
        // const hasUpdate = tree.some((node: any) => node.name.startsWith('macOS-27') && node.type === 'dir');
        
        // Simulating the check discovering 'macOS-27'
        const hasUpdate = true; 

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
