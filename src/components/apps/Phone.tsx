import React from 'react';
import { motion } from 'framer-motion';
import { SmartPhone01Icon, BluetoothIcon, Wifi01Icon, InformationCircleIcon } from 'hugeicons-react';

export const Phone: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white overflow-hidden font-sans">
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-zinc-900 z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center">
        {/* Animated iPhone Connection UI */}
        <div className="relative mb-12">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-40px] rounded-full bg-blue-500/10 blur-3xl"
          />
          
          <div className="relative w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
             <SmartPhone01Icon size={64} className="text-blue-500 hugeicon-tahoe" />
             
             {/* Dynamic Connection Status Dot */}
             <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">iPhone Required</h1>
        <p className="text-zinc-400 max-w-md text-lg leading-relaxed mb-12">
          To use the Phone app on macOS Tahoe, you must connect a compatible iPhone running <span className="text-blue-400 font-semibold">iOS 26.0</span> or later.
        </p>

        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
           <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                 <BluetoothIcon size={20} className="text-blue-400" />
              </div>
              <div>
                 <div className="text-sm font-bold">Bluetooth Proximity</div>
                 <div className="text-xs text-zinc-500">Searching for nearby devices...</div>
              </div>
           </div>

           <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                 <Wifi01Icon size={20} className="text-purple-400" />
              </div>
              <div>
                 <div className="text-sm font-bold">iCloud Continuity</div>
                 <div className="text-xs text-zinc-500">Waiting for iOS Handshake.</div>
              </div>
           </div>
        </div>

        <div className="mt-16 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
           <InformationCircleIcon size={12} />
           <span>Continuity status: Disconnected</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="h-20 flex items-center justify-center border-t border-white/5 bg-white/5 backdrop-blur-md">
         <button className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold border border-white/10">
            Learn about iOS Sovereign
         </button>
      </div>
    </div>
  );
};
