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
  Alert01Icon,
  Search01Icon
} from 'hugeicons-react';
import { WeatherEngine } from '../../utils/WeatherEngine';
import type { TahoeWeatherData } from '../../utils/WeatherEngine';

// Mapping WeatherAPI condition codes to Glassmorphic-style icons
// Reference: https://www.weatherapi.com/docs/weather_conditions.json
const getGlassmorphicIcon = (code: number, size = 48) => {
  // Simple mapping groups
  const isSunny = code === 1000;
  const isCloudy = [1003, 1006, 1009].includes(code);
  const isMist = [1030, 1135, 1147].includes(code);
  const isRain = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code);
  const isSnow = [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code);
  const isThunder = [1087, 1273, 1276, 1279, 1282].includes(code);

  const iconClass = "hugeicon-tahoe drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]";

  if (isSunny) return <Sun01Icon size={size} className={`${iconClass} text-yellow-300`} />;
  if (isCloudy) return <CloudIcon size={size} className={`${iconClass} text-white/80`} />;
  if (isRain) return <RainIcon size={size} className={`${iconClass} text-blue-300`} />;
  if (isSnow) return <SnowIcon size={size} className={`${iconClass} text-white`} />;
  if (isThunder) return <CloudAngledRainZapIcon size={size} className={`${iconClass} text-purple-300`} />;
  if (isMist) return <CloudIcon size={size} className={`${iconClass} text-slate-300`} />;
  
  return <Sun01Icon size={size} className={`${iconClass} text-yellow-300`} />;
};

export const Weather: React.FC = () => {
  const [location, setLocation] = useState('auto:ip');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState<TahoeWeatherData | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tahoe_weather_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (targetLoc: string) => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await WeatherEngine.fetchTahoeWeather(targetLoc, apiKey);
      setWeather(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch weather');
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchWeather(location);
  }, [location, fetchWeather]);

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
    }
  };

  const handleSaveKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('apiKey') as string;
    localStorage.setItem('tahoe_weather_api_key', key);
    setApiKey(key);
    setShowSettings(false);
  };

  const bgGradient = useMemo(() => {
    if (!weather) return 'from-[#2DA9FF] to-[#1E86FF]';
    const cond = weather.condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('thunder')) return 'from-blue-700 to-slate-800';
    if (cond.includes('cloud') || cond.includes('overcast')) return 'from-blue-400 to-blue-600';
    return 'from-[#2DA9FF] to-[#1E86FF]';
  }, [weather]);

  return (
    <div className={`h-full w-full bg-gradient-to-b ${bgGradient} text-white flex flex-col font-sans overflow-hidden transition-all duration-1000`}>
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
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
          <p className="text-xs text-white/60 mb-8 text-center max-w-xs">Enter your WeatherAPI.com Key to enable real-time Tahoe Intelligence.</p>
          <form onSubmit={handleSaveKey} className="w-full max-w-xs space-y-4">
            <input 
              name="apiKey"
              type="password"
              placeholder="Enter WeatherAPI Key"
              defaultValue={apiKey}
              className="w-full h-12 bg-white/10 border border-white/20 rounded-2xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="w-full h-12 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-colors"
            >
              Update Engine
            </button>
          </form>
          <button onClick={() => setShowSettings(false)} className="mt-4 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100">Cancel</button>
        </div>
      ) : (
        <>
          {/* Search Header */}
          <div className="pt-10 px-6 z-10">
            <form onSubmit={handleLocationSearch} className="relative group">
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={weather?.city || "Search Location..."}
                className="w-full h-10 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-xl px-10 text-sm placeholder:text-white/40 focus:outline-none transition-all backdrop-blur-md"
              />
              <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
            </form>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {weather ? (
              <>
                <div className="pt-6 pb-8 flex flex-col items-center text-center relative">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation03Icon size={14} className="text-white/60" />
                    <h2 className="text-2xl font-medium tracking-tight">{weather.city}</h2>
                  </div>
                  
                  <div className="relative mb-2">
                    {getGlassmorphicIcon(weather.conditionCode, 80)}
                  </div>

                  <div className="text-[90px] font-thin mb-0 leading-none flex tracking-tighter">
                    {Math.round(weather.temp)}
                    <span className="text-4xl mt-6 opacity-80">°</span>
                  </div>
                  
                  <p className="text-lg font-medium text-white/90 capitalize">{weather.condition}</p>
                  <p className="text-sm font-bold text-white/50">Feels like {Math.round(weather.feelsLike)}°</p>
                </div>

                <div className="px-6 pb-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col justify-between h-28">
                     <div className="flex items-center gap-2 text-white/40">
                        <FastWindIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Wind</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tighter">{weather.windSpeed}</span>
                        <span className="text-xs font-bold opacity-40 uppercase">KPH</span>
                     </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col justify-between h-28">
                     <div className="flex items-center gap-2 text-white/40">
                        <DropletIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tighter">{weather.humidity}%</span>
                        <span className="text-xs font-bold opacity-40 uppercase">Saturation</span>
                     </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                 {!apiKey ? (
                   <>
                    <Alert01Icon size={48} className="mb-4" />
                    <p className="text-sm font-bold">API Key Required</p>
                    <p className="text-[10px] mt-2">Open settings to configure WeatherAPI</p>
                   </>
                 ) : (
                   <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                 )}
              </div>
            )}

            {error && (
              <div className="mx-6 mb-6 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <Alert01Icon size={16} className="text-red-400" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
