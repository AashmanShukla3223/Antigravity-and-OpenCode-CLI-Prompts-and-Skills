/**
 * Icon Debugger - Console utilities for troubleshooting image loading
 * Access globally via: window.__tahoeIconDebugger
 */

export const iconDebugger = {
  // Check if an icon exists and is loadable
  checkIcon: async (iconPath: string): Promise<{ exists: boolean; loadable: boolean; error?: string }> => {
    try {
      const response = await fetch(iconPath, { method: 'HEAD' });
      return {
        exists: response.ok || response.status < 400,
        loadable: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (e) {
      return {
        exists: false,
        loadable: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }
  },

  // Check all Tahoe icons
  checkAllIcons: async () => {
    const icons = [
      'safari', 'settings', 'music', 'messages', 'facetime', 'finder',
      'itunes', 'appstore', 'mail', 'maps', 'photos', 'files',
      'trash_empty', 'trash_full', 'calendar', 'clock', 'contacts',
      'reminders', 'stickies', 'notes', 'terminal', 'activity',
      'calculator', 'phone', 'keynote', 'pages', 'numbers', 'tv',
      'arcade', 'mirroring', 'console', 'controlcenter', 'keychain',
      'apps', 'weather', 'camera', 'books', 'wallet', 'github'
    ];

    console.group('🎨 Tahoe Icon Status');
    const results: Record<string, any> = {};
    for (const icon of icons) {
      const result = await iconDebugger.checkIcon(`/icons/${icon}.png`);
      results[icon] = result;
      const status = result.loadable ? '✅' : '❌';
      console.log(`${status} /icons/${icon}.png`, result);
    }
    console.groupEnd();
    return results;
  },

  // Force reload a specific icon
  reloadIcon: (id: string) => {
    const images = document.querySelectorAll(`img[alt="${id}"]`);
    console.log(`🔄 Reloading ${images.length} ${id} image(s)`);
    images.forEach((img: Element) => {
      const htmlImg = img as HTMLImageElement;
      const src = htmlImg.src;
      htmlImg.src = '';
      // Force repaint
      void htmlImg.offsetHeight;
      htmlImg.src = src;
    });
  },

  // Get current image load state
  getImageLoadState: () => {
    const images = document.querySelectorAll('img[src^="/icons/"]');
    const state: Record<string, any> = {};
    images.forEach((img: Element) => {
      const htmlImg = img as HTMLImageElement;
      const iconPath = htmlImg.src.split('/').pop();
      if (iconPath) {
        state[iconPath] = {
          src: htmlImg.src,
          naturalWidth: htmlImg.naturalWidth,
          naturalHeight: htmlImg.naturalHeight,
          complete: htmlImg.complete,
          currentSrc: htmlImg.currentSrc
        };
      }
    });
    return state;
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  (window as any).__tahoeIconDebugger = iconDebugger;
}
