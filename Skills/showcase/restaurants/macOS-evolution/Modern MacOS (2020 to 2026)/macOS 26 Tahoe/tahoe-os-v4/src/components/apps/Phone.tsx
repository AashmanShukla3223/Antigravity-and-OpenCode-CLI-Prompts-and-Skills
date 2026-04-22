import React from 'react';
import { motion } from 'framer-motion';
import { SmartPhone01Icon, BluetoothIcon, Wifi01Icon, InformationCircleIcon } from 'hugeicons-react';

import { contacts } from '../../utils/contacts';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const colors = [
  'bg-pink-500', 'bg-blue-500', 'bg-purple-600', 'bg-emerald-500', 
  'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
];

const getContactColor = (id: number) => colors[id % colors.length];

export const Phone: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white overflow-hidden font-sans">
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-zinc-900 z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center">
        {/* Animated iPhone Connection UI */}
        <div className="relative mb-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-40px] rounded-full bg-blue-500/10 blur-3xl"
          />
          
          <div className="relative w-24 h-24 rounded-[30px] bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
             <SmartPhone01Icon size={48} className="text-blue-500 hugeicon-tahoe" />
             <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">iPhone Linked</h1>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-8">
          Continuity active. Your Tahoe OS workspace is synced with your iPhone.
        </p>

        {/* Linked Contacts Strip */}
        <div className="w-full max-w-md mb-12">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 text-left px-2">Recent Continuity Sync</div>
           <div className="grid grid-cols-4 gap-4">
              {[contacts.find(c => c.name.includes('Kritharth')), ...contacts.slice(2, 5)].map(contact => contact && (
                <div key={contact.id} className="flex flex-col items-center gap-2">
                   <div className={`w-12 h-12 rounded-full ${getContactColor(contact.id)} flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/10`}>
                      {getInitials(contact.name)}
                   </div>
                   <span className="text-[10px] font-medium text-zinc-400 truncate w-16 text-center">{contact.name.split(' ')[0]}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
           <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                 <BluetoothIcon size={18} className="text-blue-400" />
              </div>
              <div>
                 <div className="text-xs font-bold">Bluetooth Proximity</div>
                 <div className="text-[10px] text-zinc-500">Connected to iPhone 17 Pro</div>
              </div>
           </div>

           <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                 <Wifi01Icon size={18} className="text-purple-400" />
              </div>
              <div>
                 <div className="text-xs font-bold">iCloud Continuity</div>
                 <div className="text-[10px] text-zinc-500">Handshake Secure</div>
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
