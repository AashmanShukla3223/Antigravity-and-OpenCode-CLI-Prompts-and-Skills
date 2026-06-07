export interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
  };
}

export interface TahoeWeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  timestamp: number;
}

const CACHE_KEY = 'tahoe_weather_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export class WeatherEngine {
  private static abortController: AbortController | null = null;

  static async fetchTahoeWeather(targetLocation: string, apiKey: string): Promise<TahoeWeatherData> {
    // 1. Check Cache
    const cached = localStorage.getItem(`${CACHE_KEY}_${targetLocation}`);
    if (cached) {
      const parsed = JSON.parse(cached) as TahoeWeatherData;
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }

    // 2. Abort previous request (Zero-Delay Protocol)
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${targetLocation}&aqi=no`,
        { signal: this.abortController.signal }
      );

      if (!response.ok) {
        throw new Error('Weather fetch failed');
      }

      const data: WeatherAPIResponse = await response.json();

      const weatherData: TahoeWeatherData = {
        city: data.location.name,
        temp: data.current.temp_c,
        feelsLike: data.current.feelslike_c,
        condition: data.current.condition.text,
        conditionCode: data.current.condition.code,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        timestamp: Date.now(),
      };

      // 3. Cache Result
      localStorage.setItem(`${CACHE_KEY}_${targetLocation}`, JSON.stringify(weatherData));

      return weatherData;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        throw error;
      }
      throw error;
    }
  }
}
