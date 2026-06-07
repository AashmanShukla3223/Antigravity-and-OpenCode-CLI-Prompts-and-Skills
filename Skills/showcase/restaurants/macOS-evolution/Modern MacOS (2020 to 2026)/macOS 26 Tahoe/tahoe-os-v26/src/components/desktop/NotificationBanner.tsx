import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { Settings01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface NotificationBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ isVisible, onDismiss }) => {
  const { launchApp } = useSystem();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-12 right-4 z-[400] w-80 p-4 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner shrink-0">
               <Settings01Icon size={24} className="animate-spin-slow" />
            </div>
            
            <div className="flex-1 text-white text-shadow-sm">
               <h4 className="font-bold text-sm mb-1 tracking-tight">Software Update</h4>
               <p className="text-xs text-white/80 leading-tight mb-3">
                 macOS 27 Beta 1 is available for your M5 Virtual Silicon.
               </p>

               <div className="flex gap-2">
                 <button 
                   onClick={onDismiss}
                   className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors"
                 >
                    Not now
                 </button>
                 <button 
                   onClick={() => {
                     onDismiss();
                     launchApp('installer');
                   }}
                   className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1"
                 >
                    Install Now <ArrowRight01Icon size={12} />
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
