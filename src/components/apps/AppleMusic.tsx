import React, { useState, useRef, useEffect } from 'react';

const songs = [
  { id: '1', title: 'Baby', artist: 'Justin Bieber', url: '/music/baby.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '2', title: 'Believer', artist: 'Imagine Dragons', url: '/music/believer.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '3', title: 'Bhool Bhulaiyaa 3', artist: 'Pitbull, Diljit Dosanjh', url: '/music/bhool-bhulaiyaa.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '4', title: 'Chak De India', artist: 'Salim–Sulaiman', url: '/music/chak-de-india.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '5', title: 'Chhota Bheem Title Song', artist: 'Chhota Bheem', url: '/music/chhota-bheem.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '6', title: 'Chikoo Aur Bunty Song', artist: 'Chikoo Aur Bunty', url: '/music/chikoo.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '7', title: 'Chor', artist: 'Justh', url: '/music/chor.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '8', title: 'Chuttamalle', artist: 'Shilpa Rao', url: '/music/chuttamalle.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '9', title: 'Ek Zindagi', artist: 'Taniskaa Sanghvi', url: '/music/ek-zindagi.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '10', title: 'Galti Se Mistake', artist: 'Pritam, Arijit Singh', url: '/music/galti-se-mistake.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '11', title: 'Gulabi Sadi', artist: 'Sanju Rathod', url: '/music/gulabi-sadi.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '12', title: 'Gulabi Sharara', artist: 'Inder Arya', url: '/music/gulabi-sharara.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '13', title: 'Heeriye', artist: 'Jasleen Royal', url: '/music/heeriye.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '14', title: "It's A Small World", artist: 'Geek Music', url: '/music/small-world.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '15', title: 'Jind Kadh Ke', artist: 'IGMOR, Kuldeep Manak', url: '/music/jind-kadh-ke.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '16', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', url: '/music/jo-tum-mere-ho.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '17', title: 'Kosandra', artist: 'Miyagi & Andy Panda', url: '/music/kosandra.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '18', title: 'Let Me Love You', artist: 'DJ Snake, Justin Bieber', url: '/music/let-me-love-you.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '19', title: 'London Thumakda', artist: 'Labh Janjua', url: '/music/london-thumakda.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '20', title: 'Maan Meri Jaan', artist: 'King', url: '/music/maan-meri-jaan.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '21', title: 'Mere Ghar Ram Aaye Hain', artist: 'Jubin Nautiyal', url: '/music/mere-ghar-ram.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '22', title: 'Motu Paltu Song', artist: 'Motu Paltu', url: '/music/motu-paltu.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '23', title: 'nadaaniyan', artist: 'Akshath', url: '/music/nadaaniyan.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '24', title: 'Paisaa', artist: 'Kushal Grumpy', url: '/music/paisaa.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '25', title: 'Sajna, Say Yes To The Dress', artist: 'Badshah', url: '/music/sajna.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '26', title: 'Tauba Tauba', artist: 'Karan Aujla', url: '/music/tauba-tauba.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '27', title: 'Top Of The World', artist: 'Carpenters', url: '/music/top-of-the-world.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '28', title: 'Walking With The Lord', artist: 'Various', url: '/music/walking.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '29', title: 'Lamhey', artist: 'Anubha Bajaj', url: '/music/lamhey.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '30', title: 'Kheech Meri Photo', artist: 'Neeti Mohan', url: '/music/kheech-meri-photo.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '31', title: 'Sunny Sunny', artist: 'Yo Yo Honey Singh', url: '/music/sunny-sunny.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '32', title: 'Uff', artist: 'Harshdeep Kaur', url: '/music/uff.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '33', title: 'APT', artist: 'Various', url: '/music/apt.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '34', title: 'O Maahi', artist: 'Arijit Singh', url: '/music/o-maahi.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '35', title: 'Victory Anthem', artist: 'Various', url: '/music/victory.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '36', title: "Abrar's Entry", artist: 'Various', url: '/music/abrar.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '37', title: 'Faltu', artist: 'Various', url: '/music/faltu.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '38', title: 'Paisa Hai Toh', artist: 'Various', url: '/music/paisa-hai-toh.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '39', title: 'Abhi Toh Party Shuru Hui Hai', artist: 'Badshah', url: '/music/party.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '40', title: 'Saiyaara', artist: 'Tanishk Bagchi', url: '/music/saiyaara.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '41', title: 'Sahiba', artist: 'Aditya Rikhari', url: '/music/sahiba.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '42', title: 'Ice Cream', artist: 'Himesh Reshammiya', url: '/music/ice-cream.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '43', title: 'Jutti Meri', artist: 'Neha Bhasin', url: '/music/jutti-meri.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '44', title: 'Kissik', artist: 'Lothika', url: '/music/kissik.mp3', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '45', title: 'Over the Horizon', artist: 'Samsung', url: '/music/over-horizon.mp3', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '46', title: 'Aaj Ki Party', artist: 'Pritam', url: '/music/aaj-ki-party.mp3', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '47', title: 'Jaana Samjho Na', artist: 'Aditya Rikhari', url: '/music/jaana-samjho-na.mp3', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '48', title: 'Kinni Kinni', artist: 'Diljit Dosanjh', url: '/music/kinni-kinni.mp3', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '49', title: 'Sa Re Ke Sa Re', artist: 'Amit AB', url: '/music/saregama.mp3', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '50', title: 'the_big_adventure', artist: 'Various', url: '/music/adventure.mp3', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: '51', title: 'Life Is Good', artist: 'Various', url: '/music/life-is-good.mp3', cover: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?q=80&w=200&h=200&auto=format&fit=crop' }
];

