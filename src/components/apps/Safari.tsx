import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon, 
  RotateRight01Icon, 
  PlusSignIcon, 
  DashboardSquare01Icon, 
  Shield01Icon 
} from 'hugeicons-react';

export const Safari: React.FC = () => {
  const [url, setUrl] = useState('');
  const [showStartPage, setShowStartPage] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isProxied, setIsProxied] = useState(true);
  const [isNeuralMode, setIsNeuralMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setShowStartPage(false);
    let finalUrl = inputValue.toLowerCase().trim();
    
    // Auto-search logic
    if (!finalUrl.includes('.') && !finalUrl.startsWith('http')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
    } else if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }
    
    setHasError(false);
    setIsNeuralMode(false);

    // Special handling for Apple.com (Neural Preview Mode)
    if (finalUrl.includes('apple.com') || finalUrl === 'apple') {
       setIsNeuralMode(true);
       setIsProxied(true);
       setInputValue('apple.com');
       setUrl('https://www.apple.com');
       return;
    }
    
    // Special handling for Google
    if (finalUrl.includes('google.com')) {
       if (!finalUrl.includes('igu=1')) {
         finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'igu=1';
       }
       setUrl(finalUrl);
       setIsProxied(false);
       return;
    }

    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(finalUrl)}`;
    setUrl(proxiedUrl);
    setIsProxied(true);
  };

  const navigateTo = (siteUrl: string) => {
    setInputValue(siteUrl);
    setShowStartPage(false);
    
    if (siteUrl.includes('apple.com')) {
       setIsNeuralMode(true);
       setIsProxied(true);
       setUrl('https://www.apple.com');
    } else {
       setIsNeuralMode(false);
       setIsProxied(true);
       setUrl(`https://corsproxy.io/?${encodeURIComponent(siteUrl.startsWith('http') ? siteUrl : 'https://' + siteUrl)}`);
    }
  };

  const startPageItems = [
    { name: 'Apple', url: 'apple.com', color: 'bg-zinc-900', icon: '' },
    { name: 'Google', url: 'google.com', color: 'bg-white', icon: 'G' },
    { name: 'Microsoft', url: 'microsoft.com', color: 'bg-white', icon: 'M' },
    { name: 'Yahoo', url: 'yahoo.com', color: 'bg-purple-700', icon: 'Y' },
    { name: 'Kahoot', url: 'kahoot.com', color: 'bg-purple-600', icon: 'K' },
    { name: 'iCloud', url: 'icloud.com', color: 'bg-white', icon: '☁️' },
    { name: 'Samsung', url: 'samsung.com', color: 'bg-[#1428a0]', icon: 'S' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Toolbar */}
      <div className="h-14 bg-[#f6f6f6] dark:bg-zinc-900 border-b border-gray-300 dark:border-white/10 flex items-center px-4 gap-4">
        {/* Navigation */}
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStartPage(true)}
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft01Icon size={20} className="hugeicon-tahoe" />
          </button>
          <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowRight01Icon size={20} className="hugeicon-tahoe" />
          </button>
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 max-w-2xl mx-auto flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 shadow-sm relative group">
            <div className="flex items-center gap-1 absolute left-3">
              <Shield01Icon size={14} className={isProxied && !showStartPage ? "text-blue-500 hugeicon-tahoe" : "text-gray-400"} />
              {isProxied && !showStartPage && <span className="text-[9px] font-black uppercase text-blue-500 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Proxied</span>}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-center font-medium"
              placeholder="Search or enter website name"
            />
            {!showStartPage && (
              <RotateRight01Icon 
                size={14} 
                className="text-gray-400 ml-2 cursor-pointer hover:text-black dark:hover:text-white hugeicon-tahoe" 
                onClick={() => setUrl(url + '&refresh=' + Date.now())}
              />
            )}
          </form>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 ml-auto">
          <PlusSignIcon size={20} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer hugeicon-tahoe" />
          <DashboardSquare01Icon size={20} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer hugeicon-tahoe" />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-black">
        <AnimatePresence mode="wait">
          {showStartPage ? (
            <motion.div
              key="start-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-40 bg-white dark:bg-zinc-950 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto pt-20 pb-20 px-6">
                {/* Privacy Report Widget */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full bg-blue-500/5 dark:bg-white/5 rounded-3xl p-8 border border-blue-500/10 dark:border-white/10 mb-16 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield01Icon size={120} className="text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-blue-500 mb-4">
                      <Shield01Icon size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Privacy Report</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 tracking-tight">Silicon-Native Protection</h2>
                    <p className="text-gray-500 dark:text-white/50 max-w-lg mb-8 font-medium">
                      In the last 30 days, Safari has blocked <span className="text-black dark:text-white font-bold">1,248</span> trackers from profiling you. Your digital fingerprint is shielded by Tahoe 26 Neural Core.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-white dark:bg-black/40 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                          <div className="text-2xl font-bold">84%</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Websites with Trackers</div>
                       </div>
                       <div className="bg-white dark:bg-black/40 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                          <div className="text-2xl font-bold text-blue-500">Encrypted</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-40 font-bold">DNS Resolution</div>
                       </div>
                       <div className="bg-white dark:bg-black/40 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                          <div className="text-2xl font-bold text-green-500">Active</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Intelligent Tracking Prevention</div>
                       </div>
                    </div>
                  </div>
                </motion.div>

                {/* Favorites Grid */}
                <div className="mb-12">
                   <h3 className="text-sm font-bold opacity-30 uppercase tracking-[0.2em] mb-6 px-2">Favorites</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
                      {startPageItems.map((item, idx) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                          onClick={() => navigateTo(item.url)}
                          className="flex flex-col items-center gap-3 cursor-pointer group"
                        >
                           <div className={`w-14 h-14 rounded-2xl shadow-lg border border-black/5 dark:border-white/10 flex items-center justify-center text-2xl font-bold transition-all group-hover:scale-110 group-hover:shadow-2xl ${item.color} ${item.name === 'Google' || item.name === 'Microsoft' || item.name === 'iCloud' ? 'text-black' : 'text-white'}`}>
                              {item.icon}
                           </div>
                           <span className="text-[11px] font-semibold opacity-60 group-hover:opacity-100 transition-opacity">{item.name}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>

                {/* Privacy Info Footer */}
                <div className="pt-12 border-t border-black/5 dark:border-white/5 flex flex-col items-center text-center">
                   <Shield01Icon size={32} className="opacity-10 mb-4" />
                   <p className="text-xs text-gray-400 dark:text-white/20 font-medium max-w-md">
                     Your browsing history, open tabs, and AutoFill information are encrypted and synced across your Tahoe devices using iCloud+.
                   </p>
                </div>
              </div>
            </motion.div>
          ) : isNeuralMode ? (
            <motion.div 
              key="neural-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-zinc-950 flex flex-col overflow-y-auto"
            >
              {/* High-Fidelity Apple.com Simulation Navigation */}
              <div className="sticky top-0 h-12 bg-black/80 backdrop-blur-xl z-30 flex items-center justify-center gap-6 md:gap-10 text-[11px] text-white/70 font-medium border-b border-white/5">
                 <span className="cursor-pointer hover:text-white transition-colors">Store</span>
                 <span className="cursor-pointer hover:text-white transition-colors">Mac</span>
                 <span className="cursor-pointer hover:text-white transition-colors">iPad</span>
                 <span className="cursor-pointer hover:text-white transition-colors">iPhone</span>
                 <span className="cursor-pointer hover:text-white transition-colors">Watch</span>
                 <span className="cursor-pointer hover:text-white transition-colors">Vision</span>
                 <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1">Neural <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /></span>
              </div>

              {/* Hero Section */}
              <div className="flex-shrink-0 min-h-screen flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-zinc-900 via-black to-zinc-950 relative overflow-hidden">
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" 
                 />
                 
                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.2 }}
                 >
                   <div className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Apple Intelligence</div>
                   <h2 className="text-7xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-none">iPhone 17 Pro</h2>
                   <p className="text-2xl md:text-3xl text-white/60 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                     Titanium. Tahoe-Native. <br/>
                     The most powerful AI in a personal device.
                   </p>
                   <div className="flex flex-wrap justify-center gap-6">
                      <button className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">Learn More</button>
                      <button className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold text-lg border border-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md">Pre-order</button>
                   </div>
                 </motion.div>

                 <motion.div 
                   initial={{ y: 100, opacity: 0 }}
                   animate={{ y: 0, opacity: 0.4 }}
                   transition={{ delay: 0.5, duration: 1 }}
                   className="mt-32 grayscale"
                 >
                    <Shield01Icon size={180} strokeWidth={1} />
                 </motion.div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-black">
                 <div className="h-[500px] bg-zinc-900 rounded-[32px] p-12 flex flex-col items-center justify-end text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                    <div className="z-20">
                      <h3 className="text-4xl font-bold text-white mb-2">Apple Watch X</h3>
                      <p className="text-xl text-white/60 mb-6">Thinner. Faster. Smarter.</p>
                      <button className="text-blue-500 font-bold hover:underline">Learn more {'>'}</button>
                    </div>
                 </div>
                 <div className="h-[500px] bg-gradient-to-br from-purple-900/20 to-black rounded-[32px] p-12 flex flex-col items-center justify-center text-center border border-white/5">
                    <h3 className="text-4xl font-bold text-white mb-2">iPad Air</h3>
                    <p className="text-xl text-white/60 mb-6">Fresh Air.</p>
                    <div className="flex gap-4">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm">Buy</button>
                      <button className="text-blue-500 font-bold hover:underline text-sm">Learn more {'>'}</button>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : hasError ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 glass-dark flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Shield01Icon size={48} className="text-red-500 hugeicon-tahoe" />
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">Connection Refused</h2>
              <p className="text-white/60 max-w-sm text-lg font-medium mb-12 leading-relaxed">
                Security protocols in <span className="text-red-400">Apple Silicon Firewall</span> blocked this connection to ensure Tahoe 26 system integrity.
              </p>
              <button 
                onClick={() => setHasError(false)}
                className="px-10 py-3 rounded-full bg-white text-black font-bold shadow-2xl hover:scale-105 transition-transform"
              >
                Bypass & Retry
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Browser Iframe */}
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full border-none z-10"
          title="Safari Content"
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={() => {
            if (url && (url.includes('error') || url.includes('blocked'))) {
              setHasError(true);
            }
          }}
        />
      </div>
    </div>
  );
};
