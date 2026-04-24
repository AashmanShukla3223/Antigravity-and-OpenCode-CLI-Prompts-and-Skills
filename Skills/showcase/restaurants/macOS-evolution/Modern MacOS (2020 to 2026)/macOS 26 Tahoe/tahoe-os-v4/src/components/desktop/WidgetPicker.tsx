import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem, type Widget } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { 
  Calendar01Icon, 
  Video01Icon, 
  MusicNote01Icon, 
  Sun01Icon, 
  Grid02Icon,
  Cancel01Icon
} from 'hugeicons-react';

const WIDGET_TEMPLATES = [
  { type: 'reminders', name: 'Reminders', icon: Calendar01Icon, color: 'bg-orange-500' },
  { type: 'facetime', name: 'FaceTime', icon: Video01Icon, color: 'bg-green-500' },
  { type: 'music', name: 'Music', icon: MusicNote01Icon, color: 'bg-pink-500' },
  { type: 'weather', name: 'Weather', icon: Sun01Icon, color: 'bg-blue-500' },
  { type: 'all-apps', name: 'All Apps', icon: Grid02Icon, color: 'bg-zinc-500' },
  { type: 'connected-devices', name: 'Devices', customIconUrl: FileSystemResolver.getDeviceIcon('phone-apple-iphone'), color: 'bg-zinc-800' },
] as const;

export const WidgetPicker: React.FC = () => {
  const { showWidgetPicker, setShowWidgetPicker, updateSystemState, systemState } = useSystem();

  const addWidget = (type: Widget['type']) => {
    // Find first available y slot at x=0
    let nextY = 0;
    const sortedWidgetsAtX0 = systemState.widgets
      .filter(w => w.x === 0)
      .sort((a, b) => a.y - b.y);

    for (const w of sortedWidgetsAtX0) {
      if (w.y === nextY) {
        // Assume medium size takes 2 slots in y? 
        // Based on Desktop.tsx, medium takes span 2.
        nextY += 2;
      }
    }

    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 0, // Extreme left
      y: nextY > 2 ? 0 : nextY, // Basic stack or wrap if full
      size: 'medium'
    };
    
    updateSystemState({
      widgets: [...systemState.widgets, newWidget]
    });
  };

  return (
    <AnimatePresence>
      {showWidgetPicker && (
        <>
          {/* Backdrop for closing */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWidgetPicker(false)}
            className="fixed inset-0 bg-black/20 z-[150] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[280px] bg-black/40 backdrop-blur-[30px] saturate-[180%] border-t border-white/10 z-[200] flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-4">
               <h2 className="text-2xl font-bold text-white tracking-tight">Widgets</h2>
               <button 
                 onClick={() => setShowWidgetPicker(false)}
                 className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
               >
                 <Cancel01Icon size={20} className="text-white" />
               </button>
            </div>

            <div className="flex-1 overflow-x-auto px-8 pb-8 flex items-center gap-6 scrollbar-hide">
               {WIDGET_TEMPLATES.map((tmpl) => (
                 <motion.div
                   key={tmpl.type}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => addWidget(tmpl.type)}
                   className="flex-shrink-0 w-40 h-40 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 cursor-pointer group hover:bg-white/10 transition-colors relative overflow-hidden"
                 >
                    <div className={`w-12 h-12 rounded-2xl ${tmpl.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                       {(() => {
                         const customIconUrl = (tmpl as any).customIconUrl;
                         const Icon = (tmpl as any).icon;
                         return customIconUrl ? (
                           <img src={customIconUrl} className="w-6 h-6 object-contain" loading="lazy" />
                         ) : (
                           Icon && <Icon size={24} className="text-white" />
                         );
                       })()}
                    </div>
                    <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{tmpl.name}</span>
                    
                    {/* Glass highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 </motion.div>
               ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
