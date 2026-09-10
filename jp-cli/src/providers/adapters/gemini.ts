import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createGeminiAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('gemini', 'https://generativelanguage.googleapis.com/v1beta/openai', settings, allowedEndpoints);
}
