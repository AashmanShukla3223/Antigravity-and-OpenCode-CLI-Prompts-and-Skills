import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { Tick01Icon, Cancel01Icon, LockKeyIcon } from 'hugeicons-react';

export const Installer: React.FC = () => {
  const { closeApp, updateSystemState, triggerSystemError, systemState } = useSystem();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const base = (import.meta as any).env?.BASE_URL || '/';

  const sidebarItems = [
    { name: 'Introduction', status: 'completed' },
    { name: 'License', status: 'completed' },
    { name: 'Destination Select', status: 'completed' },
    { name: 'Installation Type', status: 'completed' },
    { name: 'Installation', status: 'error' },
    { name: 'Summary', status: 'pending' }
  ];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = systemState.user.password || 'tahoe2026';
    if (password === correctPassword || password === 'admin') {
      setIsAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const handleClose = () => {
    localStorage.setItem('tahoe_infected', 'true');
    updateSystemState({ isSystemInfected: true });
    // Trigger initial storm
    triggerSystemError();
    closeApp('installer');
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full w-full bg-[#F6F6F6] flex items-center justify-center p-8 rounded-b-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, x: error ? [-10, 10, -10, 10, 0] : 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center mb-6">
            <img src={`${base}icons/tahoe-installer.png`} className="w-12 h-12 object-contain" alt="Installer" />
          </div>
          
          <h2 className="text-xl font-bold text-black mb-1">Installer wants to make changes.</h2>
          <p className="text-[13px] text-black/50 mb-8 px-4">Enter your password to allow this.</p>
          
          <form onSubmit={handleAuth} className="w-full space-y-4">
            <div className="relative">
              <LockKeyIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full h-11 bg-white border border-black/10 rounded-xl px-11 text-black text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-black/20"
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button"
                onClick={() => closeApp('installer')}
                className="px-6 py-1.5 text-[13px] font-medium text-black/60 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[13px] font-semibold shadow-sm transition-colors"
              >
                OK
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white select-none overflow-hidden rounded-b-xl font-sans text-black installer-window-content">
      {/* Sidebar */}
      <div className="w-[220px] bg-[#F6F6F6] border-r border-black/10 flex flex-col pt-8 flex-shrink-0">
        {sidebarItems.map((item) => (
          <div 
            key={item.name}
            className={`px-6 py-1.5 flex items-center gap-3 text-[13px] transition-colors cursor-default ${item.name === 'Installation' ? 'bg-black/5 font-bold text-black' : 'text-black/60'}`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {item.status === 'completed' && <Tick01Icon size={14} className="text-green-600 font-bold" />}
              {item.status === 'error' && <Cancel01Icon size={14} className="text-red-600 font-bold" />}
            </div>
            {item.name}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col p-12 bg-white relative">
        <div className="flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 mb-8">
            <img 
              src={`${base}${FileSystemResolver.getStatusIcon('dialog-warning')}`} 
              className="warning-icon-installer w-16 h-16 object-contain" 
              style={{ minWidth: '64px', minHeight: '64px' }}
              alt="Warning" 
            />
          </div>
          
          <h1 className="text-[26px] font-bold text-black mb-3 tracking-tight">The installation failed.</h1>
          <p className="text-[13px] text-black/70 max-w-sm leading-[1.4] font-normal">
            Contact the manufacturer for assistance.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="absolute bottom-8 right-10 flex gap-3">
          <button 
            className="px-6 py-1.5 bg-white border border-black/10 rounded-lg text-[13px] text-black shadow-sm opacity-40 cursor-not-allowed font-normal"
          >
            Go Back
          </button>
          <button 
            onClick={handleClose}
            className="px-10 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#0051A8] text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
