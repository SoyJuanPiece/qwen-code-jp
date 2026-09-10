import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createDeepSeekAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('deepseek', 'https://api.deepseek.com/v1', settings, allowedEndpoints);
}
