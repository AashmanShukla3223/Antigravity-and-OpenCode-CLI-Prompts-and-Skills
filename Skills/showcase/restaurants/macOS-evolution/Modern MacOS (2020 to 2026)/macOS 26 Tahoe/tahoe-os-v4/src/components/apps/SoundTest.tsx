import React, { useState } from 'react';
import { 
  Volume2, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Play,
  Lock,
  Music,
  ShieldCheck
} from 'lucide-react';
import { useSystem } from '../../contexts/SystemContext';
import { ApplePayFramework } from './AppleWallet';

interface SoundItem {
  name: string;
  label: string;
  desc: string;
  icon: any;
  color: string;
  url?: string;
  isPremium?: boolean;
}

export const SoundTest: React.FC = () => {
  const { showAlert } = useSystem();
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(() => localStorage.getItem('tahoe_sound_premium') === 'true');
  const [showPaywall, setShowPaywall] = useState(false);

  const sounds: SoundItem[] = [
    { name: 'Basso', label: 'Basso', desc: 'Deep bass error sound', icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'Blow', label: 'Blow', desc: 'Soft wind sound', icon: Info, color: 'bg-sky-500' },
    { name: 'Bottle', label: 'Bottle', desc: 'Glass bottle clink', icon: Info, color: 'bg-teal-500' },
    { name: 'Frog', label: 'Frog', desc: 'Short croak', icon: Info, color: 'bg-green-500' },
    { name: 'Funk', label: 'Funk', desc: 'Bass slap', icon: Info, color: 'bg-orange-500' },
    { name: 'Glass', label: 'Glass', desc: 'Default system alert', icon: AlertTriangle, color: 'bg-blue-500' },
    { name: 'Hero', label: 'Hero', desc: 'Triumphant notification', icon: CheckCircle, color: 'bg-green-500' },
    { name: 'Morse', label: 'Morse', desc: 'Telegraph beep', icon: Info, color: 'bg-zinc-500' },
    { name: 'Ping', label: 'Ping', desc: 'Sonar ping', icon: Info, color: 'bg-indigo-500' },
    { name: 'Pop', label: 'Pop', desc: 'Bubble pop', icon: Info, color: 'bg-pink-500' },
    { name: 'Purr', label: 'Purr', desc: 'Cat purring', icon: Info, color: 'bg-amber-500' },
    { name: 'Sosumi', label: 'Sosumi', desc: 'Classic legacy alert', icon: Info, color: 'bg-purple-500' },
    { name: 'Submarine', label: 'Submarine', desc: 'Deep water sonar', icon: Info, color: 'bg-blue-700' },
    { name: 'Tink', label: 'Tink', desc: 'High metallic tap', icon: Info, color: 'bg-gray-400' },
    // Premium Tracks
    { 
      name: 'Halla Bol', 
      label: 'Halla Bol', 
      desc: 'AajTak Signature Theme', 
      icon: Music, 
      color: 'bg-rose-600', 
      isPremium: true,
      url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.6/halla.bol.mp3'
    },
    { 
      name: 'AajTak Test', 
      label: 'AajTak Test', 
      desc: 'Sound Test Frequency', 
      icon: Music, 
      color: 'bg-rose-500', 
      isPremium: true,
      url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.5/aajtak.sound.test.mp3'
    },
    { 
      name: 'Batidao', 
      label: 'Batidao Speed', 
      desc: 'Fast paced rhythmic test', 
      icon: Music, 
      color: 'bg-purple-600', 
      isPremium: true,
      url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.5/Batidao.da.Madrugada.Speed.mp3'
    },
    { 
      name: 'Legacy Test', 
      label: 'SoundTest Classic', 
      desc: 'Original sound test track', 
      icon: Music, 
      color: 'bg-zinc-700', 
      isPremium: true,
      url: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/soundtest.mp3'
    },
  ];

  const handleUnlockSuccess = () => {
    localStorage.setItem('tahoe_sound_premium', 'true');
    setIsPremiumUnlocked(true);
    setShowPaywall(false);
    showAlert("Premium tracks unlocked! Enjoy the high-fidelity sound.", "Success");
  };

  const playSound = (sound: SoundItem) => {
    if (sound.isPremium && !isPremiumUnlocked) {
      setShowPaywall(true);
      return;
    }

    const audioUrl = sound.url || `/sounds/${sound.name}.mp3`;
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
        console.warn("Audio play failed, trying fallback...");
        if (sound.name === 'Glass' || sound.name === 'glass') {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white p-8 overflow-y-auto custom-scrollbar relative">
      {showPaywall && (
        <ApplePayFramework 
          amount="$5.00" 
          itemName="Sound Test Premium" 
          onSuccess={handleUnlockSuccess} 
          onCancel={() => setShowPaywall(false)} 
        />
      )}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Volume2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Sounds</h1>
            <p className="text-white/40 text-sm font-medium">Test alert modes and frequencies.</p>
          </div>
        </div>
        {!isPremiumUnlocked && (
          <button 
            onClick={() => setShowPaywall(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
          >
            <ShieldCheck size={18} />
            Unlock Premium
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sounds.map(sound => (
          <div 
            key={sound.name}
            className={`flex items-center justify-between p-5 bg-white/5 border ${sound.isPremium ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} rounded-2xl hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden`}
            onClick={() => playSound(sound)}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-10 h-10 rounded-lg ${sound.color} flex items-center justify-center shadow-lg`}>
                <sound.icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{sound.label}</h3>
                  {sound.isPremium && !isPremiumUnlocked && <Lock size={12} className="text-amber-500" />}
                </div>
                <p className="text-xs text-white/40 font-medium">{sound.desc}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
              {sound.isPremium && !isPremiumUnlocked ? <Lock size={14} /> : <Play size={14} />}
            </div>
            {sound.isPremium && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {!isPremiumUnlocked && (
        <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-sm text-white/40">
            Premium sounds include high-fidelity AajTak themes and specialized sound test tracks.
          </p>
        </div>
      )}
    </div>
  );
};
