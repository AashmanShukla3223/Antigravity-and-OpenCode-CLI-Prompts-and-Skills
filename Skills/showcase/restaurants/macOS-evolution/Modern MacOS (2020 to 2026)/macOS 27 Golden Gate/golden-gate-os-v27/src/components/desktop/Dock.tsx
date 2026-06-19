import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { AppIcon } from '../common/AppIcon';

const ALL_APPS = [
  { id: 'finder', name: 'Finder' },
  { id: 'apps', name: 'Apps' },
  { id: 'safari', name: 'Safari' },
  { id: 'messages', name: 'Messages' },
  { id: 'mail', name: 'Mail' },
  { id: 'maps', name: 'Maps' },
  { id: 'photos', name: 'Photos' },
  { id: 'facetime', name: 'FaceTime' },
  { id: 'phone', name: 'Phone' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'contacts', name: 'Contacts' },
  { id: 'notes', name: 'Notes' },
  { id: 'tv', name: 'Apple TV+' },
  { id: 'music', name: 'Music' },
  { id: 'keynote', name: 'Keynote' },
  { id: 'numbers', name: 'Numbers' },
  { id: 'pages', name: 'Pages' },
  { id: 'appstore', name: 'App Store' },
  { id: 'games', name: 'Games' },
  { id: 'iphonemirroring', name: 'iPhone Mirroring' },
  { id: 'siriai', name: 'Siri' },
  { id: 'settings', name: 'System Settings' },
  { id: 'aboutme', name: 'About Me' },
  { id: 'code', name: 'VS Code' },
  { id: 'vmware', name: 'VMware Fusion Pro' },
  { id: 'samsunglcdtv', name: 'Samsung LCD TV' },
  { id: 'freeform', name: 'Freeform' },
  { id: 'motion', name: 'Motion' },
  { id: 'xcode', name: 'Xcode' },
  { id: 'pixelmatorpro', name: 'Pixelmator Pro' },
  { id: 'finalcutpro', name: 'Final Cut Pro' },
  { id: 'logicpro', name: 'Logic Pro' },
  { id: 'photobooth', name: 'Photo Booth' },
  { id: 'chess', name: 'Chess' },
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'calculator', name: 'Calculator' },
  { id: 'clock', name: 'Clock' },
  { id: 'itunes', name: 'iTunes Store' },
  { id: 'crazyerrors', name: 'Crazy Errors' },
  { id: 'soundtest', name: 'Sound Test' },
  { id: 'weather', name: 'Weather' },
  { id: 'reminders', name: 'Reminders' },
  { id: 'stickies', name: 'Stickies' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'activitymonitor', name: 'Activity Monitor' },
  { id: 'timemachine', name: 'Time Machine' },
  { id: 'diskutility', name: 'Disk Utility' },
  { id: 'installer', name: 'Installer' },
];

