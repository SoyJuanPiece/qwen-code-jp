import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createAnthropicAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('anthropic', 'https://api.anthropic.com/v1', settings, allowedEndpoints);
}
