import { useEffect, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';

type TahoeStage = 'Dawn' | 'Day' | 'Dusk' | 'Night';

const STAGE_WALLPAPERS: Record<TahoeStage, { url: string; type: 'image' | 'video' }> = {
  Dawn: { 
    url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2564&auto=format&fm=webp', 
    type: 'image' 
  },
  Day: { 
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fm=webp', 
    type: 'image' 
  },
  Dusk: { 
    url: 'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=80&w=2564&auto=format&fm=webp', 
    type: 'image' 
  },
  Night: { 
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4b477?q=80&w=2564&auto=format&fm=webp', 
    type: 'image' 
  }
};

export const useDynamicWallpaper = () => {
  const { systemState, updateSystemState } = useSystem();
  const [stage, setStage] = useState<TahoeStage>('Day');

  useEffect(() => {
    if (!systemState.dynamicWallpaperEnabled) return;

    const calculateStage = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 9) return 'Dawn';
      if (hour >= 9 && hour < 17) return 'Day';
      if (hour >= 17 && hour < 21) return 'Dusk';
      return 'Night';
    };

    const currentStage = calculateStage();
    setStage(currentStage);

    const wallpaper = STAGE_WALLPAPERS[currentStage];
    
    // Only update if different to avoid infinite loops
    if (systemState.wallpaperUrl !== wallpaper.url) {
      updateSystemState({
        wallpaperUrl: wallpaper.url,
        wallpaperType: wallpaper.type
      });
    }

    const interval = setInterval(() => {
      const newStage = calculateStage();
      if (newStage !== stage) {
        setStage(newStage);
        const newWallpaper = STAGE_WALLPAPERS[newStage];
        updateSystemState({
          wallpaperUrl: newWallpaper.url,
          wallpaperType: newWallpaper.type
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [systemState.dynamicWallpaperEnabled, systemState.wallpaperUrl, stage, updateSystemState]);

  return stage;
};
