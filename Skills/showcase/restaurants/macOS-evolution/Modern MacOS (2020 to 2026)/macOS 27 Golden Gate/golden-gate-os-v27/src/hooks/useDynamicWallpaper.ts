import { useEffect, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { getSunTimes } from '../utils/sunCalc';

type WallpaperStage = 'light' | 'dark';

function getCurrentStage(): WallpaperStage {
  const { isNight } = getSunTimes();
  return isNight ? 'dark' : 'light';
}

function getWallpaper(stage: WallpaperStage, mode: 'static' | 'dynamic') {
  if (mode === 'dynamic') {
    return {
      url:
        stage === 'light'
          ? '/wallpapers/Golden%20Gate%20Dynamic%20Wallpaper.mp4'
          : 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4',
      type: 'video' as const,
    };
  }
  return {
    url: stage === 'light' ? '/wallpapers/golden-gate-light.webp' : '/wallpapers/golden-gate-dark.webp',
    type: 'image' as const,
  };
}

export const useDynamicWallpaper = () => {
  const { systemState, updateSystemState } = useSystem();
  const [stage, setStage] = useState<WallpaperStage>(getCurrentStage);

  useEffect(() => {
    if (systemState.wallpaperMode === 'off') return;

    const mode = systemState.wallpaperMode;
    const wallpaper = getWallpaper(stage, mode);
    if (systemState.wallpaperUrl !== wallpaper.url) {
      updateSystemState({
        wallpaperUrl: wallpaper.url,
        wallpaperType: wallpaper.type,
      });
    }

    const interval = setInterval(() => {
      const newStage = getCurrentStage();
      if (newStage !== stage) {
        setStage(newStage);
        const newWallpaper = getWallpaper(newStage, mode);
        updateSystemState({
          wallpaperUrl: newWallpaper.url,
          wallpaperType: newWallpaper.type,
          appearance: newStage === 'dark' ? 'dark' : 'light',
          iconModeSelection: newStage === 'dark' ? 'dark' : 'light',
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [systemState.wallpaperMode, systemState.wallpaperUrl, stage, updateSystemState]);

  return stage;
};
