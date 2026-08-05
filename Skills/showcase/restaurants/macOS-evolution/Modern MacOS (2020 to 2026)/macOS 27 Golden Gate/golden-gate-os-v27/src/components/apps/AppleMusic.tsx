import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { songs } from '../../utils/MusicData';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowRight01Icon, ArrowLeft01Icon, VolumeHighIcon } from 'hugeicons-react';
import { Search, X } from 'lucide-react';
import { ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

const AUDIO_EXTS = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

export const AppleMusic: React.FC = () => {
  const { systemState, playSong, pauseSong, nextSong, prevSong, setVolume, updatePlaybackProgress } = useSystem();
  const { nodes, createNode } = useFileSystem();
  const [unlocked, setUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const vfsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [vfsPlaying, setVfsPlaying] = useState<string | null>(null);

  const { currentSongIndex, isPlaying, playbackProgress, volume } = systemState.music;
  const currentSong = songs[currentSongIndex] || songs[0];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  useEffect(() => {
    const checkUnlocked = () => {
      setUnlocked(localStorage.getItem('golden_gate_music_unlocked') === 'true');
    };
    checkUnlocked();
    window.addEventListener('storage', checkUnlocked);
    return () => window.removeEventListener('storage', checkUnlocked);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const vfsAudioFiles = useMemo(() => {
    return nodes.filter((n) => {
      if (n.type !== 'file' || !n.content) return false;
      const ext = n.name.split('.').pop()?.toLowerCase() || '';
      return AUDIO_EXTS.includes(ext);
    });
  }, [nodes]);

  const playVfsTrack = useCallback(
    (id: string, dataUrl: string) => {
      if (!unlocked) return;
      if (isPlaying) pauseSong();
      if (vfsAudioRef.current) vfsAudioRef.current.pause();
      const audio = new Audio(dataUrl);
      audio.play().catch(() => {});
      audio.onended = () => setVfsPlaying(null);
      vfsAudioRef.current = audio;
      setVfsPlaying(id);
    },
    [unlocked, isPlaying, pauseSong],
  );

  const stopVfsTrack = useCallback(() => {
    if (vfsAudioRef.current) {
      vfsAudioRef.current.pause();
      vfsAudioRef.current = null;
    }
    setVfsPlaying(null);
  }, []);

  const selectSearchResult = useCallback(
    (index: number) => {
      if (unlocked) {
        stopVfsTrack();
        playSong(index);
        setShowSearch(false);
        setSearchQuery('');
      }
    },
    [unlocked, stopVfsTrack, playSong],
  );

  useFileDrop(createNode, 'music', '.mp3,.wav,.aac,.ogg,.flac');

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl text-zinc-900 dark:text-white overflow-hidden relative">
      {!unlocked && (
        <div className="p-4 bg-red-500 text-white text-center text-xs font-black uppercase tracking-widest animate-pulse z-30">
          Music Locked. Visit iTunes Store to Unlock.
        </div>
      )}

      {/* ─── Search Header ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 z-20">
        <div className="flex-1 relative">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
              showSearch
                ? 'bg-white/90 dark:bg-zinc-800/90 ring-2 ring-red-500/50 shadow-lg'
                : 'bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/50'
            }`}
          >
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!showSearch) setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X size={14} className="text-zinc-400" />
              </button>
            )}
          </div>
        </div>
        <ImportFileButton createNode={createNode} parentId="music" accept=".mp3,.wav,.aac,.ogg,.flac" />
      </div>

      {/* ─── Search Results Pop-up ─────────────────────── */}
      <AnimatePresence>
        {showSearch && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[72px] left-3 right-3 z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl"
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              background: 'rgba(255,255,255,0.7)',
            }}
          >
            <div
              className="dark:bg-zinc-900/70 rounded-2xl overflow-hidden"
              style={
                { background: 'rgba(24,24,27,0.7)' }
              }
            >
              <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                Top Results
              </div>
              {searchResults.map((s) => {
                const globalIndex = songs.findIndex((x) => x.id === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSearchResult(globalIndex)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all hover:bg-white/10 active:bg-white/5"
                  >
                    <img
                      src={s.cover}
                      className="w-10 h-10 rounded-xl shadow-md shrink-0"
                      alt={s.title}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-white drop-shadow-sm">
                        {s.title}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">{s.artist}</div>
                    </div>
                    {currentSongIndex === globalIndex && isPlaying && (
                      <div className="flex gap-0.5 items-end h-3 mr-1">
                        {[1, 2, 3].map((i) => (
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
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Overlay backdrop when search is active ────── */}
      {showSearch && searchResults.length > 0 && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
        />
      )}

      {/* ─── Main Player ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto scrollbar-hide">
        <div className="relative mb-8 group">
          <img
            src={currentSong.cover}
            alt="Cover"
            className={`w-56 h-56 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isPlaying ? 'scale-105' : 'scale-95'} ${unlocked ? '' : 'blur-2xl opacity-40 grayscale'}`}
          />
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl drop-shadow-lg">
              $0.99
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight mb-1">{currentSong.title}</h2>
          <p className="text-zinc-500 font-medium">{currentSong.artist}</p>
        </div>

        <div className="w-full max-w-sm mb-8 px-4">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={playbackProgress}
            onChange={(e) => updatePlaybackProgress(parseFloat(e.target.value))}
            disabled={!unlocked}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400 tabular-nums">
            <span>0:00</span>
            <span>3:45</span>
          </div>
        </div>

        <div className="flex items-center gap-8 mb-12">
          <button
            onClick={prevSong}
            className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            disabled={!unlocked}
          >
            <ArrowLeft01Icon size={24} />
          </button>
          <button
            onClick={() => {
              if (vfsPlaying) stopVfsTrack();
              if (isPlaying) pauseSong(); else playSong();
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${unlocked ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}
            disabled={!unlocked}
          >
            {isPlaying ? (
              <PauseIcon size={32} fill="currentColor" />
            ) : (
              <PlayIcon size={32} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            disabled={!unlocked}
          >
            <ArrowRight01Icon size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-[200px] opacity-60 hover:opacity-100 transition-opacity">
          <VolumeHighIcon size={16} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-500"
          />
        </div>
      </div>

      {/* ─── Song Catalog ──────────────────────────────── */}
      <div className="h-48 border-t border-zinc-100 dark:border-zinc-800 overflow-y-auto bg-zinc-50/50 dark:bg-black/20 p-2 scrollbar-hide">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Apple Music Catalog</span>
        </div>
        {songs.map((s, i) => (
          <div
            key={s.id}
            onClick={() => {
              if (unlocked) {
                stopVfsTrack();
                playSong(i);
              }
            }}
            className={`flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-all ${currentSongIndex === i && isPlaying ? 'bg-red-500/10 text-red-500' : 'hover:bg-white dark:hover:bg-zinc-800'}`}
          >
            <img src={s.cover} className="w-8 h-8 rounded-lg shadow-sm" alt={s.title} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{s.title}</div>
              <div className="text-[10px] opacity-50 truncate">{s.artist}</div>
            </div>
            {currentSongIndex === i && isPlaying && (
              <div className="flex gap-0.5 items-end h-3">
                {[1, 2, 3].map((i) => (
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
        {vfsAudioFiles.length > 0 && (
          <>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 pt-3 pb-1">
              Your Library
            </div>
            {vfsAudioFiles.map((n) => (
              <div
                key={n.id}
                onClick={() => playVfsTrack(n.id, n.content!)}
                className={`flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-all ${vfsPlaying === n.id ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-white dark:hover:bg-zinc-800'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm shadow-sm">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{n.name}</div>
                </div>
                {vfsPlaying === n.id && (
                  <div className="flex gap-0.5 items-end h-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 6, 10, 4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-0.5 bg-blue-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
