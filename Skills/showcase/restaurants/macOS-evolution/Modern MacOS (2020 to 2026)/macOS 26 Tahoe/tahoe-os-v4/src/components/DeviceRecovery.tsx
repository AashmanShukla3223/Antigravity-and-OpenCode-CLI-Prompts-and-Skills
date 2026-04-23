import React, { useEffect, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';

/**
 * DeviceRecovery - Developer mode for bypassing setup
 * Activate with: Ctrl+Shift+D (Debug Mode)
 * Provides quick recovery and setup bypass functionality
 */
export const DeviceRecovery: React.FC = () => {
  const { systemState, updateSystemState, setBootState } = useSystem();
  const { restoreSystemNodes } = useFileSystem();
  const [showRecoveryUI, setShowRecoveryUI] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D = Debug/Recovery Mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowRecoveryUI(true);
        console.log('🔧 Recovery Mode Activated');
      }
      // Escape to close
      if (e.key === 'Escape') {
        setShowRecoveryUI(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickBypass = () => {
    console.log('⚡ Quick Setup Bypass...');
    try {
      restoreSystemNodes();
      updateSystemState({
        setup_complete: true,
        user: { 
          fullName: 'Architect',
          accountName: 'architect',
          password: 'debug',
          avatar: '🏗️'
        }
      });
      setBootState('desktop');
      setShowRecoveryUI(false);
      console.log('✅ Setup bypassed - Going to desktop');
    } catch (e) {
      console.error('❌ Bypass failed:', e);
    }
  };

  const clearCache = () => {
    console.log('🗑️ Clearing all cache...');
    try {
      localStorage.removeItem('tahoe_v3_state');
      localStorage.removeItem('tahoe_v3_fs');
      console.log('✅ Cache cleared - Reloading...');
      location.reload();
    } catch (e) {
      console.error('❌ Clear cache failed:', e);
    }
  };

  const goToSetup = () => {
    console.log('🔄 Returning to setup...');
    updateSystemState({ setup_complete: false });
    setBootState('setup');
    setShowRecoveryUI(false);
  };

  const goToLogin = () => {
    console.log('🔓 Going to login...');
    setBootState('login');
    setShowRecoveryUI(false);
  };

  if (!showRecoveryUI) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black/80 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🔧 Recovery Mode</h2>
          <p className="text-white/60 text-sm">Press Escape to close • Ctrl+Shift+D to toggle</p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={quickBypass}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            ⚡ Quick Setup Bypass
          </button>

          <button
            onClick={() => {
              console.log('🚀 Force Starting Desktop...');
              updateSystemState({ setup_complete: true });
              setBootState('desktop');
              setShowRecoveryUI(false);
            }}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            🚀 Force Start Desktop
          </button>

          <button
            onClick={goToSetup}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Return to Setup
          </button>

          <button
            onClick={goToLogin}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            🔓 Go to Login
          </button>

          <button
            onClick={clearCache}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🗑️ Clear All Cache
          </button>
        </div>

        <div className="bg-white/5 p-4 rounded-lg text-xs text-white/70 space-y-2 font-mono">
          <p><span className="text-blue-400">Current Setup:</span> {systemState.setup_complete ? '✅ Complete' : '❌ Pending'}</p>
          <p><span className="text-blue-400">User:</span> {systemState.user.fullName}</p>
          <p><span className="text-blue-400">Appearance:</span> {systemState.appearance}</p>
          <p className="text-white/40 mt-3">Tip: Use localStorage commands in console for more control</p>
        </div>

        <button
          onClick={() => setShowRecoveryUI(false)}
          className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Close (Esc)
        </button>
      </div>
    </div>
  );
};