export const Dock: React.FC = () => {
  const {
    launchApp,
    activeApp,
    unminimizeWindow,
    minimizedWindows,
    openWindows,
    launchingApp,
    systemState,
    userPinnedApps,
    setContextMenu,
  } = useSystem();
  const [reveal, setReveal] = useState(false);
  const { getDirectoryContents } = useFileSystem();

  const trashContents = getDirectoryContents('trash');
  const isTrashFull = trashContents.length > 0;

  const dockAppsIds = Array.from(new Set([...userPinnedApps, ...systemState.runningApps]));
  const dockApps = dockAppsIds.map((id) => ALL_APPS.find((a) => a.id === id)).filter(Boolean) as {
    id: string;
    name: string;
  }[];

  const finalApps = [{ id: 'finder', name: 'Finder' }, { id: 'apps', name: 'Apps' }, ...dockApps, { id: 'github', name: 'GitHub' }].filter(
    (app, index, self) => index === self.findIndex((t) => t.id === app.id),
  );

  const handleAppClick = (appId: string) => {
    if (appId === 'github') {
      window.location.assign('https://github.com/AashmanShukla3223');
      return;
    }
    if (appId === 'apps') {
      window.dispatchEvent(new CustomEvent('open-apps'));
      return;
    }
    if (appId === 'finder') {
      launchApp('finder');
      return;
    }
    if (appId === 'trash') {
      launchApp('finder');
      window.dispatchEvent(new CustomEvent('finder-navigate', { detail: 'trash' }));
      return;
    }
    if (appId === 'downloads') {
      launchApp('finder');
      window.dispatchEvent(new CustomEvent('finder-navigate', { detail: 'downloads' }));
      return;
    }
    launchApp(appId);
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY, type: 'dock', targetId: appId });
  };

  const isHidden = systemState.dockHidden && !reveal;
  const [hoveredApp, setHoveredApp] = useState<{ id: string; name: string; rect: DOMRect } | null>(null);

  const handleIconHover = useCallback((appId: string, appName: string, hovering: boolean, rect?: DOMRect) => {
    if (hovering && rect) {
      setHoveredApp({ id: appId, name: appName, rect });
    } else if (!hovering) {
      setHoveredApp(null);
    }
  }, []);

  const popOutBaseSize = 20 + systemState.dockSize * 0.24;
  const popOutHoverScale = 1 + systemState.dockIconScaler * 0.018;
  const popOutTargetSize = popOutBaseSize * popOutHoverScale;

  return (
    <nav
      className="absolute bottom-0 w-full flex justify-center z-40 pointer-events-none"
      onMouseEnter={() => {
        if (systemState.dockHidden) setReveal(true);
      }}
      onMouseLeave={() => {
        if (systemState.dockHidden) setReveal(false);
      }}
    >
      {isHidden ? (
        <div className="w-full h-1.5 pointer-events-auto cursor-default" />
      ) : (
        <>
          <div
            data-testid="dock"
          role="navigation"
          aria-label="Application Dock"
          className="mb-4 flex items-end gap-px px-2 py-1 rounded-2xl bg-white/[0.07] dark:bg-black/[0.15] border border-white/[0.12] pointer-events-auto max-w-[85vw] overflow-x-auto scrollbar-hide relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
          style={{
            backdropFilter: `blur(${4 + systemState.dockBlurStrength * 0.2}px)`,
            boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)`,
            borderRadius: `${8 + systemState.dockCornerRadius * 0.28}px`,
          }}
        >
          {finalApps.map((app) =>
            app.id === 'github' ? (
              <a
                key={app.id}
                href="https://github.com/AashmanShukla3223"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto"
                >
                  <DockIcon
                  app={app}
                  isRunning={false}
                  isMinimized={false}
                  isActive={false}
                  isLaunching={false}
                  magnifierEnabled={systemState.dockMagnifier}
                  dockSize={systemState.dockSize}
                  dockCornerRadius={systemState.dockCornerRadius}
                  dockIconScaler={systemState.dockIconScaler}
                  dockHoverSmoothness={systemState.dockHoverSmoothness}
                  dockDepth={systemState.dockDepth}
                  onClick={() => {}}
                  onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, app.id)}
                />
              </a>
            ) : (
              <DockIcon
                key={app.id}
                app={app}
                isRunning={systemState.runningApps.includes(app.id)}
                isMinimized={false}
                isActive={activeApp === app.id}
                isLaunching={launchingApp === app.id}
                magnifierEnabled={systemState.dockMagnifier}
                dockSize={systemState.dockSize}
                dockCornerRadius={systemState.dockCornerRadius}
                dockIconScaler={systemState.dockIconScaler}
                dockHoverSmoothness={systemState.dockHoverSmoothness}
                dockDepth={systemState.dockDepth}
                onClick={() => handleAppClick(app.id)}
                onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, app.id)}
                onHoverChange={handleIconHover}
              />
            ),
          )}

          <div className="w-[1px] h-8 bg-white/15 mx-1 self-center" />

          <AnimatePresence mode="popLayout">
            {minimizedWindows.map((wId) => {
              const win = openWindows.find((w) => w.id === wId);
              const appName = win?.appId || wId;
              return (
                <motion.div
                  key={`minimized-${wId}`}
                  initial={{ width: 0, opacity: 0, scale: 0.5 }}
                  animate={{ width: 'auto', opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0 }}
                  className="flex items-center overflow-hidden"
                >
                  <div className="mx-0.5">
                    <DockIcon
                      app={{ id: appName, name: appName }}
                    isOpen={true}
                    isMinimized={false}
                    isActive={false}
                    magnifierEnabled={systemState.dockMagnifier}
                    dockSize={systemState.dockSize}
                    dockCornerRadius={systemState.dockCornerRadius}
                    dockIconScaler={systemState.dockIconScaler}
                    dockHoverSmoothness={systemState.dockHoverSmoothness}
                    dockDepth={systemState.dockDepth}
                    onClick={() => unminimizeWindow(wId)}
                    onHoverChange={handleIconHover}
                  />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {minimizedWindows.length > 0 && <div className="w-[1px] h-9 bg-white/20 mx-0.5 self-center" />}

            <DockIcon
              app={{ id: 'downloads', name: 'Downloads' }}
              isOpen={false}
              isMinimized={false}
              isActive={activeApp === 'downloads'}
              magnifierEnabled={systemState.dockMagnifier}
              dockSize={systemState.dockSize}
              dockCornerRadius={systemState.dockCornerRadius}
              dockIconScaler={systemState.dockIconScaler}
              dockHoverSmoothness={systemState.dockHoverSmoothness}
              dockDepth={systemState.dockDepth}
              onClick={() => handleAppClick('downloads')}
              onHoverChange={handleIconHover}
            />

            <DockIcon
              app={{ id: 'trash', name: 'Trash' }}
              isOpen={false}
              isMinimized={false}
              isFull={isTrashFull}
              isActive={activeApp === 'trash'}
              magnifierEnabled={systemState.dockMagnifier}
              dockSize={systemState.dockSize}
              dockCornerRadius={systemState.dockCornerRadius}
              dockIconScaler={systemState.dockIconScaler}
              dockHoverSmoothness={systemState.dockHoverSmoothness}
              dockDepth={systemState.dockDepth}
              onClick={() => handleAppClick('trash')}
              onHoverChange={handleIconHover}
            />
          </div>

          <AnimatePresence>
            {hoveredApp && systemState.dockMagnifier && (
              <motion.div
                key={hoveredApp.id}
                initial={{ scale: 0.5, opacity: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, y: -(popOutBaseSize * 0.35) }}
                exit={{ scale: 0.5, opacity: 0, y: 0 }}
                style={{
                  position: 'fixed',
                  top: hoveredApp.rect.top,
                  left: hoveredApp.rect.left,
                  width: popOutTargetSize,
                  height: popOutTargetSize,
                  borderRadius: 4 + systemState.dockCornerRadius * 0.32,
                  boxShadow: `0 30px 70px rgba(0,0,0,${0.5 + systemState.dockDepth * 0.005})`,
                  zIndex: 50,
                }}
                transition={{
                  type: 'spring' as const,
                  mass: 0.5 - systemState.dockHoverSmoothness * 0.004,
                  stiffness: 300 - systemState.dockHoverSmoothness * 2.5,
                  damping: 30 - systemState.dockHoverSmoothness * 0.22,
                }}
                className="flex items-center justify-center"
              >
                <div className="absolute -top-10 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-lg border border-white/10 whitespace-nowrap">
                  {hoveredApp.name}
                </div>
                <AppIcon id={hoveredApp.id} size={popOutBaseSize} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </nav>
  );
};

const DockIcon = ({
  app,
  isRunning,
  isMinimized,
  isFull,
  isActive,
  isLaunching,
  magnifierEnabled,
  dockSize,
  dockCornerRadius,
  dockIconScaler,
  dockHoverSmoothness,
  dockDepth,
  onClick,
  onContextMenu,
  onHoverChange,
}: any) => {
  const [hovered, setHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const baseSize = 20 + dockSize * 0.24;
  const hoverScale = 1 + dockIconScaler * 0.018;
  const targetSize = hovered && magnifierEnabled ? baseSize * hoverScale : baseSize;
  const cornerRadius = 4 + dockCornerRadius * 0.32;

  const springTransition = {
    type: 'spring' as const,
    mass: 0.5 - dockHoverSmoothness * 0.004,
    stiffness: 300 - dockHoverSmoothness * 2.5,
    damping: 30 - dockHoverSmoothness * 0.22,
  };

  const handleHoverStart = () => {
    setHovered(true);
    if (onHoverChange && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      onHoverChange(app.id, app.name, true, rect);
    }
  };

  const handleHoverEnd = () => {
    setHovered(false);
    if (onHoverChange) {
      onHoverChange(app.id, app.name, false);
    }
  };

  return (
    <div className="relative flex flex-col items-center group">
      {hovered && !magnifierEnabled && (
        <div className="absolute -top-10 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-lg border border-white/10 whitespace-nowrap opacity-100 transition-opacity">
          {app.name}
        </div>
      )}
      <motion.div
        ref={iconRef}
        style={{
          borderRadius: cornerRadius,
          boxShadow: `0 15px 40px rgba(0,0,0,${0.2 + dockDepth * 0.005})`,
        }}
        animate={{
          width: isLaunching ? baseSize : targetSize,
          height: isLaunching ? baseSize : targetSize,
          y: isLaunching ? [0, -20, 0] : 0,
        }}
        transition={{
          width: isLaunching ? { duration: 0.1 } : springTransition,
          height: isLaunching ? { duration: 0.1 } : springTransition,
          y: isLaunching ? { repeat: Infinity, duration: 0.5, ease: 'easeOut' } : { duration: 0.2 },
        }}
        className={`relative flex items-center justify-center cursor-pointer
          ${isActive ? 'bg-white/20 border-white/40' : ''} 
          ${isMinimized ? 'opacity-40 blur-[1px]' : 'opacity-100'}
        `}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onClick={onClick}
        onContextMenu={onContextMenu}
        whileTap={{ scale: 0.9 }}
      >
        <AppIcon id={app.id} size={baseSize} isFull={isFull} />
      </motion.div>

      {isRunning && (
        <div
          className={`absolute -bottom-1.5 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_5px_white] transition-opacity ${isMinimized ? 'opacity-30' : 'opacity-100'}`}
        />
      )}
    </div>
  );
};
