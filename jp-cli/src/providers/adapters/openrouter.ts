import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createOpenRouterAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('openrouter', 'https://openrouter.ai/api/v1', settings, allowedEndpoints);
}
