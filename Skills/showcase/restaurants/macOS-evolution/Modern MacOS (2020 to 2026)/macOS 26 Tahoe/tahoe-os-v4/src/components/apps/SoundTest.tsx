import React from 'react';
import { 
  Volume2, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Play
} from 'lucide-react';

export const SoundTest: React.FC = () => {
  const playSound = (name: string) => {
    // Standard alert simulation logic
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.play().catch(() => {
        console.warn("AIFF not supported, trying fallback...");
        // Tahoe glass fallback (sine)
        if (name === 'glass') {
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
    <div className="flex flex-col h-full bg-zinc-900 text-white p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Volume2 size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">System Sounds</h1>
          <p className="text-white/40 text-sm">Test alert modes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
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
        ].map(sound => (
          <div 
            key={sound.name}
            className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
            onClick={() => playSound(sound.name)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${sound.color} flex items-center justify-center shadow-lg`}>
                <sound.icon size={20} />
              </div>
              <div>
                <h3 className="font-bold">{sound.label}</h3>
                <p className="text-xs text-white/40">{sound.desc}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
