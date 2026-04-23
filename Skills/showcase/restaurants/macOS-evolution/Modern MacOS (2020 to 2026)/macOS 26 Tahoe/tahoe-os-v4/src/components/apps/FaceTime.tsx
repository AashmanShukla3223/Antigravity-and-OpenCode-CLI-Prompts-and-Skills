import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { 
  Video01Icon, 
  VideoOffIcon, 
  Mic01Icon, 
  MicOff01Icon, 
  Call02Icon,
  PlusSignIcon,
  Search01Icon,
  Message01Icon
} from 'hugeicons-react';

import { contacts, type Contact } from '../../utils/contacts';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const colors = [
  'bg-pink-500', 'bg-blue-500', 'bg-purple-600', 'bg-emerald-500', 
  'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
];

const getContactColor = (id: number) => colors[id % colors.length];

export const FaceTime: React.FC = () => {
  const { updateSystemState, systemState, launchApp, setIncomingCall } = useSystem();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [_error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isCalling) {
      ringtoneRef.current = new Audio('/sounds/opening.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.log("Ringtone blocked", e));
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, [isCalling]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 },
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        updateSystemState({ isCameraOn: true });
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Camera access is required for the full experience.");
        updateSystemState({ isCameraOn: false });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      updateSystemState({ isCameraOn: false });
    };
  }, []);

  const handleCall = (contact: Contact) => {
    setSelectedContact(contact);
    setIsCalling(true);
    // Simulation: Call automatically triggers incoming call after 5 seconds
    setTimeout(() => {
      setIsCalling(false);
      setIncomingCall({ contact, type: 'facetime' });
    }, 5000);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-black/40 border-r border-white/10 flex flex-col backdrop-blur-xl">
        <div className="p-6 pb-2 flex items-center justify-between">
           <h1 className="text-2xl font-bold tracking-tight text-white">FaceTime</h1>
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <PlusSignIcon size={20} />
           </button>
        </div>
        
        <div className="px-4 mb-6 mt-2">
           <div className="relative">
              <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 px-2">
          {filteredContacts.map(contact => (
            <div 
              key={contact.id}
              className={`p-3 flex items-center justify-between rounded-xl transition-all group hover:bg-white/5`}
            >
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getContactColor(contact.id)} flex items-center justify-center text-white font-bold text-sm shadow-inner relative`}>
                     {getInitials(contact.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-tight">{contact.name}</span>
                    <span className="text-[10px] text-white/40 truncate w-32">{contact.title}</span>
                  </div>
               </div>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => launchApp('messages')} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                     <Message01Icon size={16} />
                  </button>
                  <button onClick={() => handleCall(contact)} className="p-2 hover:bg-green-500 rounded-lg text-white">
                     <Video01Icon size={16} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content / Video Stage */}
      <div className="flex-1 flex flex-col relative bg-black">
        <AnimatePresence>
          {isCalling && selectedContact ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-2xl"
            >
               <div className={`w-24 h-24 rounded-full ${getContactColor(selectedContact.id)} flex items-center justify-center text-white text-3xl font-black mb-6 shadow-2xl animate-pulse`}>
                  {getInitials(selectedContact.name)}
               </div>
               <h2 className="text-3xl font-bold mb-2">{selectedContact.name}</h2>
               <p className="text-white/40 font-medium uppercase tracking-[0.3em] text-[10px] mb-12">FaceTime Video...</p>
               <button onClick={() => setIsCalling(false)} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all">
                  <Call02Icon size={32} />
               </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
           {_error ? (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                 <VideoOffIcon size={48} />
                 <p className="max-w-xs text-center font-medium">{_error}</p>
              </div>
           ) : isVideoOff ? (
             <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
                {systemState.user.avatar || '👤'}
             </div>
           ) : (
             <video 
               ref={videoRef}
               autoPlay 
               muted 
               playsInline
               className="w-full h-full object-cover scale-x-[-1]"
             />
           )}

           {/* Live Translation Captions */}
           {!_error && !isVideoOff && (
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-[80%] bg-black/50 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-4 z-30 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <p className="text-sm font-medium text-white/90">"Hey, are you seeing the new liquid glass materials in Tahoe? It looks incredible."</p>
             </div>
           )}
        </div>

        {/* Global Controls */}
        <div className="h-24 flex items-center justify-center gap-8 bg-gradient-to-t from-black to-transparent relative z-20">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
           >
              {isMuted ? <MicOff01Icon size={20} /> : <Mic01Icon size={20} />}
           </button>
           <button 
             onClick={() => setIsVideoOff(!isVideoOff)}
             className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
           >
              {isVideoOff ? <VideoOffIcon size={20} /> : <Video01Icon size={20} />}
           </button>
           <div className="w-px h-6 bg-white/10" />
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30">M5 Neural Cam Active</div>
        </div>
      </div>
    </div>
  );
};
