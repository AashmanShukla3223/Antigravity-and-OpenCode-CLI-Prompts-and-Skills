import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Play, 
  Lock, 
  ShieldCheck,
  Zap,
  Radio,
  MonitorPlay,
  CheckCircle2
} from 'lucide-react';
import { useSystem } from '../../contexts/SystemContext';
import { motion } from 'framer-motion';

// External HLS.js CDN
const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@latest";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  type: 'mp4' | 'hls';
  thumbnail: string;
  category: 'AajTak Special' | 'Live TV';
}

const VIDEOS: VideoItem[] = [
  { id: 'live-aajtak', title: 'AajTak Live', url: 'https://feeds.intoday.in/aajtak/api/master.m3u8', type: 'hls', category: 'Live TV', thumbnail: 'https://feeds.intoday.in/aajtak/api/master.m3u8' },
  { id: 'live-ndtv', title: 'NDTV India Live', url: 'https://ndtvstream-lh.akamaihd.net/i/ndtv_india_1@300634/master.m3u8', type: 'hls', category: 'Live TV', thumbnail: 'https://ndtvstream-lh.akamaihd.net/i/ndtv_india_1@300634/master.m3u8' },
  { id: 'v1', title: 'AajTak Source 1', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v2', title: 'AajTak Source 2', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source2.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v3', title: 'AajTak Source 3', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source3.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v4', title: 'AajTak Source 4', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source4.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v5', title: 'AajTak Source 5', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source5.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v6', title: 'AajTak Source 6', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/dishtv_source6.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v7', title: 'AajTak Source 7', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.1/dishtv_source7.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v8', title: 'AajTak Source 8', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.2/dishtv_source8.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v9', title: 'AajTak Source 9', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.2/dishtv_source9.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v10', title: 'AajTak Source 10', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.3/dishtv_source10.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v11', title: 'AajTak Source 11', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.3/dishtv_source11.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
  { id: 'v12', title: 'AajTak Source 12', url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.4/dishtv_source12.mp4', type: 'mp4', category: 'AajTak Special', thumbnail: '' },
];

export const AppleTVPlus: React.FC = () => {
  const { showAlert, showConfirm } = useSystem();
  const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem('tahoe_tv_plus_subscribed') === 'true');
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    // Load HLS.js script dynamically
    const script = document.createElement('script');
    script.src = HLS_CDN;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const handleSubscribe = async () => {
    const confirmed = await showConfirm(
      "Subscribe to Apple TV+ Tahoe Edition for $20/month?",
      "Apple TV+ Subscription"
    );
    if (confirmed) {
      localStorage.setItem('tahoe_tv_plus_subscribed', 'true');
      setIsSubscribed(true);
      showAlert("Welcome to Apple TV+! All content is now unlocked.", "Success");
    }
  };

  const playVideo = (video: VideoItem) => {
    if (!isSubscribed) {
      handleSubscribe();
      return;
    }
    setCurrentVideo(video);
  };

  useEffect(() => {
    if (!currentVideo || !videoRef.current) return;

    if (currentVideo.type === 'hls') {
      if ((window as any).Hls && (window as any).Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new (window as any).Hls();
        hls.loadSource(currentVideo.url);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = currentVideo.url;
      }
    } else {
      if (hlsRef.current) hlsRef.current.destroy();
      videoRef.current.src = currentVideo.url;
    }
  }, [currentVideo]);

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-b from-zinc-900 to-transparent z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg">
            <Tv className="text-black" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Apple TV+</h1>
        </div>
        {!isSubscribed && (
          <button 
            onClick={handleSubscribe}
            className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Subscribe
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-32">
        {currentVideo && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative border border-white/10"
          >
            <video 
              ref={videoRef} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay
            />
            <button 
              onClick={() => setCurrentVideo(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Live TV Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Radio size={20} />
            <h2 className="text-lg font-bold">Live TV</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIDEOS.filter(v => v.category === 'Live TV').map(video => (
              <VideoCard key={video.id} video={video} onPlay={() => playVideo(video)} isLocked={!isSubscribed} />
            ))}
          </div>
        </section>

        {/* AajTak Specials */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400">
            <MonitorPlay size={20} />
            <h2 className="text-lg font-bold">AajTak Specials</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIDEOS.filter(v => v.category === 'AajTak Special').map(video => (
              <VideoCard key={video.id} video={video} onPlay={() => playVideo(video)} isLocked={!isSubscribed} />
            ))}
          </div>
        </section>

        {/* Paywall Info */}
        {!isSubscribed && (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold">Experience the Future of TV</h3>
              <p className="text-white/60 max-w-md">
                Get exclusive access to AajTak Specials and Live News for just $20/month.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span>12+ Exclusives</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm">
                  <Zap size={16} className="text-amber-400" />
                  <span>No Latency</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoCard = ({ video, onPlay, isLocked }: { video: VideoItem, onPlay: () => void, isLocked: boolean }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative aspect-video rounded-xl bg-zinc-900 border border-white/5 overflow-hidden group cursor-pointer"
    onClick={onPlay}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0" />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
        <Play fill="white" size={20} />
      </div>
    </div>
    <div className="absolute bottom-3 left-3 right-3 z-10">
      <p className="text-xs font-semibold truncate">{video.title}</p>
    </div>
    {isLocked && (
      <div className="absolute top-3 right-3 z-20">
        <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Lock size={12} className="text-white/60" />
        </div>
      </div>
    )}
  </motion.div>
);
