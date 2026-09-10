import type { ChatRequest, ProviderAdapter } from './types.js';

export async function* chatWithFallback(
  adapters: ProviderAdapter[],
  req: ChatRequest,
): AsyncGenerator<{ text: string; done?: boolean }> {
  let lastErr: unknown;

  for (const adapter of adapters) {
    try {
      yield* adapter.chatStream(req);
      return;
    } catch (e: unknown) {
      lastErr = e;
      const status =
        (e as { status?: number; response?: { status?: number } }).status ??
        (e as { response?: { status?: number } }).response?.status;
      if (status === 429) {
        continue;
      }
      throw e;
    }
  }

  throw lastErr ?? new Error('No provider available');
}
