import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { ControlCenter } from './ControlCenter';
import { Window } from './Window';
import { AboutThisMac } from '../apps/AboutThisMac';
import { RestartDialog } from './RestartDialog';
import { WallpaperEngine } from './WallpaperEngine';
import { Spotlight } from './Spotlight';
import { Folder01Icon, File01Icon } from 'hugeicons-react';
import { useDynamicWallpaper } from '../../hooks/useDynamicWallpaper';
import { useSoftwareUpdate } from '../../hooks/useSoftwareUpdate';
import { NotificationBanner } from './NotificationBanner';
import { IncomingCallOverlay } from './IncomingCallOverlay';

export const Desktop: React.FC = () => {
  const { systemState, updateSystemState, openApps, minimizedApps, contextMenu, setContextMenu, showSpotlight, setShowSpotlight, launchApp, setShowWidgetPicker } = useSystem();
  const { createNode, addTag, getDirectoryContents, deleteNode } = useFileSystem();
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  
  // Initialize Hooks
  useDynamicWallpaper();
  const { updateAvailable, dismissUpdate } = useSoftwareUpdate();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, type: 'desktop' });
    setControlCenterOpen(false); // Close CC if open
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setShowSpotlight(!showSpotlight);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSpotlight, setShowSpotlight]);

  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.pageX, y: e.pageY, type: 'writing' });
      }
    };
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, [setContextMenu]);

  const closeMenus = () => {
    setContextMenu(null);
    if (controlCenterOpen) setControlCenterOpen(false);
  };

  const desktopItems = getDirectoryContents('desktop');

  return (
    <div 
      className={`fixed inset-0 w-full h-full overflow-hidden select-none transition-shadow duration-700 ${systemState.isCameraOn ? 'shadow-[inset_0_0_150px_rgba(255,255,255,0.2)] ring-4 ring-white/10' : ''}`}
      onClick={closeMenus}
      onContextMenu={handleContextMenu}
    >
      <WallpaperEngine url={systemState.wallpaperUrl} type={systemState.wallpaperType} />

      {/* Desktop Items Grid */}
      <div className="absolute inset-0 z-0 p-4 pt-12 flex flex-col flex-wrap gap-4 content-end pointer-events-none">
         {desktopItems.map(item => (
           <motion.div
             key={item.id}
             onDoubleClick={() => {
                if (item.type === 'folder') launchApp('finder');
             }}
             onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.pageX, y: e.pageY, type: 'item', targetId: item.id });
             }}
             className="w-20 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10 pointer-events-auto cursor-default group"
           >
              <div className="relative">
                {item.customIcon ? (
                  <img src={item.customIcon} alt={item.name} className="w-12 h-12 object-contain drop-shadow-lg" />
                ) : item.type === 'folder' ? (
                  <Folder01Icon size={48} className="text-blue-400 fill-blue-500/20 drop-shadow-lg hugeicon-tahoe" />
                ) : (
                  <File01Icon size={48} className="text-white/80 drop-shadow-lg hugeicon-tahoe" />
                )}
                {/* Tags */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
                   {item.tags?.map(color => (
                     <div key={color} className={`w-2 h-2 rounded-full bg-${color}-500 border border-white/20 shadow-sm`} />
                   ))}
                </div>
              </div>
              <span className="text-[11px] font-medium text-white text-center break-words w-full drop-shadow-md leading-tight">
                {item.name}
              </span>
           </motion.div>
         ))}
      </div>

      {/* The Notch (180px x 30px, Center Anchor) */}
      {systemState.notchVisible && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[30px] bg-black rounded-b-[18px] z-50 flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-x border-b border-white/5">
          {/* Camera LED Dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${systemState.isCameraOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-[#111]'} transition-colors ml-12`} />
        </div>
      )}

      {/* OS Shell Components */}
      <MenuBar toggleControlCenter={(e) => {
        e.stopPropagation();
        setControlCenterOpen(!controlCenterOpen);
        setContextMenu(null);
      }} />

      {/* Windows Layer */}
      <div className="absolute inset-0 z-10 pt-8 pb-20 pointer-events-none">
        <AnimatePresence>
          {openApps.filter(id => !minimizedApps.includes(id)).map(appId => (
            <Window key={appId} appId={appId} />
          ))}
        </AnimatePresence>
      </div>

      {/* Control Center Overlay */}
      <AnimatePresence>
        {controlCenterOpen && (
          <ControlCenter isOpen={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
        )}
      </AnimatePresence>

      <Dock />

      <AboutThisMac />
      <RestartDialog />
      <NotificationBanner isVisible={updateAvailable} onDismiss={dismissUpdate} />
      <Spotlight />
      <IncomingCallOverlay />

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="absolute z-[300] w-64 bg-black/40 backdrop-blur-[60px] saturate-[190%] border border-white/20 rounded-2xl shadow-2xl py-2 flex flex-col gap-0.5"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {contextMenu.type === 'desktop' ? (
              <>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                  const name = prompt('Folder Name:', 'New Folder');
                  if (name) createNode({ name, type: 'folder', parentId: 'desktop' });
                  setContextMenu(null);
                }}>New Folder</div>
                <div className="border-b border-white/10 my-1 mx-3" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                  const nextAppearance = systemState.appearance === 'light' ? 'dark' : 'light';
                  updateSystemState({ appearance: nextAppearance });
                  setContextMenu(null);
                }}>
                  Toggle Appearance
                </div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => updateSystemState({ wallpaperUrl: 'https://images.unsplash.com/photo-1635837958542-a381046eb53e?q=80&w=2670&auto=format&fm=webp', wallpaperType: 'image' })}>
                  Change Wallpaper
                </div>
                <div className="border-b border-white/10 my-1 mx-3" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                   setShowWidgetPicker(true);
                   setContextMenu(null);
                }}>
                  Edit Widgets
                </div>
              </>
            ) : contextMenu.type === 'writing' ? (
              <>
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Writing Tools
                </div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => setContextMenu(null)}>Proofread</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => setContextMenu(null)}>Rewrite...</div>
                <div className="border-b border-white/10 my-1 mx-3" />
                <div className="px-4 py-1.5 text-sm text-white/50 cursor-default mx-1.5 flex justify-between">Set Tone <span className="text-[10px]">▶</span></div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => setContextMenu(null)}>Summarize</div>
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">Item Actions</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-red-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                   if (contextMenu.targetId) deleteNode(contextMenu.targetId);
                   setContextMenu(null);
                }}>Move to Trash</div>
                <div className="border-b border-white/10 my-1 mx-3" />
                <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/30">Tags</div>
                <div className="px-4 py-2 flex gap-2 mx-1.5">
                   {['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'].map(color => (
                     <button 
                       key={color}
                       onClick={() => {
                         if (contextMenu.targetId) addTag(contextMenu.targetId, color as any);
                         setContextMenu(null);
                       }}
                       className={`w-5 h-5 rounded-full bg-${color}-500 border border-white/10 hover:scale-125 transition-transform shadow-lg`}
                     />
                   ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
