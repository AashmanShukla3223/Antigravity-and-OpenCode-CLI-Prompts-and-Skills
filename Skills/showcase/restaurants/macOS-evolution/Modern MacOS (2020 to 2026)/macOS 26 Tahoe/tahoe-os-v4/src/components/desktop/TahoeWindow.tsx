import React, { useState, useRef, useCallback } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';

type WindowState = 'normal' | 'maximized' | 'fullscreen';

interface TahoeWindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

const NORMAL_WIDTH = 900;
const NORMAL_HEIGHT = 640;

export const TahoeWindow: React.FC<TahoeWindowProps> = ({
  id,
  title,
  isOpen,
  onClose,
  children,
  defaultPosition = { x: 140, y: 80 },
  defaultSize = { width: NORMAL_WIDTH, height: NORMAL_HEIGHT },
}) => {
  const { activeApp, setActiveApp, powerMode } = useSystem();
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const controls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const isActive = activeApp === id;
  const zIndex = isActive ? 50 : 10;

  const handleGreenDot = useCallback(() => {
    setWindowState(prev => {
      if (prev === 'normal') return 'maximized';
      if (prev === 'maximized') return 'fullscreen';
      return 'normal';
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setWindowState('normal');
    setPosition(defaultPosition);
    setSize(defaultSize);
  }, [onClose, defaultPosition, defaultSize]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleMaximize = useCallback(() => {
    setWindowState(prev => prev === 'normal' ? 'maximized' : 'normal');
  }, []);

  const isFullscreen = windowState === 'fullscreen';
  const isMaximized = windowState === 'maximized';

  const isEndurance = powerMode === 'Low Power';
  const isProMotion = powerMode === 'High Performance';

  const genieVariants: Variants = {
    initial: {
      opacity: 0,
      scaleX: 0.1,
      scaleY: 0,
      y: 600,
      filter: "blur(40px) saturate(200%) brightness(1.2)",
    },
    animate: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      scale: 1,
      y: 0,
      width: isFullscreen ? '100vw' : isMaximized ? '100vw' : `${size.width}px`,
      height: isFullscreen ? '100vh' : isMaximized ? 'calc(100vh - 30px)' : `${size.height}px`,
      top: isFullscreen ? 0 : isMaximized ? '30px' : `${position.y}px`,
      left: isFullscreen ? 0 : isMaximized ? 0 : `${position.x}px`,
      borderRadius: isFullscreen ? 0 : isMaximized ? 0 : '1rem',
      filter: "blur(0px) saturate(100%) brightness(1)",
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 1.2,
        opacity: { duration: 0.4 },
        y: { type: "spring", stiffness: 220, damping: 28 }
      }
    },
    exit: {
      opacity: 0,
      scaleX: 0.2,
      scaleY: 0,
      y: 600,
      filter: "blur(40px) saturate(200%) brightness(1.5)",
      transition: {
        duration: 0.4,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  if (!isOpen || isMinimized) return null;

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized && !isFullscreen}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (!isMaximized && !isFullscreen) {
          setPosition(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
          }));
        }
      }}
      onPointerDown={() => setActiveApp(id)}
      variants={genieVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        zIndex: isFullscreen ? 9999 : zIndex,
        position: 'fixed',
        ...(isFullscreen ? { width: '100vw', height: '100vh', top: 0, left: 0 } : {}),
      }}
      className={`overflow-hidden flex flex-col pointer-events-auto shadow-2xl transition-shadow ${isActive ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.3)]'} ${isEndurance ? 'bg-amber-900/40 border-amber-500/30' : 'bg-white/5 dark:bg-black/20'} ${isProMotion ? 'border-white/40' : 'border-white/20'} ${isFullscreen ? 'rounded-none' : 'rounded-2xl'}`}
    >
      <div className={`absolute inset-0 saturate-[150%] pointer-events-none transition-all duration-1000 ${isEndurance ? '' : 'backdrop-blur-[40px]'} ${isProMotion ? 'backdrop-blur-[50px] saturate-[200%]' : ''}`} />

      {isFullscreen ? null : (
        <div
          className={`h-12 w-full flex items-center justify-between px-4 border-b border-white/10 select-none cursor-default relative z-10 transition-colors ${isActive ? 'bg-white/10' : 'bg-white/5'} ${isEndurance ? 'bg-amber-900/60' : ''}`}
          onPointerDown={(e) => {
            if (!isMaximized) {
              setActiveApp(id);
              controls.start(e);
              if (navigator.vibrate) {
                navigator.vibrate(10);
              }
            }
          }}
        >
          <div className="flex items-center gap-2 w-20">
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 flex items-center justify-center border border-black/10"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 flex items-center justify-center border border-black/10"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleGreenDot(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 flex items-center justify-center border border-black/10 relative group"
              title={windowState === 'normal' ? 'Maximize' : windowState === 'maximized' ? 'Enter Fullscreen' : 'Exit Fullscreen'}
            >
              {windowState === 'fullscreen' && (
                <svg width="6" height="6" viewBox="0 0 6 6" className="absolute text-white/80">
                  <path d="M1 1h4v4H1z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M0 0h2v2H0zM4 0h2v2H4zM0 4h2v2H0zM4 4h2v2H4z" fill="currentColor" />
                </svg>
              )}
              {windowState === 'maximized' && (
                <svg width="6" height="6" viewBox="0 0 6 6" className="absolute text-white/80">
                  <rect x="0.5" y="0.5" width="5" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              )}
            </button>
          </div>

          <div className={`text-sm font-medium flex-1 text-center truncate pointer-events-none transition-opacity ${isActive ? 'text-white' : 'text-white/50'} ${isEndurance ? 'text-amber-100' : ''}`}>
            {title}
          </div>

          <div className="w-20" />
        </div>
      )}

      <div className={`flex-1 relative z-10 overflow-hidden ${isEndurance ? 'bg-amber-950/80' : 'bg-white/5'}`}>
        {children}
      </div>
    </motion.div>
  );
};
