import React, { useState } from 'react';
import { 
  ComputerActivityIcon, 
  UserIcon, 
  Search01Icon, 
  Wifi01Icon, 
  BluetoothIcon, 
  ColorPickerIcon, 
  VolumeHighIcon, 
  InformationCircleIcon, 
  Database01Icon, 
  Settings01Icon, 
  Delete02Icon, 
  ArrowLeft01Icon, 
  LockIcon, 
  Alert01Icon, 
  ArrowRight01Icon,
  Wallet01Icon
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';

export const SystemSettings: React.FC = () => {
  const { systemState, updateSystemState, resetSystem } = useSystem();
  const [currentTab, setCurrentTab] = useState('Appearance');
  
  const wallpapers = [
    { 
      name: 'Tahoe Aerial', 
      url: 'https://v.pexels.com/video-files/4434242/4434242-uhd_3840_2160_24fps.mp4', 
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fm=webp'
    },
    { 
      name: 'Sonoma Hills', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-scenic-view-of-a-mountain-landscape-at-sunset-34567-large.mp4',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fm=webp'
    },
    { 
      name: 'Sequoia Coast', 
      url: 'https://v.pexels.com/video-files/3125396/3125396-uhd_3840_2160_25fps.mp4',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=400&auto=format&fm=webp'
    },
    { 
      name: 'Ventura Forest', 
      url: 'https://v.pexels.com/video-files/853889/853889-uhd_3840_2160_25fps.mp4',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fm=webp'
    },
    { 
      name: 'Silicon Surge (Static)', 
      url: 'https://images.unsplash.com/photo-1635837958542-a381046eb53e?q=80&w=2670&auto=format&fm=webp', 
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1635837958542-a381046eb53e?q=80&w=400&auto=format&fm=webp'
    }
  ];
  const [resetStep, setResetStep] = useState(0); // 0: Main, 1: Transfer & Reset, 2: Reset Content, 3: Password, 4: Final Summary
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const username = systemState.user.accountName || systemState.user.fullName || 'Architect';

  const handleReset = () => {
    resetSystem('activation');
  };

  const handlePasswordUnlock = () => {
    if (password === systemState.user.password || !systemState.user.password) {
      setResetStep(4);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const renderResetFlow = () => {
    switch (resetStep) {
      case 1: // Transfer & Reset
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition">
                 <ArrowLeft01Icon size={20} className="hugeicon-tahoe" />
               </button>
               <h2 className="text-2xl font-semibold">Transfer or Reset</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
               <div className="flex items-start gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Database01Icon size={24} className="hugeicon-tahoe" />
                 </div>
                 <div>
                    <h3 className="text-lg font-medium mb-1">Prepare for New Mac</h3>
                    <p className="text-sm text-white/50">Make sure you have everything you need to move your data to a new Mac.</p>
                 </div>
               </div>
               <button className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition mb-4">Get Started</button>
               <div className="border-t border-white/5 my-6" />
               <button 
                 onClick={() => setResetStep(2)}
                 className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition text-left px-4 flex items-center justify-between"
               >
                 <span>Erase All Content and Settings...</span>
               </button>
            </div>
          </div>
        );
      case 2: // Erase All Summary
        return (
          <div className="flex flex-col items-center max-w-lg mx-auto py-8">
            <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-6">
              <Delete02Icon size={40} className="hugeicon-tahoe" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center">Erase All Content and Settings</h2>
            <p className="text-center text-white/60 mb-8">All settings, data, and media will be erased. This cannot be undone.</p>
            
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><UserIcon size={16} className="hugeicon-tahoe" /></div>
                 <div className="text-sm font-medium">{username}</div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Database01Icon size={16} className="hugeicon-tahoe" /></div>
                 <div className="text-sm font-medium">128 GB of Data & Settings</div>
               </div>
            </div>

            <div className="flex gap-4 w-full">
               <button onClick={() => setResetStep(1)} className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Cancel</button>
               <button onClick={() => setResetStep(3)} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition shadow-lg shadow-blue-500/20">Continue</button>
            </div>
          </div>
        );
      case 3: // Password Confirmation
        return (
          <div className="flex flex-col items-center max-w-sm mx-auto py-12">
            <motion.div 
              animate={{ x: error ? [0, -10, 10, -10, 10, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <LockIcon size={24} className={`hugeicon-tahoe ${error ? 'text-red-500' : 'text-white/60'}`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Required</h2>
              <p className="text-center text-white/50 text-sm mb-8">Enter the password for "{username}" to allow this.</p>
              
              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500'} transition-all mb-4`}
                autoFocus
              />

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold mb-4">Wrong Password</motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-4 w-full">
                 <button onClick={() => setResetStep(2)} className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Back</button>
                 <button 
                   onClick={handlePasswordUnlock} 
                   disabled={!password}
                   className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-xl font-medium transition"
                 >
                   Unlock
                 </button>
              </div>
            </motion.div>
          </div>
        );
      case 4: // Final Confirmation
        return (
          <div className="flex flex-col items-center max-w-lg mx-auto py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
              <Alert01Icon size={40} className="hugeicon-tahoe" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Are you sure?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              You are about to erase all content and settings from this Mac. 
              <span className="block font-bold text-red-400 mt-2">All data will be permanently lost.</span>
            </p>

            <div className="flex flex-col gap-3 w-full">
               <button 
                 onClick={handleReset} 
                 className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-red-900/20 animate-pulse hover:animate-none"
               >
                 Erase All Content & Settings
               </button>
               <button onClick={() => setResetStep(0)} className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">
                 Cancel
               </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-6">General</h2>
            <div className="space-y-1">
              {[
                { name: 'About', icon: InformationCircleIcon },
                { name: 'Software Update', icon: Settings01Icon },
                { name: 'Storage', icon: Database01Icon },
                { name: 'Transfer or Reset', icon: ArrowLeft01Icon, action: () => setResetStep(1) },
              ].map(item => (
                <div 
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                      <item.icon size={20} className="text-white/70 hugeicon-tahoe" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ArrowRight01Icon size={16} className="text-white/20 group-hover:text-white/50 hugeicon-tahoe" />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full text-white bg-black/40 backdrop-blur-3xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="p-3">
          <div className="relative">
            <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hugeicon-tahoe" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-white/10 border border-white/10 rounded-md py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
          <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer mb-4 bg-white/5 border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-xl">
              {systemState.user.avatar || '👤'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight truncate w-24">{systemState.user.fullName || username}</span>
              <span className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">Apple Account</span>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-2 tracking-widest uppercase">Connectivity</div>
          <SidebarItem name="Wi-Fi" icon={Wifi01Icon} color="bg-blue-500" active={currentTab === 'Wi-Fi'} onClick={() => setCurrentTab('Wi-Fi')} />
          <SidebarItem name="Bluetooth" icon={BluetoothIcon} color="bg-blue-600" active={currentTab === 'Bluetooth'} onClick={() => setCurrentTab('Bluetooth')} />

          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Personalization</div>
          <SidebarItem name="Appearance" icon={ComputerActivityIcon} color="bg-gradient-to-br from-indigo-500 to-blue-600" active={currentTab === 'Appearance'} onClick={() => { setCurrentTab('Appearance'); setResetStep(0); }} />
          <SidebarItem name="Wallpaper" icon={ColorPickerIcon} color="bg-gradient-to-br from-pink-500 to-red-600" active={currentTab === 'Wallpaper'} onClick={() => setCurrentTab('Wallpaper')} />
          <SidebarItem name="General" icon={Settings01Icon} color="bg-gray-500" active={currentTab === 'General'} onClick={() => { setCurrentTab('General'); setResetStep(0); }} />

          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Hardware</div>
          <SidebarItem name="Sound" icon={VolumeHighIcon} color="bg-pink-500" active={currentTab === 'Sound'} onClick={() => setCurrentTab('Sound')} />
          <SidebarItem name="Storage" icon={Database01Icon} color="bg-blue-500" active={currentTab === 'Storage'} onClick={() => setCurrentTab('Storage')} />
          <SidebarItem name="Wallet & Apple Pay" icon={Wallet01Icon} color="bg-zinc-900" active={currentTab === 'Wallet'} onClick={() => setCurrentTab('Wallet')} />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + resetStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentTab === 'Appearance' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium text-lg text-white">Theme</h3>
                      <p className="text-sm text-white/50">Choose how macOS Tahoe looks.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <AppearanceCard 
                      mode="Light" 
                      active={systemState.appearance === 'light'} 
                      onClick={() => updateSystemState({ appearance: 'light' })}
                    />
                    <AppearanceCard 
                      mode="Dark" 
                      active={systemState.appearance === 'dark'} 
                      onClick={() => updateSystemState({ appearance: 'dark' })}
                    />
                    <AppearanceCard 
                      mode="Auto" 
                      active={systemState.appearance === 'auto'} 
                      onClick={() => updateSystemState({ appearance: 'auto' })}
                    />
                  </div>
                </div>
              </>
            )}

            {currentTab === 'General' && renderResetFlow()}

            {currentTab === 'Wallpaper' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Wallpaper</h2>
                <div className="grid grid-cols-2 gap-4 pb-12">
                  {wallpapers.map((wp) => (
                    <div 
                      key={wp.name}
                      onClick={() => updateSystemState({ wallpaperUrl: wp.url, wallpaperType: wp.type as any })}
                      className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${systemState.wallpaperUrl === wp.url ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                      style={{ backgroundImage: `url(${wp.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {wp.type === 'video' && (
                        <video 
                          src={wp.url} 
                          muted 
                          loop 
                          playsInline
                          className="w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500" 
                          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-2 left-3 z-10">
                         <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md">{wp.name}</span>
                         {wp.type === 'video' && <span className="ml-2 text-[8px] bg-blue-500 px-1 rounded shadow-lg">Motion</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab === 'Wallet' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Wallet & Apple Pay</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 shadow-2xl border border-white/10">
                      <Wallet01Icon size={40} className="text-blue-500 hugeicon-tahoe" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
                   <p className="text-white/50 max-w-sm mb-8">Manage your cards and secure numerical security identifiers for the Sovereign Ecosystem.</p>
                   <button 
                     onClick={() => {
                        const launchEvent = new CustomEvent('launch-app', { detail: 'wallet' });
                        window.dispatchEvent(launchEvent);
                     }}
                     className="px-8 h-12 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition shadow-lg"
                   >
                     Open Wallet App
                   </button>
                </div>
              </div>
            )}

            {currentTab !== 'Appearance' && currentTab !== 'General' && currentTab !== 'Wallet' && (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                <Settings01Icon size={48} className="mb-4 opacity-10 hugeicon-tahoe" />
                <h2 className="text-xl font-medium">{currentTab} Settings</h2>
                <p>Coming soon in Tahoe Build 26.1</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const SidebarItem = ({ name, icon: Icon, color, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`px-2 py-1.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${active ? 'bg-blue-500 text-white shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
  >
    <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center shadow-sm`}>
      <Icon size={14} className="hugeicon-tahoe" />
    </div>
    <span className="text-sm font-medium">{name}</span>
  </div>
);

const AppearanceCard = ({ mode, active, onClick }: any) => (
  <div className="flex flex-col gap-2 items-center cursor-pointer group" onClick={onClick}>
    <div className={`w-24 h-16 rounded-md border-2 transition-all ${active ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-transparent bg-white/5 hover:bg-white/10'}`}>
       <div className={`w-full h-full rounded-sm ${mode === 'Light' ? 'bg-gray-100' : mode === 'Dark' ? 'bg-zinc-800' : 'bg-gradient-to-r from-gray-100 to-zinc-800'}`} />
    </div>
    <span className={`text-xs font-medium ${active ? 'text-blue-400' : 'text-white/70 group-hover:text-white'}`}>{mode}</span>
  </div>
);
