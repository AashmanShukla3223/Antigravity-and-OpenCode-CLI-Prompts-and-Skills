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
  return PROVIDERS.some(p => !!getStoredApiKey(p.key));
}

export class AIEngine {
  private actions: SystemActions;

  constructor(actions: SystemActions) {
    this.actions = actions;
  }

  async executeCommand(prompt: string): Promise<string> {
    const provider = getActiveProvider();
    const apiKey = getStoredApiKey(provider);
    const response = await this.sendMessage(
      [{ role: 'user', content: prompt }],
      provider,
      apiKey,
    );
    return response.text;
  }

  private buildSystemPrompt(): string {
    return `You are Siri AI, an intelligent assistant integrated into macOS 27 Golden Gate. You have the ability to control the operating system. When the user asks to perform system actions, respond with a JSON command in this format:
{"action": "launchApp", "appId": "appname"}
{"action": "setPowerMode", "mode": "Low Power|Normal|High Performance"}
{"action": "toggleGlass", "enabled": true|false}

Available apps: finder, safari, messages, music, tv, photos, calendar, notes, settings, terminal, activitymonitor, weather, calculator, siriai, facetime, mail, maps, phone, reminders, stickies, contacts, appstore, books, wallet, githubnavigator.

If no system action is needed, respond conversationally as a helpful AI assistant. Keep responses concise.`;
  }

  async sendMessage(
    messages: ChatMessage[],
    provider: AIProvider,
    apiKey: string,
  ): Promise<AIResponse> {
    const config = PROVIDERS.find(p => p.key === provider);
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
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';

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
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
