import type { ConfigShape, ProviderId } from '../providers/types.js';
import { chatWithFallback } from '../providers/fallback-engine.js';
import { buildProviderMap, resolveProviderOrder } from '../providers/registry.js';

export interface ChatInput {
  prompt: string;
  model: string;
  context?: string;
  provider?: ProviderId;
}

export function runChat(config: ConfigShape, input: ChatInput) {
  const providerMap = buildProviderMap(config);
  const providerOrder = resolveProviderOrder(config, input.provider)
    .filter((id): id is ProviderId => id in providerMap)
    .map((id) => providerMap[id]);

  if (providerOrder.length === 0) {
    throw new Error('No provider configured');
  }

  return chatWithFallback(providerOrder, {
    prompt: input.prompt,
    model: input.model,
    context: input.context,
  });
}
