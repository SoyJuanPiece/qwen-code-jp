import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createOpenAIAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('openai', 'https://api.openai.com/v1', settings, allowedEndpoints);
}
