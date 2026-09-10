export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'generic-openai';

export interface ChatRequest {
  prompt: string;
  model: string;
  context?: string;
}

export interface ChatChunk {
  text: string;
  done?: boolean;
}

export interface ProviderAdapter {
  id: ProviderId;
  supports(model: string): boolean;
  chatStream(req: ChatRequest): AsyncGenerator<ChatChunk>;
}

export interface ProviderSettings {
  enabled?: boolean;
  apiKey?: string;
  apiKeyEnv?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  models?: string[];
}

export interface ConfigShape {
  defaultProvider?: ProviderId;
  defaultModel?: string;
  providers?: Partial<Record<ProviderId, ProviderSettings>>;
  fallbackOrder?: ProviderId[];
  history?: {
    enabled?: boolean;
    path?: string;
  };
}
