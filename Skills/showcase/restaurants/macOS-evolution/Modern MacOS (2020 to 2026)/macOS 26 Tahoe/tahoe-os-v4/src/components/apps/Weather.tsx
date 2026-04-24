import React, { useState, useEffect } from 'react';
import { 
  Sun01Icon, 
  CloudIcon, 
  RainIcon, 
  SnowIcon, 
  ThunderstormIcon,
  Wind01Icon,
  DropletIcon,
  Navigation03Icon
} from 'hugeicons-react';

interface Forecast {
  day: string;
  temp: number;
  condition: 'sun' | 'cloud' | 'rain' | 'snow' | 'thunder';
}

const mockForecast: Forecast[] = [
  { day: 'Mon', temp: 72, condition: 'sun' },
  { day: 'Tue', temp: 68, condition: 'cloud' },
  { day: 'Wed', temp: 65, condition: 'rain' },
  { day: 'Thu', temp: 70, condition: 'sun' },
  { day: 'Fri', temp: 75, condition: 'sun' },
  { day: 'Sat', temp: 74, condition: 'cloud' },
  { day: 'Sun', temp: 71, condition: 'cloud' },
];

export const Weather: React.FC = () => {
  const [currentTemp] = useState(72);
  const [location] = useState('Cupertino');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getConditionIcon = (condition: string, size = 24) => {
    switch (condition) {
      case 'sun': return <Sun01Icon size={size} className="text-yellow-400 hugeicon-tahoe" />;
      case 'cloud': return <CloudIcon size={size} className="text-gray-400 hugeicon-tahoe" />;
      case 'rain': return <RainIcon size={size} className="text-blue-400 hugeicon-tahoe" />;
      case 'snow': return <SnowIcon size={size} className="text-white hugeicon-tahoe" />;
      case 'thunder': return <ThunderstormIcon size={size} className="text-purple-400 hugeicon-tahoe" />;
      default: return <Sun01Icon size={size} className="text-yellow-400 hugeicon-tahoe" />;
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <Navigation03Icon size={16} className="text-white/60" />
          <h2 className="text-3xl font-medium tracking-tight">{location}</h2>
        </div>
        <div className="text-8xl font-thin mb-2 flex">
          {currentTemp}
          <span className="text-4xl mt-4">°</span>
        </div>
        <p className="text-lg font-medium text-white/80 capitalize">Mostly Sunny</p>
        <div className="flex gap-4 mt-2 text-sm font-medium">
          <span>H:76°</span>
          <span>L:62°</span>
        </div>
      </div>

      {/* Hourly Forecast (Scrollable) */}
      <div className="flex gap-8 overflow-x-auto px-8 py-6 border-y border-white/10 scrollbar-hide">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 min-w-[40px]">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              {i === 0 ? 'Now' : `${(time.getHours() + i) % 12 || 12}${ (time.getHours() + i) >= 12 ? 'PM' : 'AM'}`}
            </span>
            {getConditionIcon(i % 5 === 0 ? 'cloud' : 'sun', 20)}
            <span className="text-lg font-medium">{72 - i}°</span>
          </div>
        ))}
      </div>

      {/* 7-Day Forecast */}
      <div className="flex-1 px-8 py-6 space-y-4 overflow-y-auto scrollbar-hide">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">7-Day Forecast</h3>
        {mockForecast.map((day) => (
          <div key={day.day} className="flex items-center justify-between">
            <span className="w-12 text-sm font-bold">{day.day}</span>
            <div className="flex-1 flex items-center justify-center">
               {getConditionIcon(day.condition, 18)}
            </div>
            <div className="w-32 flex items-center gap-3 justify-end">
              <span className="text-xs text-white/40 font-bold">{day.temp - 10}°</span>
              <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden relative">
                 <div className="absolute left-[30%] right-[20%] h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
              </div>
              <span className="text-xs font-bold">{day.temp}°</span>
            </div>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-px bg-white/10 border-t border-white/10">
        <div className="p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/40">
             <Wind01Icon size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Wind</span>
          </div>
          <div className="text-lg font-bold">12 MPH <span className="text-xs font-medium text-white/40">NW</span></div>
        </div>
        <div className="p-4 flex flex-col gap-1 border-l border-white/10">
          <div className="flex items-center gap-2 text-white/40">
             <DropletIcon size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
          </div>
          <div className="text-lg font-bold">45%</div>
        </div>
      </div>
    </div>
  );
};
