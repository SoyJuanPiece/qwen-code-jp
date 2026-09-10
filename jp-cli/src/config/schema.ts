import type { ConfigShape, ProviderId } from '../providers/types.js';

const SUPPORTED_PROVIDERS: ProviderId[] = [
  'openai',
  'anthropic',
  'gemini',
  'deepseek',
  'groq',
  'openrouter',
  'ollama',
  'generic-openai',
];

export function validateConfig(config: ConfigShape): ConfigShape {
  if (
    config.defaultProvider &&
    !SUPPORTED_PROVIDERS.includes(config.defaultProvider)
  ) {
    throw new Error(`Unsupported defaultProvider: ${config.defaultProvider}`);
  }

  if (config.fallbackOrder) {
    for (const provider of config.fallbackOrder) {
      if (!SUPPORTED_PROVIDERS.includes(provider)) {
        throw new Error(`Unsupported provider in fallbackOrder: ${provider}`);
      }
    }
  }

  return config;
}
