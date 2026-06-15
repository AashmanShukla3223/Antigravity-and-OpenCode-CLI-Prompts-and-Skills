export type AIProvider = 'gemini' | 'groq' | 'openrouter';

export interface AIProviderConfig {
  key: AIProvider;
  name: string;
  model: string;
  endpoint: string;
  keyLabel: string;
}

export const PROVIDERS: AIProviderConfig[] = [
  {
    key: 'gemini',
    name: 'Google Gemini',
    model: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    keyLabel: 'Gemini API Key',
  },
  {
    key: 'groq',
    name: 'Groq Cloud',
    model: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyLabel: 'Groq API Key',
  },
  {
    key: 'openrouter',
    name: 'OpenRouter',
    model: 'deepseek/deepseek-r1:free',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    keyLabel: 'OpenRouter API Key',
  },
];

export interface SystemActions {
  launchApp: (appId: string) => void;
  updateSystemState: (updates: any) => void;
  setPowerMode: (mode: 'Low Power' | 'Normal' | 'High Performance') => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  text: string;
  provider: AIProvider;
}

const STORAGE_KEYS: Record<AIProvider, string> = {
  gemini: 'golden_gate_siri_gemini_key',
  groq: 'golden_gate_siri_groq_key',
  openrouter: 'golden_gate_siri_openrouter_key',
};

const ACTIVE_PROVIDER_KEY = 'golden_gate_siri_active_provider';

export function getStoredApiKey(provider: AIProvider): string {
  return localStorage.getItem(STORAGE_KEYS[provider]) || '';
}

export function storeApiKey(provider: AIProvider, key: string): void {
  localStorage.setItem(STORAGE_KEYS[provider], key);
}

export function getActiveProvider(): AIProvider {
  return (localStorage.getItem(ACTIVE_PROVIDER_KEY) as AIProvider) || 'gemini';
}

export function setActiveProvider(provider: AIProvider): void {
  localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
}

export function hasAnyApiKey(): boolean {
  return PROVIDERS.some((p) => !!getStoredApiKey(p.key));
}

export class AIEngine {
  private actions: SystemActions;

  constructor(actions: SystemActions) {
    this.actions = actions;
  }

  async executeCommand(prompt: string): Promise<string> {
    const provider = getActiveProvider();
    const apiKey = getStoredApiKey(provider);
    if (!apiKey) {
      return await this.localAnswer(prompt);
    }
    const response = await this.sendMessage([{ role: 'user', content: prompt }], provider, apiKey);
    return response.text;
  }

