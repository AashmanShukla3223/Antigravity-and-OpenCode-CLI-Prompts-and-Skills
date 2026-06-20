import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { Cancel01Icon, Notification03Icon, Add01Icon, Delete02Icon, Move01Icon } from 'hugeicons-react';

export const NotificationCenter = React.memo(() => {
  const {
    systemState,
    showNotificationCenter,
    setShowNotificationCenter,
    removeNotification,
    clearNotifications,
    activeUser,
    updateSystemState,
    setShowWidgetPicker,
  } = useSystem();
  const [activeTab, setActiveTab] = useState<'notifications' | 'widgets'>('notifications');

  if (!showNotificationCenter) return null;

  const notifs = systemState.notifications;

  const removeWidget = (id: string) => {
    updateSystemState({
      widgets: systemState.widgets.filter((w) => w.id !== id),
    });
  };

  const moveWidget = (id: string, direction: -1 | 1) => {
    const idx = systemState.widgets.findIndex((w) => w.id === id);
    if (idx < 0) return;
    const widgets = [...systemState.widgets];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    [widgets[idx], widgets[targetIdx]] = [widgets[targetIdx], widgets[idx]];
    updateSystemState({ widgets });
  };

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
            <h2 className="text-lg font-semibold text-white">
              {activeTab === 'notifications' ? 'Notifications' : 'Widgets'}
            </h2>
            <p className="text-[11px] text-white/40">{activeUser.fullName || 'User'}</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'notifications' && notifs.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Clear All
              </button>
            )}
            {activeTab === 'widgets' && (
              <button
                onClick={() => { setShowWidgetPicker(true); setShowNotificationCenter(false); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <Add01Icon size={16} className="text-white/60" />
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

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-5 py-1 gap-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`text-xs font-medium pb-2 transition-colors border-b-2 ${
              activeTab === 'notifications'
                ? 'text-white border-blue-500'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`text-xs font-medium pb-2 transition-colors border-b-2 ${
              activeTab === 'widgets'
                ? 'text-white border-blue-500'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            Widgets
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {activeTab === 'notifications' && (
            notifs.length === 0 ? (
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
            )
          )}

          {activeTab === 'widgets' && (
            systemState.widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3 px-8 text-center">
                <p className="text-sm">No widgets added yet.</p>
                <button
                  onClick={() => { setShowWidgetPicker(true); setShowNotificationCenter(false); }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add a widget
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {systemState.widgets.map((w, idx) => (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Move01Icon size={14} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">{w.type.replace('-', ' ')}</p>
                        <p className="text-[10px] text-white/40">{w.size} · {w.x},{w.y}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveWidget(w.id, -1)}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <button
                        onClick={() => moveWidget(w.id, 1)}
                        disabled={idx === systemState.widgets.length - 1}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <button
                        onClick={() => removeWidget(w.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Delete02Icon size={12} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/30">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
