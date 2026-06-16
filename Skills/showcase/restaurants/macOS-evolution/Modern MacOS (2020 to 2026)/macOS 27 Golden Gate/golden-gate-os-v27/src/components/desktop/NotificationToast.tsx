import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '../../contexts/SystemContext';

const APP_LABELS: Record<string, string> = {
  mail: 'MAIL',
  messages: 'MESSAGES',
  facetime: 'FACETIME',
  phone: 'PHONE',
};

const APP_COLORS: Record<string, string> = {
  mail: 'bg-blue-500',
  messages: 'bg-green-500',
  facetime: 'bg-emerald-500',
  phone: 'bg-green-600',
};

export const NotificationToast: React.FC<{
  notification: Notification | null;
  onDismiss: () => void;
  onClick: () => void;
}> = ({ notification, onDismiss, onClick }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: 80, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onClick}
          className="fixed top-14 right-6 z-[999] w-[340px] bg-black/50 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] overflow-hidden cursor-pointer pointer-events-auto"
        >
          <div className="flex items-start gap-3 p-4">
            <div
              className={`w-8 h-8 rounded-full ${APP_COLORS[notification.appId] || 'bg-zinc-500'} flex items-center justify-center text-white text-[10px] font-black shrink-0`}
            >
              {(APP_LABELS[notification.appId] || notification.appId).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  {APP_LABELS[notification.appId] || notification.appId.toUpperCase()}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{notification.title}</div>
              <div className="text-xs text-white/60 mt-0.5 line-clamp-2">{notification.message}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
