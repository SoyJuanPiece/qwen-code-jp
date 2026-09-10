import type { ProviderSettings } from '../types.js';
import { createGenericAdapter } from './generic-openai.js';

export function createOpenCodeZenAdapter(settings: ProviderSettings | undefined, allowedEndpoints: string[]) {
  return createGenericAdapter('opencodezen', 'https://opencode.ai/zen/v1/chat/completions', settings, allowedEndpoints);
}
