import { useEffect, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';

type GoldenGateStage = 'Dawn' | 'Day' | 'Dusk' | 'Night';

const KHABARDAR = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4';

const STAGE_WALLPAPERS: Record<GoldenGateStage, { url: string; type: 'image' | 'video' }> = {
  Dawn: { url: KHABARDAR, type: 'video' },
  Day: { url: KHABARDAR, type: 'video' },
  Dusk: { url: KHABARDAR, type: 'video' },
  Night: { url: KHABARDAR, type: 'video' }
};

const calculateGoldenGateStage = (): GoldenGateStage => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'Dawn';
  if (hour >= 9 && hour < 17) return 'Day';
  if (hour >= 17 && hour < 21) return 'Dusk';
  return 'Night';
};

export const useDynamicWallpaper = () => {
  const { systemState, updateSystemState } = useSystem();
  const [stage, setStage] = useState<GoldenGateStage>(calculateGoldenGateStage);

  useEffect(() => {
    if (!systemState.dynamicWallpaperEnabled) return;

    const currentStage = calculateGoldenGateStage();
    const wallpaper = STAGE_WALLPAPERS[currentStage];
    
    const timer = setTimeout(() => {
      setStage(currentStage);
      if (systemState.wallpaperUrl !== wallpaper.url) {
        updateSystemState({
          wallpaperUrl: wallpaper.url,
          wallpaperType: wallpaper.type
        });
      }
    }, 0);

    const interval = setInterval(() => {
      const newStage = calculateGoldenGateStage();
      if (newStage !== stage) {
        setStage(newStage);
        const newWallpaper = STAGE_WALLPAPERS[newStage];
        updateSystemState({
          wallpaperUrl: newWallpaper.url,
          wallpaperType: newWallpaper.type
        });
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [systemState.dynamicWallpaperEnabled, systemState.wallpaperUrl, stage, updateSystemState]);

  return stage;
};
