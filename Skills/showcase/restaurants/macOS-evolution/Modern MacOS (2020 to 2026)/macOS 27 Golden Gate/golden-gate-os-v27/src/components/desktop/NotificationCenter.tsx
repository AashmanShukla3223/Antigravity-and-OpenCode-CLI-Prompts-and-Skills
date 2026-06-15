import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { Cancel01Icon, Notification03Icon } from 'hugeicons-react';

export const NotificationCenter: React.FC = () => {
  const { systemState, showNotificationCenter, setShowNotificationCenter, removeNotification, clearNotifications, activeUser } = useSystem();

  if (!showNotificationCenter) return null;

  const notifs = systemState.notifications;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0" onClick={() => setShowNotificationCenter(false)} />
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-[320px] bg-black/70 backdrop-blur-[50px] saturate-[200%] border-l border-white/15 shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <p className="text-[11px] text-white/40">{activeUser.fullName || 'User'}</p>
          </div>
          <div className="flex items-center gap-2">
            {notifs.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowNotificationCenter(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <Cancel01Icon size={16} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
              <Notification03Icon size={36} />
              <p className="text-sm">No Notifications</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifs.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => removeNotification(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{n.appId}</span>
                        <span className="text-[10px] text-white/30 shrink-0">
                          {formatTime(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white mt-0.5">{n.title}</p>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer time */}
        <div className="px-5 py-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/30">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
