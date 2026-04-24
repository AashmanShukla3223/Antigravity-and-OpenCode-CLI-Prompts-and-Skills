import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sun01Icon, 
  CloudIcon, 
  RainIcon, 
  SnowIcon, 
  CloudAngledRainZapIcon,
  FastWindIcon,
  DropletIcon,
  Navigation03Icon,
  Settings01Icon,
  Alert01Icon
} from 'hugeicons-react';

interface Forecast {
  day: string;
  temp: number;
  condition: 'sun' | 'cloud' | 'rain' | 'snow' | 'thunder';
}

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  forecast: Forecast[];
}

const DEFAULT_WEATHER: WeatherData = {
  city: 'Cupertino',
  temp: 72,
  condition: 'Mostly Sunny',
  high: 76,
  low: 62,
  humidity: 45,
  windSpeed: 12,
  forecast: [
    { day: 'Mon', temp: 72, condition: 'sun' },
    { day: 'Tue', temp: 68, condition: 'cloud' },
    { day: 'Wed', temp: 65, condition: 'rain' },
    { day: 'Thu', temp: 70, condition: 'sun' },
    { day: 'Fri', temp: 75, condition: 'sun' },
    { day: 'Sat', temp: 74, condition: 'cloud' },
    { day: 'Sun', temp: 71, condition: 'cloud' },
  ]
};

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tahoe_weather_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Cupertino&appid=${apiKey}&units=imperial`);
      if (!res.ok) throw new Error('Invalid API Key or Network Error');
      const data = await res.json();
      
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        high: Math.round(data.main.temp_max),
        low: Math.round(data.main.temp_min),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        forecast: DEFAULT_WEATHER.forecast
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const bgGradient = useMemo(() => {
    if (weather.condition.toLowerCase().includes('rain')) return 'from-blue-700 to-slate-800';
    if (weather.condition.toLowerCase().includes('cloud')) return 'from-blue-400 to-blue-600';
    return 'from-[#2DA9FF] to-[#1E86FF]';
  }, [weather.condition]);

  useEffect(() => {
    if (apiKey) {
      fetchWeather();
    }
  }, [apiKey, fetchWeather]);

  const handleSaveKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('apiKey') as string;
    localStorage.setItem('tahoe_weather_api_key', key);
    setApiKey(key);
    setShowSettings(false);
  };

  const getConditionIcon = (condition: string, size = 24) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return <Sun01Icon size={size} className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)] hugeicon-tahoe" />;
    if (cond.includes('cloud')) return <CloudIcon size={size} className="text-white/80 hugeicon-tahoe" />;
    if (cond.includes('rain')) return <RainIcon size={size} className="text-blue-300 hugeicon-tahoe" />;
    if (cond.includes('snow')) return <SnowIcon size={size} className="text-white hugeicon-tahoe" />;
    if (cond.includes('thunder')) return <CloudAngledRainZapIcon size={size} className="text-purple-300 hugeicon-tahoe" />;
    return <Sun01Icon size={size} className="text-yellow-300 hugeicon-tahoe" />;
  };

  return (
    <div className={`h-full w-full bg-gradient-to-b ${bgGradient} text-white flex flex-col font-sans overflow-hidden transition-all duration-1000`}>
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
        >
          <Settings01Icon size={18} />
        </button>
      </div>

      {showSettings ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl z-10">
          <Settings01Icon size={48} className="mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">Weather Settings</h2>
          <p className="text-xs text-white/60 mb-8 text-center max-w-xs">Enter an OpenWeatherMap API key to enable real-time updates for Cupertino.</p>
          <form onSubmit={handleSaveKey} className="w-full max-w-xs space-y-4">
            <input 
              name="apiKey"
              type="password"
              placeholder="Enter API Key"
              defaultValue={apiKey}
              className="w-full h-12 bg-white/10 border border-white/20 rounded-2xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="w-full h-12 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-colors"
            >
              Save & Refresh
            </button>
          </form>
          <button 
            onClick={() => setShowSettings(false)}
            className="mt-4 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="pt-12 pb-8 flex flex-col items-center text-center relative">
            {loading && <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.3em] opacity-50 animate-pulse">Updating...</div>}
            
            <div className="flex items-center gap-2 mb-1">
              <Navigation03Icon size={16} className="text-white/60" />
              <h2 className="text-3xl font-medium tracking-tight">{weather.city}</h2>
            </div>
            
            <div className="text-[100px] font-thin mb-0 leading-none flex tracking-tighter">
              {weather.temp}
              <span className="text-5xl mt-6 opacity-80">°</span>
            </div>
            
            <p className="text-lg font-medium text-white/90 capitalize">{weather.condition}</p>
            <div className="flex gap-4 mt-2 text-sm font-semibold opacity-80">
              <span>H:{weather.high}°</span>
              <span>L:{weather.low}°</span>
            </div>

            {error && (
              <div className="mt-4 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full flex items-center gap-2 text-[10px] font-bold">
                <Alert01Icon size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 overflow-hidden">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-1">Mostly sunny conditions expected.</h3>
               <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 min-w-[42px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 whitespace-nowrap">
                      {i === 0 ? 'Now' : `${(new Date().getHours() + i) % 12 || 12}${ (new Date().getHours() + i) >= 12 ? 'PM' : 'AM'}`}
                    </span>
                    {getConditionIcon(i % 5 === 0 ? 'cloud' : 'sun', 20)}
                    <span className="text-lg font-medium tracking-tighter">{weather.temp - i}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 px-1">7-Day Forecast</h3>
              {weather.forecast.map((day) => (
                <div key={day.day} className="flex items-center justify-between group">
                  <span className="w-10 text-sm font-bold opacity-80">{day.day}</span>
                  <div className="flex-1 flex items-center justify-center">
                    {getConditionIcon(day.condition, 18)}
                  </div>
                  <div className="w-36 flex items-center gap-3 justify-end">
                    <span className="text-xs text-white/40 font-bold">{day.temp - 10}°</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="absolute left-[30%] right-[20%] h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                    </div>
                    <span className="text-sm font-bold">{day.temp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col justify-between h-28">
               <div className="flex items-center gap-2 text-white/40">
                  <FastWindIcon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Wind</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-bold tracking-tighter">{weather.windSpeed}</span>
                  <span className="text-xs font-bold opacity-40 uppercase">MPH NW</span>
               </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col justify-between h-28">
               <div className="flex items-center gap-2 text-white/40">
                  <DropletIcon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-bold tracking-tighter">{weather.humidity}%</span>
                  <span className="text-xs font-bold opacity-40 uppercase">The dew point is 61°</span>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
