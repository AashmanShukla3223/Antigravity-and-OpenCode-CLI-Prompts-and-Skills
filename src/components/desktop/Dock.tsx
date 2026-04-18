import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { AppIcon } from '../common/AppIcon';

const apps = [
  { id: 'finder', name: 'Finder' },
  { id: 'apps', name: 'Applications' },
  { id: 'safari', name: 'Safari' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'mail', name: 'Mail' },
  { id: 'messages', name: 'Messages' },
  { id: 'photos', name: 'Photos' },
  { id: 'maps', name: 'Maps' },
  { id: 'phone', name: 'Phone' },
  { id: 'facetime', name: 'FaceTime' },
  { id: 'appstore', name: 'App Store' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'github', name: 'GitHub' },
  { id: 'settings', name: 'Settings' },
];

export const Dock: React.FC = () => {
  const { launchApp, openApps, activeApp, unminimizeApp, minimizedApps } = useSystem();
  const { getDirectoryContents } = useFileSystem();
  
  const trashContents = getDirectoryContents('trash');
  const isTrashFull = trashContents.length > 0;

  // Dock true magnification physics
  const mouseX = useMotionValue(Infinity);
  
  const handleAppClick = (appId: string) => {
    if (appId === 'github') {
      window.open('https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/', '_blank');
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

  return (
    <div className="absolute bottom-4 w-full flex justify-center z-40 pointer-events-none">
      <div 
        className="flex items-end gap-2 px-3 py-2 rounded-3xl bg-white/10 dark:bg-black/20 backdrop-blur-[50px] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {apps.map((app) => (
          <DockIcon 
            key={app.id} 
            app={app} 
            mouseX={mouseX} 
            isOpen={openApps.includes(app.id)}
            isMinimized={false}
            isActive={activeApp === app.id}
            onClick={() => handleAppClick(app.id)}
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

const DockIcon = ({ app, mouseX, isOpen, isMinimized, isFull, isActive, onClick }: any) => {
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
        className={`relative flex items-center justify-center rounded-2xl cursor-pointer shadow-lg
          ${isActive ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20'} 
          ${isMinimized ? 'opacity-40 blur-[1px]' : 'opacity-100'}
          border backdrop-blur-md hover:bg-white/30 transition-all
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
      >
        <AppIcon id={app.id} size={48} isFull={isFull} />
      </motion.div>
      
      {/* Open indicator dot */}
      {isOpen && (
        <div className={`absolute -bottom-1.5 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_5px_white] transition-opacity ${isMinimized ? 'opacity-30' : 'opacity-100'}`} />
      )}
    </div>
  );
};
