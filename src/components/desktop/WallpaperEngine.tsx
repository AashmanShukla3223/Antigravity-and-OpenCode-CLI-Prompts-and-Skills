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
      videoRef.current.play().catch(err => {
        console.warn("Autoplay prevented or video failed to load", err);
      });
    }
  }, [url, type]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
      <AnimatePresence mode="wait">
        {type === 'video' ? (
          <motion.div
            key={`video-${url}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Instant Background Fallback */}
            <div 
              className={`absolute inset-0 bg-cover bg-center ${blur ? 'blur-2xl scale-110' : ''}`}
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2564&auto=format&fm=webp)` }}
            />
            <video 
              ref={videoRef}
              src={url}
              autoPlay 
              muted 
              loop 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${blur ? 'blur-2xl scale-110 opacity-60' : 'opacity-100'}`}
            />
          </motion.div>
        ) : (
          <motion.div 
            key={`image-${url}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-[-5%] bg-cover bg-center ${blur ? 'blur-2xl scale-110 opacity-40' : ''}`}
            style={{ backgroundImage: `url(${url})` }}
          />
        )}
      </AnimatePresence>
      
      {/* Universal Overlay for Silicon Surge feel */}
      <div className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] ${blur ? 'bg-black/40' : ''}`} />
    </div>
  );
};
