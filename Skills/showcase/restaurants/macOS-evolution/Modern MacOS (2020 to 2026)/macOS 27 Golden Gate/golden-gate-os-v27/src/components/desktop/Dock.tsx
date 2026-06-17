import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
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

  const mouseX = useMotionValue(Infinity);

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
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
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
                  mouseX={mouseX}
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
                mouseX={mouseX}
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
                      mouseX={mouseX}
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
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {minimizedWindows.length > 0 && <div className="w-[1px] h-9 bg-white/20 mx-0.5 self-center" />}

          <DockIcon
            app={{ id: 'downloads', name: 'Downloads' }}
            mouseX={mouseX}
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
          />

          <DockIcon
            app={{ id: 'trash', name: 'Trash' }}
            mouseX={mouseX}
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
          />
        </div>
      )}
    </nav>
  );
};

const getSpringConfig = (smoothness: number) => ({
  mass: 0.5 - smoothness * 0.004,
  stiffness: 300 - smoothness * 2.5,
  damping: 30 - smoothness * 0.22,
});

const DockIcon = ({
  app,
  mouseX,
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
}: any) => {
  const ref = useRef<HTMLDivElement>(null);

  const baseSize = 28 + dockSize * 0.36;
  const hoverScale = 1 + dockIconScaler * 0.008;
  const springConfig = getSpringConfig(dockHoverSmoothness);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distance,
    [-150, 0, 150],
    magnifierEnabled
      ? [baseSize, baseSize * hoverScale, baseSize]
      : [baseSize, baseSize, baseSize],
  );
  const width = useSpring(widthSync, springConfig);

  const [hovered, setHovered] = useState(false);

  const cornerRadius = 4 + dockCornerRadius * 0.32;
  const depthShadow = `0_15px_40px_rgba(0,0,0,${0.2 + dockDepth * 0.005})`;

  return (
    <div className="relative flex flex-col items-center group">
      {hovered && (
        <div className="absolute -top-10 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {app.name}
        </div>
      )}
      <motion.div
        ref={ref}
        style={{ width, height: width, borderRadius: cornerRadius, boxShadow: `0 15px 40px rgba(0,0,0,${0.2 + dockDepth * 0.005})` }}
        animate={
          isLaunching
            ? {
                y: [0, -20, 0],
                transition: { repeat: Infinity, duration: 0.5, ease: 'easeOut' },
              }
            : { y: 0 }
        }
        className={`relative flex items-center justify-center cursor-pointer
          ${isActive ? 'bg-white/20 border-white/40' : ''} 
          ${isMinimized ? 'opacity-40 blur-[1px]' : 'opacity-100'}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
