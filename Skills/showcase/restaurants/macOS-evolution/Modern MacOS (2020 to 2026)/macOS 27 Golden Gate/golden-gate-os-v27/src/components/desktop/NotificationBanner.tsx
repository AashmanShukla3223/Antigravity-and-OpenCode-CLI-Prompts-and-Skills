import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight01Icon } from 'hugeicons-react';

interface Props {
  isVisible: boolean;
  onDismiss: () => void;
  onUpdate?: () => void;
}

export const NotificationBanner: React.FC<Props> = ({ isVisible, onDismiss, onUpdate }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div
            className="bg-black/60 backdrop-blur-[30px] saturate-[190%] border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white font-medium">macOS software update available</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <button
              onClick={() => {
                if (onUpdate) onUpdate();
                else onDismiss();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
            >
              <ArrowRight01Icon size={14} />
              <span>Update</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
