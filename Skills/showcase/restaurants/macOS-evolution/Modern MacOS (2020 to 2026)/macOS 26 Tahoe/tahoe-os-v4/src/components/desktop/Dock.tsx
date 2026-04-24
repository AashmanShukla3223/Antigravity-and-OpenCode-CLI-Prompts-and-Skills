import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { AppIcon } from '../common/AppIcon';

const ALL_APPS = [
  { id: 'finder', name: 'Finder' },
  { id: 'apps', name: 'Applications' },
  { id: 'safari', name: 'Safari' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'mail', name: 'Mail' },
  { id: 'messages', name: 'Messages' },
  { id: 'music', name: 'Music' },
  { id: 'photos', name: 'Photos' },
  { id: 'maps', name: 'Maps' },
  { id: 'phone', name: 'Phone' },
  { id: 'facetime', name: 'FaceTime' },
  { id: 'appstore', name: 'App Store' },
  { id: 'itunes', name: 'iTunes Store' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'weather', name: 'Weather' },
  { id: 'notes', name: 'Notes' },
  { id: 'github', name: 'GitHub' },
  { id: 'iphonemirroring', name: 'iPhone Mirroring' },
  { id: 'settings', name: 'Settings' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'soundtest', name: 'Sound Test' },
  { id: 'reminders', name: 'Reminders' },
  { id: 'stickies', name: 'Stickies' },
  { id: 'contacts', name: 'Contacts' },
  { id: 'activitymonitor', name: 'Activity Monitor' },
];

export const Dock: React.FC = () => {
  const { launchApp, activeApp, unminimizeApp, minimizedApps, launchingApp, systemState, setContextMenu } = useSystem();
  const { getDirectoryContents } = useFileSystem();
  
  const trashContents = getDirectoryContents('trash');
  const isTrashFull = trashContents.length > 0;

  // Combine pinned apps and currently running apps (dot indicator)
  const dockAppsIds = Array.from(new Set([...systemState.pinnedApps, ...systemState.runningApps]));
  const dockApps = dockAppsIds
    .map(id => ALL_APPS.find(a => a.id === id))
    .filter(Boolean) as { id: string, name: string }[];

  // Applications, Finder and GitHub are special static anchors in this dock
  const finalApps = [
    { id: 'finder', name: 'Finder' },
    { id: 'apps', name: 'Applications' },
    ...dockApps,
    { id: 'github', name: 'GitHub' }
  ].filter((app, index, self) => 
    index === self.findIndex((t) => t.id === app.id)
  );

  // Dock true magnification physics
  const mouseX = useMotionValue(Infinity);
  
  const handleAppClick = (appId: string) => {
    if (appId === 'github') {
      window.open('https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/', '_blank');
      return;
    }
    if (appId === 'finder') {
        launchApp('finder');
        return;
    }
    if (appId === 'apps') {
       launchApp('launchpad');
       return;
    }
    if (appId === 'trash') {
       launchApp('finder');
       window.dispatchEvent(new CustomEvent('finder-navigate', { detail: 'trash' }));
       return;
    }
    launchApp(appId);
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Offset Y to be above the dock
    setContextMenu({ x: e.pageX, y: e.pageY, type: 'dock', targetId: appId });
  };

  return (
    <div className="absolute bottom-4 w-full flex justify-center z-40 pointer-events-none">
      <div 
        className="flex items-end gap-2 px-3 py-2 rounded-3xl bg-white/10 dark:bg-black/20 backdrop-blur-[50px] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {finalApps.map((app) => (
          <DockIcon 
            key={app.id} 
            app={app} 
            mouseX={mouseX} 
            isRunning={systemState.runningApps.includes(app.id)}
            isMinimized={false}
            isActive={activeApp === app.id}
            isLaunching={launchingApp === app.id}
            onClick={() => handleAppClick(app.id)}
            onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, app.id)}
          />
        ))}
        
        {/* Divider */}
        <div className="w-[1px] h-10 bg-white/20 mx-1 self-center" />

        {/* Minimized Windows Space */}
        <AnimatePresence mode="popLayout">
          {minimizedApps.map((appId) => (
            <motion.div
              key={`minimized-${appId}`}
              initial={{ width: 0, opacity: 0, scale: 0.5 }}
              animate={{ width: 'auto', opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0 }}
              className="flex items-center overflow-hidden"
            >
              <div className="mx-1">
                <DockIcon 
                  app={{ id: appId, name: appId }} 
                  mouseX={mouseX} 
                  isOpen={true}
                  isMinimized={false}
                  isActive={false}
                  onClick={() => unminimizeApp(appId)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {minimizedApps.length > 0 && (
          <div className="w-[1px] h-10 bg-white/20 mx-1 self-center" />
        )}
        
        {/* Trash */}
        <DockIcon 
          app={{ id: 'trash', name: 'Trash' }} 
          mouseX={mouseX} 
          isOpen={false}
          isMinimized={false}
          isFull={isTrashFull}
          isActive={activeApp === 'trash'}
          onClick={() => handleAppClick('trash')}
        />
      </div>
    </div>
  );
};

const DockIcon = ({ app, mouseX, isRunning, isMinimized, isFull, isActive, isLaunching, onClick, onContextMenu }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // True Magnification (1.0 -> 1.5 on hover based on distance)
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

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
        <AppIcon id={app.id} size={48} isFull={isFull} />
      </motion.div>
      
      {/* Open indicator dot - Shows if the app is RUNNING (process active) */}
      {isRunning && (
        <div className={`absolute -bottom-1.5 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_5px_white] transition-opacity ${isMinimized ? 'opacity-30' : 'opacity-100'}`} />
      )}
    </div>
  );
};