  private async fetchWeather(location?: string): Promise<string> {
    try {
      let lat: number, lon: number, city: string;
      if (location) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`,
        );
        if (!geoRes.ok) return `Unable to find location "${location}".`;
        const geoData = await geoRes.json();
        if (!geoData.results?.length) return `Location "${location}" not found.`;
        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        city = geoData.results[0].name;
      } else {
        const ipRes = await fetch('http://ip-api.com/json/?fields=city,lat,lon');
        if (!ipRes.ok) return 'Unable to determine your location.';
        const ipData = await ipRes.json();
        lat = ipData.lat;
        lon = ipData.lon;
        city = ipData.city;
      }
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
      );
      if (!weatherRes.ok) return 'Unable to fetch weather data.';
      const data = await weatherRes.json();
      const temp = Math.round(data.current.temperature_2m);
      const feelsLike = Math.round(data.current.apparent_temperature);
      const wind = Math.round(data.current.wind_speed_10m);
      const code = data.current.weather_code;
      const conditions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
      };
      const condition = conditions[code] || 'Unknown conditions';
      return `Weather in ${city}: ${condition}, ${temp}°C (feels like ${feelsLike}°C), Wind ${wind} km/h.`;
    } catch {
      return 'Unable to fetch weather data. Please try again later or configure a Weather API key in Settings.';
    }
  }

  private async localAnswer(prompt: string): Promise<string> {
    const lower = prompt.toLowerCase().trim();

    if (/^(hi|hello|hey|howdy)\b/.test(lower)) {
      return 'Hello! How can I help you today?';
    }

    if (/^(what|who|when|where|why|how)\b/.test(lower) && lower.includes('you')) {
      return "I'm Siri, your macOS 27 Golden Gate assistant. I can open apps, search the web, answer questions, and control system settings. Configure an API key in Siri settings for full AI capabilities.";
    }

    if (lower.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }

    if (lower.includes('date') || lower.includes('day')) {
      return `Today is ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    if (/\b(\d+\s*[+\-*/×÷]\s*\d+)/.test(lower)) {
      try {
        const sanitized = lower.replace(/×/g, '*').replace(/÷/g, '/');
        const match = sanitized.match(/(\d+\s*[+\-*/]\s*\d+)/);
        if (match) {
          const result = Function(`"use strict"; return (${match[1]})`)();
          return `The answer is ${result}.`;
        }
      } catch {
        /* ignore */
      }
    }

    if (/(define|meaning of|what is)\s+/i.test(lower)) {
      return `I can look that up for you! To get full AI-powered answers, please configure an API key in Siri settings (click the Siri icon in the menu bar, then open the Siri app and go to Settings).`;
    }

    if (lower.includes('weather')) {
      const locationMatch = lower.match(/(?:weather|in)\s+(\w+(?:\s+\w+)?)\s*(?:\?|$)/);
      const location =
        locationMatch && !['today', 'tomorrow', 'now', 'like'].includes(locationMatch[1].toLowerCase())
          ? locationMatch[1]
          : undefined;
      return await this.fetchWeather(location);
    }

    if (lower.includes('calculator') || lower.includes('calculate')) {
      this.actions.launchApp('calculator');
      return 'Opening Calculator...';
    }

    if (lower.includes('terminal')) {
      this.actions.launchApp('terminal');
      return 'Opening Terminal...';
    }

    if (lower.includes('safari') || lower.includes('browser') || lower.includes('internet') || lower.includes('web')) {
      this.actions.launchApp('safari');
      return 'Opening Safari...';
    }

    if (lower.includes('settings') || lower.includes('preferences')) {
      this.actions.launchApp('settings');
      return 'Opening Settings...';
    }

    if (/set\s+(power|mode|performance)/i.test(lower)) {
      if (/low/i.test(lower)) {
        this.actions.setPowerMode('Low Power');
        return 'Switching to Low Power mode.';
      }
      if (/high/i.test(lower) || /performance/i.test(lower)) {
        this.actions.setPowerMode('High Performance');
        return 'Switching to High Performance mode.';
      }
      this.actions.setPowerMode('Normal');
      return 'Switching to Normal power mode.';
    }

    return `To answer "${prompt}" with full AI capabilities, please configure an API key in Siri settings (click the Siri icon in the menu bar, then open the Siri app and go to Settings).`;
  }

  private buildSystemPrompt(): string {
    return `You are Siri AI, an intelligent assistant integrated into macOS 27 Golden Gate. You have the ability to control the operating system. When the user asks to perform system actions, respond with a JSON command in this format:
{"action": "launchApp", "appId": "appname"}
{"action": "setPowerMode", "mode": "Low Power|Normal|High Performance"}
{"action": "toggleGlass", "enabled": true|false}

Available apps: finder, safari, messages, music, tv, photos, calendar, notes, settings, terminal, activitymonitor, weather, calculator, siriai, facetime, mail, maps, phone, reminders, stickies, contacts, appstore, books, wallet, github.

If no system action is needed, respond conversationally as a helpful AI assistant. Keep responses concise.`;
  }

  async sendMessage(messages: ChatMessage[], provider: AIProvider, apiKey: string): Promise<AIResponse> {
    const config = PROVIDERS.find((p) => p.key === provider);
    if (!config) throw new Error(`Unknown provider: ${provider}`);

    const systemMsg: ChatMessage = { role: 'system', content: this.buildSystemPrompt() };
    const fullMessages = [systemMsg, ...messages];

    try {
      let text: string;

      switch (provider) {
        case 'gemini':
          text = await this.callGemini(fullMessages, apiKey, config);
          break;
        case 'groq':
          text = await this.callGroq(fullMessages, apiKey, config);
          break;
        case 'openrouter':
          text = await this.callOpenRouter(fullMessages, apiKey, config);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      this.tryExecuteAction(text);

      return { text, provider };
    } catch (err: any) {
      console.error(`AIEngine [${provider}] error:`, err);
      return {
        text: `Error: ${err.message || 'Failed to get response from ' + provider}. Please check your API key and try again.`,
        provider,
      };
    }
  }

  private async callGemini(messages: ChatMessage[], apiKey: string, _config: AIProviderConfig): Promise<string> {
    void _config;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === 'system')?.content || '';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
  }

  private async callGroq(messages: ChatMessage[], apiKey: string, _config: AIProviderConfig): Promise<string> {
    void _config;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || 'No response from Groq.';
  }

  private async callOpenRouter(messages: ChatMessage[], apiKey: string, _config: AIProviderConfig): Promise<string> {
    void _config;
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'macOS 27 Golden Gate - Siri AI',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || 'No response from OpenRouter.';
  }

  private tryExecuteAction(text: string): void {
    const jsonRegex = /\{"action":\s*"[^"]+".*\}/g;
    const matches = text.match(jsonRegex);
    if (!matches) return;

    for (const match of matches) {
      try {
        const cmd = JSON.parse(match);
        switch (cmd.action) {
          case 'launchApp':
            if (cmd.appId) this.actions.launchApp(cmd.appId);
            break;
          case 'setPowerMode':
            if (cmd.mode) this.actions.setPowerMode(cmd.mode);
            break;
          case 'toggleGlass':
            this.actions.updateSystemState({ glassBlurIntensity: cmd.enabled ? 50 : 0 });
            break;
        }
      } catch (e) {
        console.warn('Failed to parse AI action command:', e);
      }
    }
  }
}
