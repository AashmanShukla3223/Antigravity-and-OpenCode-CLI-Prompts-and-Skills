import React, { useEffect, useState } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { songs } from '../../utils/MusicData';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowRight01Icon, 
  ArrowLeft01Icon,
  VolumeHighIcon
} from 'hugeicons-react';

export const AppleMusic: React.FC = () => {
  const { systemState, playSong, pauseSong, nextSong, prevSong, setVolume, updatePlaybackProgress } = useSystem();
  const [unlocked, setUnlocked] = useState(false);

  const { currentSongIndex, isPlaying, playbackProgress, volume } = systemState.music;
  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const checkUnlocked = () => {
      setUnlocked(localStorage.getItem('tahoe_music_unlocked') === 'true');
    };
    checkUnlocked();
    window.addEventListener('storage', checkUnlocked);
    return () => window.removeEventListener('storage', checkUnlocked);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updatePlaybackProgress(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl text-zinc-900 dark:text-white overflow-hidden">
      {!unlocked && (
        <div className="p-4 bg-red-500 text-white text-center text-xs font-black uppercase tracking-widest animate-pulse z-20">
          Music Locked. Visit iTunes Store to Unlock.
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="relative mb-8 group">
           <img 
            src={currentSong.cover} 
            alt="Cover" 
            className={`w-56 h-56 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isPlaying ? 'scale-105' : 'scale-95'} ${unlocked ? '' : 'blur-2xl opacity-40 grayscale'}`} 
           />
           {!unlocked && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl drop-shadow-lg">$0.99</div>}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight mb-1">{currentSong.title}</h2>
          <p className="text-zinc-500 font-medium">{currentSong.artist}</p>
        </div>

        {/* Progress Slider */}
        <div className="w-full max-w-sm mb-8 px-4">
           <input 
             type="range" 
             min="0" 
             max="100" 
             step="0.1"
             value={playbackProgress}
             onChange={handleSeek}
             disabled={!unlocked}
             className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-red-500"
           />
           <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400 tabular-nums">
              <span>0:00</span>
              <span>3:45</span>
           </div>
        </div>

        <div className="flex items-center gap-8 mb-12">
          <button onClick={prevSong} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" disabled={!unlocked}>
            <ArrowLeft01Icon size={24} />
          </button>
          <button 
            onClick={() => isPlaying ? pauseSong() : playSong()} 
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${unlocked ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}
            disabled={!unlocked}
          >
            {isPlaying ? <PauseIcon size={32} fill="currentColor" /> : <PlayIcon size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={nextSong} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" disabled={!unlocked}>
            <ArrowRight01Icon size={24} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full max-w-[200px] opacity-60 hover:opacity-100 transition-opacity">
           <VolumeHighIcon size={16} />
           <input 
             type="range" 
             min="0" 
             max="1" 
             step="0.01"
             value={volume}
             onChange={handleVolume}
             className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-500"
           />
        </div>
      </div>

      {/* Playlist */}
      <div className="h-48 border-t border-zinc-100 dark:border-zinc-800 overflow-y-auto bg-zinc-50/50 dark:bg-black/20 p-2 scrollbar-hide">
         {songs.map((s, i) => (
           <div 
             key={s.id} 
             onClick={() => unlocked && playSong(i)}
             className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${currentSongIndex === i ? 'bg-red-500/10 text-red-500' : 'hover:bg-white dark:hover:bg-zinc-800'}`}
           >
              <img src={s.cover} className="w-10 h-10 rounded-lg shadow-sm" alt={s.title} />
              <div className="flex-1 min-w-0">
                 <div className="text-sm font-bold truncate">{s.title}</div>
                 <div className="text-xs opacity-50 truncate">{s.artist}</div>
              </div>
              {currentSongIndex === i && isPlaying && (
                <div className="flex gap-0.5 items-end h-3">
                   {[1, 2, 3].map(i => (
                     <motion.div 
                        key={i}
                        animate={{ height: [4, 12, 6, 10, 4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-0.5 bg-red-500 rounded-full"
                     />
                   ))}
                </div>
              )}
           </div>
         ))}
      </div>
    </div>
  );
};
