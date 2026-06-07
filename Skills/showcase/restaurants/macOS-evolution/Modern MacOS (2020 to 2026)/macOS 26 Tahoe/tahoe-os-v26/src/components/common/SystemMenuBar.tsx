import React, { useState, useEffect } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

interface SystemMenuBarProps {
  mode: 'Recovery' | 'Activation Lock';
  showUtilities?: boolean;
  onTerminalOpen?: () => void;
}

export const SystemMenuBar: React.FC<SystemMenuBarProps> = ({ mode, showUtilities, onTerminalOpen }) => {
  const { battery, setWifi, showAlert } = useSystem();
  const [time, setTime] = useState(new Date());
  const [wifiMenuOpen, setWifiMenuOpen] = useState(false);
  const [utilitiesMenuOpen, setUtilitiesMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedSSID, setSelectedSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  const ssids = ['Apple Store Wi-Fi', 'Home Network 5G', 'Tahoe-Guest-Neural'];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playSound = (name: string) => {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.play().catch(e => console.warn('Audio play failed', e));
  };

  const handleConnect = () => {
    if (wifiPassword === 'admin') {
      playSound('Glass');
      setWifi(true);
      setPasswordModalOpen(false);
      setWifiPassword('');
      showAlert(`Successfully connected to ${selectedSSID}`, 'Wi-Fi Connected');
    } else {
      // Error shake logic if needed
      setWifiPassword('');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[30px] flex justify-between items-center px-4 text-sm text-white z-[200] bg-black/40 backdrop-blur-xl border-b border-white/5 select-none">
      <div className="flex items-center h-full gap-1">
        <div className="px-3 h-full flex items-center hover:bg-white/10 rounded transition cursor-default">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.057 10.774c-.024-2.615 2.135-3.87 2.233-3.93-1.215-1.777-3.105-2.019-3.778-2.046-1.61-.164-3.14.95-3.955.95-.815 0-2.09-.932-3.44-.905-1.777.027-3.413 1.034-4.326 2.62-1.84 3.195-.47 7.915 1.312 10.493.872 1.26 1.91 2.673 3.273 2.623 1.313-.05 1.81-.845 3.396-.845 1.586 0 2.033.845 3.421.82 1.412-.025 2.313-1.272 3.179-2.536 1-1.46 1.412-2.873 1.433-2.943-.03-.014-2.763-1.06-2.79-4.252zm-3.085-7.404c.725-.877 1.213-2.094 1.08-3.31-1.045.042-2.31.696-3.058 1.572-.673.782-1.262 2.023-1.102 3.213 1.166.09 2.355-.6 3.08-1.475z"/>
          </svg>
        </div>
        <div className="px-3 h-full flex items-center font-bold tracking-tight">
          {mode}
        </div>
        {showUtilities && (
          <div className="relative h-full">
            <div 
              className={`px-3 h-full flex items-center hover:bg-white/10 rounded transition cursor-default ${utilitiesMenuOpen ? 'bg-white/10' : ''}`}
              onClick={() => setUtilitiesMenuOpen(!utilitiesMenuOpen)}
            >
              Utilities
            </div>
            <AnimatePresence>
              {utilitiesMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUtilitiesMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-8 left-0 w-48 bg-black/60 backdrop-blur-3xl border border-white/20 rounded-xl py-1 z-50 overflow-hidden shadow-2xl"
                  >
                    <div 
                      className="px-4 py-1.5 hover:bg-blue-500 text-[13px] cursor-pointer"
                      onClick={() => { onTerminalOpen?.(); setUtilitiesMenuOpen(false); }}
                    >
                      Terminal
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center h-full gap-1">
        <div className="px-2 h-full flex items-center hover:bg-white/10 rounded transition gap-1 cursor-default">
          <span className="text-[11px] font-medium">{Math.round(battery.level * 100)}%</span>
          <img src={FileSystemResolver.getStatusIcon('battery-100')} alt="Battery" className="w-4 h-4 opacity-80" />
        </div>
        <div className="relative h-full">
          <div 
            className={`px-2 h-full flex items-center hover:bg-white/10 rounded transition cursor-default ${wifiMenuOpen ? 'bg-white/10' : ''}`}
            onClick={() => setWifiMenuOpen(!wifiMenuOpen)}
          >
            <img src={FileSystemResolver.getDeviceIcon('network-wireless')} alt="Wi-Fi" className="w-4 h-4 opacity-80" />
          </div>
          <AnimatePresence>
            {wifiMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setWifiMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-8 right-0 w-64 bg-black/60 backdrop-blur-[60px] saturate-[190%] border border-white/20 rounded-2xl p-2 z-50 overflow-hidden shadow-2xl"
                >
                  <div className="px-3 py-1 text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Select Network</div>
                  {ssids.map(ssid => (
                    <div 
                      key={ssid}
                      onClick={() => {
                        setSelectedSSID(ssid);
                        setPasswordModalOpen(true);
                        setWifiMenuOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-blue-500 rounded-lg text-[13px] flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <span>{ssid}</span>
                      <img src={FileSystemResolver.getDeviceIcon('network-wireless')} alt="Wi-Fi" className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <div className="px-3 h-full flex items-center font-medium">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Wi-Fi Password Modal */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-80 bg-[#1e1e1e]/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <img src={FileSystemResolver.getDeviceIcon('network-wireless')} alt="Wi-Fi" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1">{selectedSSID}</h3>
              <p className="text-xs text-white/40 mb-6 text-center">Enter the administrator password for this network.</p>
              
              <input 
                type="password"
                placeholder="Password"
                autoFocus
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors mb-6 text-center"
              />
              
              <div className="flex gap-3 w-full">
                <button onClick={() => setPasswordModalOpen(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">Cancel</button>
                <button onClick={handleConnect} className="flex-1 py-2.5 bg-white text-black rounded-xl text-xs font-bold transition-all">Join</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
