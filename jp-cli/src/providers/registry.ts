import type { ConfigShape, ProviderAdapter, ProviderId } from './types.js';
import { createOpenAIAdapter } from './adapters/openai.js';
import { createAnthropicAdapter } from './adapters/anthropic.js';
import { createGeminiAdapter } from './adapters/gemini.js';
import { createDeepSeekAdapter } from './adapters/deepseek.js';
import { createGroqAdapter } from './adapters/groq.js';
import { createOpenRouterAdapter } from './adapters/openrouter.js';
import { createOllamaAdapter } from './adapters/ollama.js';
import { createGenericAdapter } from './adapters/generic-openai.js';
import { createOpenCodeZenAdapter } from './adapters/opencodezen.js';

function collectAllowedOrigins(config: ConfigShape): string[] {
  const values: string[] = [];
  for (const provider of Object.values(config.providers ?? {})) {
    if (provider?.baseUrl) {
      values.push(provider.baseUrl);
    }
  }
  values.push('http://localhost:11434/v1');
  values.push('http://localhost:1234/v1');
  values.push('http://localhost:8000/v1');
  values.push('https://opencode.ai/zen/v1');
  return values;
}

export function buildProviderMap(config: ConfigShape): Record<ProviderId, ProviderAdapter> {
  const allowedEndpoints = collectAllowedOrigins(config);

  return {
    openai: createOpenAIAdapter(config.providers?.openai, allowedEndpoints),
    anthropic: createAnthropicAdapter(config.providers?.anthropic, allowedEndpoints),
    gemini: createGeminiAdapter(config.providers?.gemini, allowedEndpoints),
    deepseek: createDeepSeekAdapter(config.providers?.deepseek, allowedEndpoints),
    groq: createGroqAdapter(config.providers?.groq, allowedEndpoints),
    openrouter: createOpenRouterAdapter(config.providers?.openrouter, allowedEndpoints),
    ollama: createOllamaAdapter(config.providers?.ollama, allowedEndpoints),
    opencodezen: createOpenCodeZenAdapter(config.providers?.opencodezen, allowedEndpoints),
    'generic-openai': createGenericAdapter(
      'generic-openai',
      config.providers?.['generic-openai']?.baseUrl || 'http://localhost:8000/v1',
      config.providers?.['generic-openai'],
      allowedEndpoints,
    ),
  };
}

export function resolveProviderOrder(
  config: ConfigShape,
  selectedProvider?: ProviderId,
): ProviderId[] {
  if (selectedProvider) {
    const fallbacks = (config.fallbackOrder ?? []).filter((p) => p !== selectedProvider);
    return [selectedProvider, ...fallbacks];
  }

  const base = config.defaultProvider ? [config.defaultProvider] : [];
  return [...base, ...(config.fallbackOrder ?? [])];
}
