import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';

/**
 * The translucent half-screen preview that appears while a window is dragged
 * over a screen edge. Rendered once, above the desktop, beneath windows.
 */
export const TilePreview: React.FC = () => {
  const { tileHover } = useSystem();

  return (
    <AnimatePresence>
      {tileHover && (
        <motion.div
          key={`${tileHover.side}-${tileHover.windowId}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed pointer-events-none z-[60] rounded-2xl"
          style={{
            width: '50vw',
            height: 'calc(100vh - 30px)',
            top: 30,
            left: tileHover.side === 'left' ? 0 : '50vw',
            background:
              'linear-gradient(135deg, rgba(120,160,255,0.22), rgba(200,120,255,0.18))',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)',
          }}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-sm font-semibold text-white/70 tracking-wide">
              Drop to fill the {tileHover.side} half
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
