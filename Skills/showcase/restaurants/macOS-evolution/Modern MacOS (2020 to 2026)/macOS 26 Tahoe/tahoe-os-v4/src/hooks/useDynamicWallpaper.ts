import { useEffect, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';

type TahoeStage = 'Dawn' | 'Day' | 'Dusk' | 'Night';

const STAGE_WALLPAPERS: Record<TahoeStage, { url: string; type: 'image' | 'video' }> = {
  Dawn: { 
    url: '/wallpapers/tahoe-light.png', 
    type: 'image' 
  },
  Day: { 
    url: '/wallpapers/tahoe-light.png', 
    type: 'image' 
  },
  Dusk: { 
    url: '/wallpapers/tahoe-dark.png', 
    type: 'image' 
  },
  Night: { 
    url: '/wallpapers/tahoe-dark.png', 
    type: 'image' 
  }
};

const calculateTahoeStage = (): TahoeStage => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'Dawn';
  if (hour >= 9 && hour < 17) return 'Day';
  if (hour >= 17 && hour < 21) return 'Dusk';
  return 'Night';
};

export const useDynamicWallpaper = () => {
  const { systemState, updateSystemState } = useSystem();
  const [stage, setStage] = useState<TahoeStage>(calculateTahoeStage);

  useEffect(() => {
    if (!systemState.dynamicWallpaperEnabled) return;

    const currentStage = calculateTahoeStage();
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
      const newStage = calculateTahoeStage();
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
