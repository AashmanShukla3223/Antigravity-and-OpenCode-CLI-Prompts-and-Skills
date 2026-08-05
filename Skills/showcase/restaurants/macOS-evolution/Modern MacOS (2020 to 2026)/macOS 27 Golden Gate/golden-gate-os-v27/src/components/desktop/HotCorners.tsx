import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type CornerAction = 'off' | 'mission-control' | 'screen-saver' | 'notifications' | 'launchpad' | 'desktop';

const CORNER_LABELS: Record<CornerAction, string> = {
  'off': 'Off',
  'mission-control': 'Mission Control',
  'screen-saver': 'Screen Saver',
  'notifications': 'Notifications',
  'launchpad': 'Launchpad',
  'desktop': 'Desktop',
};

const CORNER_CYCLE: CornerAction[] = [
  'off',
  'mission-control',
  'screen-saver',
  'notifications',
  'launchpad',
  'desktop',
];

const STORAGE_KEY = 'golden_gate_v27_hot_corners';

const DEFAULT_CORNERS: Record<string, CornerAction> = {
  topLeft: 'mission-control',
  topRight: 'notifications',
  bottomLeft: 'launchpad',
  bottomRight: 'desktop',
};

interface CornerQuadrantProps {
  label: string;
  action: CornerAction;
  position: string;
  onClick: () => void;
}

const CornerQuadrant: React.FC<CornerQuadrantProps> = ({ action, position, onClick }) => {
  const positionClasses: Record<string, string> = {
    topLeft: 'rounded-tl-2xl border-r border-b',
    topRight: 'rounded-tr-2xl border-l border-b',
    bottomLeft: 'rounded-bl-2xl border-r border-t',
    bottomRight: 'rounded-br-2xl border-l border-t',
  };

  const iconForAction = (act: CornerAction) => {
    switch (act) {
      case 'mission-control':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case 'screen-saver':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        );
      case 'notifications':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        );
      case 'launchpad':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case 'desktop':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-400">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="2" y1="20" x2="22" y2="20" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
            <circle cx="12" cy="12" r="1" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${positionClasses[position]} border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer flex flex-col items-center justify-center gap-2 p-4 transition-colors`}
    >
      {iconForAction(action)}
      <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider text-center leading-tight">
        {CORNER_LABELS[action]}
      </span>
    </motion.div>
  );
};

const HotCorners: React.FC = () => {
  const [corners, setCorners] = useState<Record<string, CornerAction>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CORNERS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_CORNERS };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corners));
    } catch {
      // ignore
    }
  }, [corners]);

  const cycleCorner = useCallback((position: string) => {
    setCorners((prev) => {
      const current = prev[position];
      const currentIndex = CORNER_CYCLE.indexOf(current);
      const nextIndex = (currentIndex + 1) % CORNER_CYCLE.length;
      return { ...prev, [position]: CORNER_CYCLE[nextIndex] };
    });
  }, []);

  return (
    <div className="w-full">
      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Hot Corners</h4>
      <p className="text-xs text-white/30 mb-4">
        Move the cursor to a corner to trigger an action.
      </p>
      <div className="grid grid-cols-2 w-full max-w-[280px] aspect-square mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/20 shadow-xl">
        <CornerQuadrant
          position="topLeft"
          action={corners.topLeft}
          label="Top Left"
          onClick={() => cycleCorner('topLeft')}
        />
        <CornerQuadrant
          position="topRight"
          action={corners.topRight}
          label="Top Right"
          onClick={() => cycleCorner('topRight')}
        />
        <CornerQuadrant
          position="bottomLeft"
          action={corners.bottomLeft}
          label="Bottom Left"
          onClick={() => cycleCorner('bottomLeft')}
        />
        <CornerQuadrant
          position="bottomRight"
          action={corners.bottomRight}
          label="Bottom Right"
          onClick={() => cycleCorner('bottomRight')}
        />
      </div>
      <div className="flex justify-center gap-6 mt-4">
        {Object.entries(corners).map(([pos, action]) => (
          <div key={pos} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              action === 'off' ? 'bg-white/10' :
              action === 'mission-control' ? 'bg-blue-400' :
              action === 'screen-saver' ? 'bg-purple-400' :
              action === 'notifications' ? 'bg-yellow-400' :
              action === 'launchpad' ? 'bg-green-400' : 'bg-orange-400'
            }`} />
            <span className="text-[9px] text-white/30 font-medium capitalize">{pos.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotCorners;
