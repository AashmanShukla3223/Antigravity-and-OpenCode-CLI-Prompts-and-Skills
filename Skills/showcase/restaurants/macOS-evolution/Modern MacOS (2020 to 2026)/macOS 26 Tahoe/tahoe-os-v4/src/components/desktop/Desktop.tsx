import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Folder01Icon, 
  File01Icon, 
  Sun01Icon, 
  PlayIcon, 
  PauseIcon, 
  ArrowRight01Icon, 
  Tick01Icon
} from 'hugeicons-react';
import { useDynamicWallpaper } from '../../hooks/useDynamicWallpaper';
import { useSoftwareUpdate } from '../../hooks/useSoftwareUpdate';
import { NotificationBanner } from './NotificationBanner';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { WidgetPicker } from './WidgetPicker';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { contacts } from '../../utils/contacts';

// Dummy songs for music widget - normally these would come from a central source
const songs = [
  { id: '1', title: 'Baby', artist: 'Justin Bieber', url: '/music/baby.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '2', title: 'Believer', artist: 'Imagine Dragons', url: '/music/believer.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
];

export const Desktop: React.FC = () => {
  const { 
    systemState, 
    updateSystemState, 
    openApps, 
    minimizedApps, 
    contextMenu, 
    setContextMenu, 
    showSpotlight, 
    setShowSpotlight, 
    launchApp, 
    setShowWidgetPicker, 
    setIncomingCall, 
    quitApp, 
    systemErrors,
    shutdownStep,
    clearSystemErrors
  } = useSystem();
  const { createNode, addTag, getDirectoryContents, deleteNode, updateNode, nodes } = useFileSystem();
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
      if (e.key === 'Escape') {
        clearSystemErrors();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSpotlight, setShowSpotlight, clearSystemErrors]);

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
  const gridRef = useRef<HTMLDivElement>(null);

  // Widget Actions
  const toggleReminder = (id: number) => {
    updateSystemState({
      reminders: systemState.reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
    });
  };

  const toggleMusic = () => {
    updateSystemState({
      music: { ...systemState.music, isPlaying: !systemState.music.isPlaying }
    });
  };

  const nextSong = () => {
    updateSystemState({
      music: { ...systemState.music, currentSongIndex: (systemState.music.currentSongIndex + 1) % songs.length }
    });
  };

  const triggerFaceTime = () => {
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
    setIncomingCall({ contact: randomContact, type: 'facetime' });
  };

  const handleWidgetDragEnd = (id: string, info: any) => {
    if (!gridRef.current) return;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / 8;
    const cellHeight = gridRect.height / 4;
    
    // Relative position within grid
    const x = Math.max(0, Math.min(7, Math.round(info.point.x / cellWidth)));
    const y = Math.max(0, Math.min(3, Math.round(info.point.y / cellHeight)));
    
    updateSystemState({
      widgets: systemState.widgets.map(w => w.id === id ? { ...w, x, y } : w)
    });
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full overflow-hidden select-none transition-shadow duration-700 ${systemState.isCameraOn ? 'shadow-[inset_0_0_150px_rgba(255,255,255,0.2)] ring-4 ring-white/10' : ''}`}
      onClick={closeMenus}
      onContextMenu={handleContextMenu}
    >
      <WallpaperEngine url={systemState.wallpaperUrl} type={systemState.wallpaperType} />

      {/* Widgets Layer */}
      <motion.div 
        animate={{ 
          opacity: shutdownStep >= 3 ? 0 : 1,
          scale: shutdownStep >= 3 ? 0.5 : 1,
          filter: shutdownStep >= 3 ? "blur(20px)" : "blur(0px)"
        }}
        transition={{ duration: 0.5, ease: "backIn" }}
        className="absolute inset-0 z-0 p-8 pointer-events-none" 
        ref={gridRef}
      >
        <div className="grid grid-cols-8 grid-rows-4 gap-6 w-full h-full">
           {systemState.widgets.map((widget) => {
             const isReminders = widget.type === 'reminders';
             const isMusic = widget.type === 'music';
             const isFaceTime = widget.type === 'facetime';
             const isAllApps = widget.type === 'all-apps';
             const isWeather = widget.type === 'weather';
             const isDevices = widget.type === 'connected-devices';

             return (
               <motion.div
                 key={widget.id}
                 drag
                 dragMomentum={false}
                 dragElastic={0.1}
                 onDragEnd={(_, info) => handleWidgetDragEnd(widget.id, info)}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 style={{ 
                   gridColumnStart: widget.x + 1, 
                   gridRowStart: widget.y + 1,
                   gridColumnEnd: `span ${widget.size === 'small' ? 1 : widget.size === 'medium' ? 2 : 4}`,
                   gridRowEnd: `span ${widget.size === 'small' ? 1 : widget.size === 'medium' ? 2 : 2}`
                 }}
                 className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-5 pointer-events-auto shadow-2xl group relative flex flex-col overflow-hidden"
               >
                  {/* Widget Header */}
                  <div className="flex items-center gap-2 mb-3 z-10">
                     <div className="w-7 h-7 flex items-center justify-center">
                        {isDevices ? (
                          <img 
                            src={FileSystemResolver.getDeviceIcon('phone-apple-iphone')} 
                            className="w-full h-full object-contain drop-shadow-md invert" 
                            alt={widget.type}
                            loading="lazy"
                          />
                        ) : (
                          <img 
                            src={`/icons/${isReminders ? 'reminders' : isWeather ? 'weather' : isMusic ? 'music' : isFaceTime ? 'facetime' : 'apps'}.png`} 
                            className="w-full h-full object-contain drop-shadow-md" 
                            alt={widget.type}
                            loading="lazy"
                          />
                        )}
                     </div>
                     <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">{widget.type.replace('-', ' ')}</span>
                  </div>
                  
                  {/* Widget Content */}
                  <div className="flex-1 flex flex-col z-10 overflow-hidden">
                     {isReminders && (
                       <div className="space-y-2">
                          {systemState.reminders.slice(0, 3).map(reminder => (
                            <div key={reminder.id} className="flex items-center gap-3 group/item">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleReminder(reminder.id); }}
                                 className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${reminder.completed ? 'bg-orange-500 border-orange-500' : 'border-white/20 hover:border-orange-400'}`}
                               >
                                  {reminder.completed && <Tick01Icon size={8} className="text-white" />}
                               </button>
                               <span className={`text-xs truncate transition-all ${reminder.completed ? 'text-white/30 line-through' : 'text-white font-medium'}`}>
                                  {reminder.text}
                               </span>
                            </div>
                          ))}
                       </div>
                     )}

                     {isMusic && (
                       <div className="flex flex-col items-center justify-center h-full gap-3">
                          <img 
                            src={songs[systemState.music.currentSongIndex].cover} 
                            className={`w-16 h-16 rounded-xl shadow-2xl transition-transform duration-700 ${systemState.music.isPlaying ? 'scale-110' : 'scale-95'}`} 
                            alt="Cover"
                          />
                          <div className="text-center">
                             <div className="text-[11px] font-bold text-white truncate w-32">{songs[systemState.music.currentSongIndex].title}</div>
                             <div className="text-[9px] text-white/50 truncate w-32">{songs[systemState.music.currentSongIndex].artist}</div>
                          </div>
                          <div className="flex items-center gap-4">
                             <button onClick={toggleMusic} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                {systemState.music.isPlaying ? <PauseIcon size={14} className="text-white" /> : <PlayIcon size={14} className="text-white" />}
                             </button>
                             <button onClick={nextSong} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <ArrowRight01Icon size={14} className="text-white" />
                             </button>
                          </div>
                       </div>
                     )}

                     {isFaceTime && (
                        <div className="flex flex-col gap-3 h-full justify-center">
                           <div className="text-xs text-white/60 font-medium">Recently Called</div>
                           <div className="flex -space-x-2">
                              {contacts.slice(0, 4).map((c, i) => (
                                <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-black/20 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white`} style={{ zIndex: 10 - i }}>
                                   {c.name[0]}
                                </div>
                              ))}
                           </div>
                           <button 
                             onClick={triggerFaceTime}
                             className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[10px] font-bold rounded-xl transition-colors border border-green-500/30"
                           >
                              SIMULATE CALL
                           </button>
                        </div>
                     )}

                     {isAllApps && (
                        <div className="grid grid-cols-4 gap-2">
                           {['safari', 'mail', 'messages', 'photos', 'maps', 'music', 'notes', 'settings'].map(app => (
                             <div 
                               key={app} 
                               onClick={() => launchApp(app)}
                               className="aspect-square bg-white/5 hover:bg-white/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                             >
                                <img src={`/icons/${app}.png`} className="w-6 h-6 object-contain" alt={app} />
                             </div>
                           ))}
                           <div 
                             onClick={() => launchApp('launchpad')}
                             className="aspect-square bg-blue-500/20 hover:bg-blue-500/40 rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-blue-500/30 col-span-4 mt-1"
                           >
                              <span className="text-[10px] font-bold text-blue-400">OPEN LAUNCHPAD</span>
                           </div>
                        </div>
                     )}

                     {isWeather && (
                        <div className="flex flex-col items-center justify-center h-full">
                           <Sun01Icon size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] mb-2" />
                           <div className="text-3xl font-black text-white">24°</div>
                           <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sunny</div>
                        </div>
                     )}

                     {isDevices && (
                        <div className="flex flex-col gap-2 h-full justify-center px-1">
                           <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                              <div className="flex items-center gap-3">
                                 <img src={`${FileSystemResolver.getDeviceIcon('phone-apple-iphone')}`} className="w-6 h-6 object-contain" loading="lazy" />
                                 <div>
                                    <div className="text-[10px] font-bold text-white leading-tight">iPhone 18 Pro Max</div>
                                    <div className="text-[8px] text-green-400 font-bold uppercase tracking-widest">Connected</div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                              <div className="flex items-center gap-3">
                                 <img src={`${FileSystemResolver.getDeviceIcon('audio-headphones')}`} className="w-6 h-6 object-contain" loading="lazy" />
                                 <div>
                                    <div className="text-[10px] font-bold text-white leading-tight">AirPods Pro</div>
                                    <div className="text-[8px] text-green-400 font-bold uppercase tracking-widest">Connected</div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5 shadow-sm opacity-50">
                              <div className="flex items-center gap-3">
                                 <img src={`${FileSystemResolver.getDeviceIcon('input-touchscreen')}`} className="w-6 h-6 object-contain" loading="lazy" />
                                 <div>
                                    <div className="text-[10px] font-bold text-white leading-tight">Apple Watch Ultra</div>
                                    <div className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Disconnected</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => {
                      updateSystemState({
                        widgets: systemState.widgets.filter(w => w.id !== widget.id)
                      });
                    }}
                    className="absolute top-4 right-4 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <span className="text-white text-xs leading-none">−</span>
                  </button>

                  {/* Glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
               </motion.div>
             );
           })}
        </div>
      </motion.div>

      {/* Desktop Items Grid */}
      <motion.div 
        animate={{ 
          opacity: shutdownStep >= 3 ? 0 : 1,
          scale: shutdownStep >= 3 ? 0.8 : 1,
          y: shutdownStep >= 3 ? 20 : 0
        }}
        transition={{ duration: 0.4, ease: "circIn" }}
        className="absolute inset-0 z-0 p-4 pt-12 flex flex-col flex-wrap gap-4 content-end pointer-events-none"
      >
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
      </motion.div>

      {/* The Notch (180px x 30px, Center Anchor) */}
      {systemState.notchVisible && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[30px] bg-black rounded-b-[18px] z-50 flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-x border-b border-white/5">
          {/* Camera LED Dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${systemState.isCameraOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-[#111]'} transition-colors ml-12`} />
        </div>
      )}

      {/* OS Shell Components */}
      <motion.div 
        animate={{ 
          y: shutdownStep >= 2 ? -150 : 0
        }}
        transition={{ duration: 0.6, ease: "anticipate" }}
        className="absolute top-0 left-0 right-0 z-40"
      >
        <MenuBar toggleControlCenter={(e) => {
          e.stopPropagation();
          setControlCenterOpen(!controlCenterOpen);
          setContextMenu(null);
        }} />
      </motion.div>

      {/* Shutdown Overlay (Final Blackout) */}
      <motion.div 
        className="fixed inset-0 z-[10000] bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: shutdownStep >= 4 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* Windows Layer */}
      <motion.div 
        animate={{ 
          opacity: shutdownStep >= 3 ? 0 : 1,
          scale: shutdownStep >= 3 ? 0 : 1,
          filter: shutdownStep >= 3 ? "blur(40px)" : "blur(0px)"
        }}
        transition={{ duration: 0.6, ease: "anticipate" }}
        className="absolute inset-0 z-10 pt-8 pb-20 pointer-events-none"
      >
        <AnimatePresence>
          {openApps.filter(id => !minimizedApps.includes(id)).map(appId => (
            <Window key={appId} appId={appId} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Control Center Overlay */}
      <AnimatePresence>
        {controlCenterOpen && (
          <ControlCenter isOpen={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          y: shutdownStep >= 1 ? 400 : 0
        }}
        transition={{ duration: 0.6, ease: "anticipate" }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        <Dock />
      </motion.div>

      <AboutThisMac />
      <RestartDialog />
      <NotificationBanner isVisible={updateAvailable} onDismiss={dismissUpdate} />
      <Spotlight />
      <IncomingCallOverlay />
      <WidgetPicker />

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ 
              top: contextMenu.type === 'dock' ? contextMenu.y - 140 : contextMenu.y, 
              left: contextMenu.x 
            }}
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
            ) : contextMenu.type === 'item' ? (
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
                {nodes.find(n => n.id === contextMenu.targetId)?.type === 'folder' && (
                  <>
                    <div className="border-b border-white/10 my-1 mx-3" />
                    <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/30">Folder Color</div>
                    <div className="px-4 py-2 flex flex-wrap gap-2 mx-1.5">
                       {['blue', 'green', 'grey', 'nord', 'orange', 'purple', 'red', 'yellow'].map(color => {
                         const colorMap: Record<string, string> = {
                           blue: 'bg-blue-500',
                           green: 'bg-green-500',
                           grey: 'bg-gray-500',
                           nord: 'bg-[#5E81AC]',
                           orange: 'bg-orange-500',
                           purple: 'bg-purple-500',
                           red: 'bg-red-500',
                           yellow: 'bg-yellow-500'
                         };
                         return (
                           <button 
                             key={color}
                             onClick={() => {
                               if (contextMenu.targetId) updateNode(contextMenu.targetId, { color });
                               setContextMenu(null);
                             }}
                             className={`w-5 h-5 rounded-full border border-white/10 hover:scale-125 transition-transform shadow-lg ${colorMap[color]}`}
                             title={color.charAt(0).toUpperCase() + color.slice(1)}
                           />
                         );
                       })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => setContextMenu(null)}>Show All Windows</div>
                
                {/* Pin/Unpin - Hidden for system apps */}
                {contextMenu.targetId !== 'finder' && contextMenu.targetId !== 'apps' && contextMenu.targetId !== 'github' && (
                  <>
                    <div className="border-b border-white/10 my-1 mx-3" />
                    <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                      const appId = contextMenu.targetId;
                      if (appId) {
                        const isPinned = systemState.pinnedApps.includes(appId);
                        updateSystemState({
                          pinnedApps: isPinned 
                            ? systemState.pinnedApps.filter(id => id !== appId)
                            : [...systemState.pinnedApps, appId]
                        });
                      }
                      setContextMenu(null);
                    }}>
                      {contextMenu.targetId && systemState.pinnedApps.includes(contextMenu.targetId) ? 'Unpin from Dock' : 'Keep in Dock'}
                    </div>
                  </>
                )}

                <div className="border-b border-white/10 my-1 mx-3" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-red-500 cursor-pointer transition-colors mx-1.5 rounded-lg" onClick={() => {
                   if (contextMenu.targetId) quitApp(contextMenu.targetId);
                   setContextMenu(null);
                }}>Quit</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global System Errors */}
      {systemErrors.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden">
          {systemErrors.map((err, i) => (
            <motion.div
              key={err.id}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: err.x,
                top: err.y,
                zIndex: 10000 + i
              }}
              className="w-[280px] bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl flex items-start gap-4 pointer-events-auto"
            >
              <div className="absolute inset-0 rounded-2xl" style={{ backdropFilter: 'blur(15px)' }} />
              <div className="relative z-10 w-10 h-10 flex-shrink-0">
                <img src={err.icon} className="w-full h-full object-contain" alt="Error Icon" />
              </div>
              <div className="relative z-10 flex-1">
                <h4 className="text-[11px] font-black text-white/40 uppercase tracking-wider mb-1">System Error</h4>
                <p className="text-xs text-white font-medium leading-tight">{err.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
