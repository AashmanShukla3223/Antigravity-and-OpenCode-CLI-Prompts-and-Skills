import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { AppIcon } from '../common/AppIcon';

const ALL_APPS = [
  { id: 'finder', name: 'Finder' },
  { id: 'launchpad', name: 'Launchpad' },
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
];

export const Dock: React.FC = () => {
  const { launchApp, activeApp, unminimizeApp, minimizedApps, launchingApp, systemState, setContextMenu } = useSystem();
  const [reveal, setReveal] = useState(false);
  const { getDirectoryContents } = useFileSystem();
  
  const trashContents = getDirectoryContents('trash');
  const isTrashFull = trashContents.length > 0;

  const dockAppsIds = Array.from(new Set([...systemState.pinnedApps, ...systemState.runningApps]));
  const dockApps = dockAppsIds
    .map(id => ALL_APPS.find(a => a.id === id))
    .filter(Boolean) as { id: string, name: string }[];

  const finalApps = [
    { id: 'finder', name: 'Finder' },
    ...dockApps,
    { id: 'github', name: 'GitHub' }
  ].filter((app, index, self) => 
    index === self.findIndex((t) => t.id === app.id)
  );

  const mouseX = useMotionValue(Infinity);
  
  const handleAppClick = (appId: string) => {
    if (appId === 'github') {
      window.location.href = 'https://github.com/AashmanShukla3223';
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
      onMouseEnter={() => { if (systemState.dockHidden) setReveal(true); }}
      onMouseLeave={() => { if (systemState.dockHidden) setReveal(false); }}
    >
      {isHidden ? (
        <div className="w-full h-1.5 pointer-events-auto cursor-default" />
      ) : (
      <div 
        className="mb-4 flex items-end gap-0.5 px-1.5 py-1.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-[var(--glass-blur)] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto max-w-[85vw] overflow-x-auto scrollbar-hide"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {finalApps.map((app) => (
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
                dockSpeed={systemState.dockSpeed}
                dockSize={systemState.dockSize}
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
            dockSpeed={systemState.dockSpeed}
            dockSize={systemState.dockSize}
            onClick={() => handleAppClick(app.id)}
            onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, app.id)}
          />
          )
        ))}
        
        <div className="w-[1px] h-9 bg-white/20 mx-0.5 self-center" />

        <AnimatePresence mode="popLayout">
          {minimizedApps.map((appId) => (
            <motion.div
              key={`minimized-${appId}`}
              initial={{ width: 0, opacity: 0, scale: 0.5 }}
              animate={{ width: 'auto', opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0 }}
              className="flex items-center overflow-hidden"
            >
              <div className="mx-0.5">
                <DockIcon 
                  app={{ id: appId, name: appId }} 
                  mouseX={mouseX} 
                  isOpen={true}
                  isMinimized={false}
                  isActive={false}
                  magnifierEnabled={systemState.dockMagnifier}
                  dockSpeed={systemState.dockSpeed}
                  dockSize={systemState.dockSize}
                  onClick={() => unminimizeApp(appId)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {minimizedApps.length > 0 && (
          <div className="w-[1px] h-9 bg-white/20 mx-0.5 self-center" />
        )}
        
        <DockIcon 
          app={{ id: 'downloads', name: 'Downloads' }} 
          mouseX={mouseX} 
          isOpen={false}
          isMinimized={false}
          isActive={activeApp === 'downloads'}
          magnifierEnabled={systemState.dockMagnifier}
          dockSpeed={systemState.dockSpeed}
          dockSize={systemState.dockSize}
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
          dockSpeed={systemState.dockSpeed}
          dockSize={systemState.dockSize}
          onClick={() => handleAppClick('trash')}
        />
      </div>
      )}
    </nav>
  );
};

const SPRING_CONFIGS: Record<string, { mass: number; stiffness: number; damping: number }> = {
  fast: { mass: 0.1, stiffness: 150, damping: 12 },
  slow: { mass: 0.3, stiffness: 80, damping: 20 },
};

const SIZE_CONFIGS: Record<string, { base: number; hover: number }> = {
  small: { base: 36, hover: 56 },
  large: { base: 48, hover: 72 },
};

const DockIcon = ({ app, mouseX, isRunning, isMinimized, isFull, isActive, isLaunching, magnifierEnabled, dockSpeed, dockSize, onClick, onContextMenu }: any) => {
  const ref = useRef<HTMLDivElement>(null);

  const sizeConfig = SIZE_CONFIGS[dockSize] || SIZE_CONFIGS.large;
  const springConfig = SPRING_CONFIGS[dockSpeed] || SPRING_CONFIGS.fast;

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distance,
    [-150, 0, 150],
    magnifierEnabled ? [sizeConfig.base, sizeConfig.hover, sizeConfig.base] : [sizeConfig.base, sizeConfig.base, sizeConfig.base]
  );
  const width = useSpring(widthSync, springConfig);

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center group">
      {hovered && (
        <div className="absolute -top-10 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {app.name}
        </div>
      )}
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        animate={isLaunching ? { 
          y: [0, -20, 0],
          transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" }
        } : { y: 0 }}
        className={`relative flex items-center justify-center cursor-pointer
          ${isActive ? 'bg-white/20 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''} 
          ${isMinimized ? 'opacity-40 blur-[1px]' : 'opacity-100'}
          transition-all
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        onContextMenu={onContextMenu}
        whileTap={{ scale: 0.9 }}
      >
        <AppIcon id={app.id} size={sizeConfig.base} isFull={isFull} />
      </motion.div>
      
      {isRunning && (
        <div className={`absolute -bottom-1.5 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_5px_white] transition-opacity ${isMinimized ? 'opacity-30' : 'opacity-100'}`} />
      )}
    </div>
  );
};
