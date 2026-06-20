import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenSaverProps {
  isActive: boolean;
  onDismiss: () => void;
  type?: 'classic' | 'aerial' | 'photos';
}

interface Blob {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const BLOB_COLORS = [
  'rgba(59, 130, 246, 0.15)',
  'rgba(168, 85, 247, 0.15)',
  'rgba(236, 72, 153, 0.12)',
  'rgba(34, 211, 238, 0.12)',
  'rgba(250, 204, 21, 0.10)',
  'rgba(52, 211, 153, 0.10)',
  'rgba(251, 146, 60, 0.10)',
  'rgba(99, 102, 241, 0.12)',
];

const AERIAL_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=1920&q=80',
  'https://images.unsplash.com/photo-1518173946687-a20c1e8b9c0f?w=1920&q=80',
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
];

const PHOTO_IMAGES = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&q=80',
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1920&q=80',
  'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=1920&q=80',
  'https://images.unsplash.com/photo-1682695797221-8164123ac7f2?w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
];

const ScreenSaver: React.FC<ScreenSaverProps> = ({ isActive, onDismiss, type = 'classic' }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const blobs: Blob[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 120 + Math.random() * 280,
      color: BLOB_COLORS[i % BLOB_COLORS.length],
      duration: 18 + Math.random() * 20,
      delay: Math.random() * -30,
    }));
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const images = type === 'aerial' ? AERIAL_IMAGES : PHOTO_IMAGES;
    if (type === 'classic' || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, type === 'aerial' ? 8000 : 5000);

    return () => clearInterval(interval);
  }, [isActive, type]);

  useEffect(() => {
    if (!isActive) return;

    const handleActivity = () => onDismiss();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [isActive, onDismiss]);

  const images = type === 'aerial' ? AERIAL_IMAGES : PHOTO_IMAGES;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="screen-saver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          style={{ cursor: 'none' }}
        >
          {type === 'classic' ? (
            blobs.map((blob) => (
              <motion.div
                key={blob.id}
                className="absolute rounded-full"
                style={{
                  width: blob.size,
                  height: blob.size,
                  background: `radial-gradient(circle at 30% 30%, ${blob.color}, transparent 70%)`,
                  filter: 'blur(60px)',
                }}
                initial={{
                  x: `${blob.x}vw`,
                  y: `${blob.y}vh`,
                  scale: 0.8,
                }}
                animate={{
                  x: [
                    `${blob.x}vw`,
                    `${(blob.x + 30) % 100}vw`,
                    `${(blob.x - 20 + 100) % 100}vw`,
                    `${(blob.x + 15) % 100}vw`,
                    `${blob.x}vw`,
                  ],
                  y: [
                    `${blob.y}vh`,
                    `${(blob.y - 25 + 100) % 100}vh`,
                    `${(blob.y + 35) % 100}vh`,
                    `${(blob.y - 15 + 100) % 100}vh`,
                    `${blob.y}vh`,
                  ],
                  scale: [0.8, 1.4, 1.0, 1.6, 0.8],
                  opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
                }}
                transition={{
                  duration: blob.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: blob.delay,
                }}
              />
            ))
          ) : (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          )}

          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <p className="text-white/20 text-sm font-light tracking-widest uppercase">
              Move mouse or press any key
            </p>
          </motion.div>

          <motion.div
            className="absolute top-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScreenSaver;
