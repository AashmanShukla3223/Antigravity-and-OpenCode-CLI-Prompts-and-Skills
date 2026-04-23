import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { 
  Video01Icon, 
  VideoOffIcon, 
  Mic01Icon, 
  MicOff01Icon, 
  Call02Icon, 
  Message01Icon, 
  SmartPhone01Icon
} from 'hugeicons-react';

export const IncomingCallOverlay: React.FC = () => {
  const { incomingCall, setIncomingCall, updateSystemState } = useSystem();
  const [accepted, setAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (incomingCall && !accepted) {
      // Loop ringtone
      audioRef.current = new Audio('/sounds/opening.mp3');
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));

      // Start preview camera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (previewRef.current) {
            previewRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Preview camera error:", err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clean up preview if unmounting
      if (previewRef.current?.srcObject) {
        const stream = previewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [incomingCall, accepted]);

  useEffect(() => {
    let interval: any;
    if (accepted) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [accepted]);

  useEffect(() => {
    if (accepted && !isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          updateSystemState({ isCameraOn: true });
        })
        .catch(err => console.error("Camera access error:", err));
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      updateSystemState({ isCameraOn: false });
    }
  }, [accepted, isVideoOff]);

  const handleAccept = () => {
    setAccepted(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Clean up preview stream
    if (previewRef.current?.srcObject) {
      const stream = previewRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleDecline = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (previewRef.current?.srcObject) {
      const stream = previewRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIncomingCall(null);
    setAccepted(false);
    setCallDuration(0);
    updateSystemState({ isCameraOn: false });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      {!accepted ? (
        <motion.div
          initial={{ opacity: 0, x: -100, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          className="fixed top-12 left-6 z-[1000] w-[360px] bg-black/40 backdrop-blur-[50px] saturate-[200%] border border-white/20 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto"
        >
          {/* Notification Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
               <Video01Icon size={16} />
            </div>
            <div className="flex-1">
               <div className="text-[11px] font-black uppercase tracking-widest text-white/40">Incoming FaceTime</div>
               <div className="text-sm font-bold text-white">{incomingCall.contact.name}</div>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="relative h-48 bg-zinc-900 flex items-center justify-center overflow-hidden">
             <video 
               ref={previewRef}
               autoPlay
               muted
               playsInline
               className="w-full h-full object-cover scale-x-[-1]"
               style={{ filter: 'brightness(0.8) contrast(1.2)' }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-4 left-4 text-[10px] font-bold text-white/60 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Preview
             </div>
          </div>

          {/* Interactive Actions */}
          <div className="p-4 flex gap-3">
             <button
               onClick={handleDecline}
               className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest transition-all"
             >
               Decline
             </button>
             <button
               onClick={handleAccept}
               className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
             >
               Accept
             </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-2xl"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Camera Feed with Tahoe Edge-Light Filter */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                 style={{ 
                   filter: 'contrast(1.1) saturate(1.2) brightness(1.1)',
                   boxShadow: 'inset 0 0 100px rgba(255,255,255,0.2)'
                 }}
               />
               {/* Edge-Light Overlay */}
               <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 blur-[20px]" />
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/20" />
               
               {isVideoOff && (
                 <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl text-white/20">
                      {incomingCall.contact.name.charAt(0)}
                    </div>
                 </div>
               )}
            </div>

            {/* Caller Info (Top) */}
            <div className="absolute top-12 flex flex-col items-center z-10 text-white drop-shadow-2xl">
               <h2 className="text-4xl font-black tracking-tight">{incomingCall.contact.name}</h2>
               <span className="text-sm font-bold text-white/60 mt-1">{formatTime(callDuration)}</span>
            </div>

            {/* Controls (Bottom) */}
            <div className="absolute bottom-16 flex items-center gap-6 z-10">
               <ControlCircle icon={isMuted ? MicOff01Icon : Mic01Icon} active={isMuted} onClick={() => setIsMuted(!isMuted)} />
               <ControlCircle icon={isVideoOff ? VideoOffIcon : Video01Icon} active={isVideoOff} onClick={() => setIsVideoOff(!isVideoOff)} />
               <button 
                 onClick={handleDecline}
                 className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform mx-4"
               >
                 <Call02Icon size={32} className="rotate-[135deg]" />
               </button>
               <ControlCircle icon={SmartPhone01Icon} />
               <ControlCircle icon={Message01Icon} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ControlCircle = ({ icon: Icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${
      active ? 'bg-white text-black border-white' : 'bg-black/20 text-white border-white/20 backdrop-blur-xl hover:bg-black/40'
    }`}
  >
    <Icon size={24} />
  </button>
);