export const AppleMusic: React.FC = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const checkUnlocked = () => {
      setUnlocked(localStorage.getItem('tahoe_music_unlocked') === 'true');
    };
    checkUnlocked();
    window.addEventListener('storage', checkUnlocked);
    return () => window.removeEventListener('storage', checkUnlocked);
  }, []);

  const togglePlay = () => {
    if (!unlocked) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!unlocked) return;
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (!unlocked) return;
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current && unlocked) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
  }, [currentSongIndex, unlocked]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl text-zinc-900 dark:text-white overflow-hidden p-8">
      <audio 
        ref={audioRef} 
        src={currentSong.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextSong}
      />
      
      {!unlocked && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center text-sm font-bold animate-pulse">
          Music Locked. Pay 99 cents in iTunes Store.
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="relative group">
           <img src={currentSong.cover} alt="Cover" className={`w-48 h-48 rounded-lg shadow-xl mb-4 transition-all duration-500 ${unlocked ? '' : 'blur-xl grayscale opacity-50'}`} />
           {!unlocked && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-2xl drop-shadow-lg">$0.99</div>}
        </div>
        <h2 className="text-xl font-bold">{currentSong.title}</h2>
        <p className="text-zinc-500 mb-6">{currentSong.artist}</p>
        
        <div className="flex gap-4 mb-8">
          <button onClick={prevSong} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded disabled:opacity-20" disabled={!unlocked}>Prev</button>
          <button onClick={togglePlay} className={`px-8 py-2 rounded-full font-bold shadow-lg transition-all ${unlocked ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500'}`}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={nextSong} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded disabled:opacity-20" disabled={!unlocked}>Next</button>
        </div>
        
        <div className="w-full max-w-xs h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8 w-full overflow-y-auto max-h-40 border-t border-zinc-200 dark:border-zinc-800 pt-4 scrollbar-hide">
           {songs.map((s, i) => (
             <div 
               key={s.id} 
               className={`flex justify-between p-2 rounded-lg text-xs cursor-pointer ${currentSongIndex === i ? 'bg-red-500/10 text-red-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
               onClick={() => { if(unlocked) setCurrentSongIndex(i); }}
             >
                <span className="font-bold truncate w-40">{s.title}</span>
                <span className="opacity-40 truncate w-24 text-right">{s.artist}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
