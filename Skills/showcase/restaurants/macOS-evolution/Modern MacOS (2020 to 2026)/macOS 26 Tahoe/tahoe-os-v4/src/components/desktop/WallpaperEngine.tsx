import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WallpaperEngineProps {
  url: string;
  type: 'image' | 'video';
  blur?: boolean;
}

export const WallpaperEngine: React.FC<WallpaperEngineProps> = ({ url, type, blur = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Autoplay prevented or video failed to load", err);
        });
      }
    }
  }, [url, type]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none z-[-1]">
      <AnimatePresence mode="wait">
        <motion.div
          key={url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {type === 'video' ? (
            <video 
              ref={videoRef}
              src={url}
              autoPlay 
              muted 
              loop 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover ${blur ? 'blur-2xl scale-110 opacity-60' : 'opacity-100'}`}
            />
          ) : (
            <div 
              className={`absolute inset-[-5%] bg-cover bg-center ${blur ? 'blur-2xl scale-110 opacity-40' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Universal Overlay for Silicon Surge feel */}
      <div className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] ${blur ? 'bg-black/40' : ''}`} />
    </div>
  );
};
