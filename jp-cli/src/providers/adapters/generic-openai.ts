import { assertAllowedOutbound } from '../../security/outbound-guard.js';
import type {
  ChatChunk,
  ChatRequest,
  ProviderAdapter,
  ProviderId,
  ProviderSettings,
} from '../types.js';

interface OpenAiLikeOptions {
  id: ProviderId;
  endpoint: string;
  apiKey?: string;
  modelAllowlist?: string[];
  staticHeaders?: Record<string, string>;
  allowedEndpoints: string[];
}

export class GenericOpenAIAdapter implements ProviderAdapter {
  public readonly id: ProviderId;
  private readonly endpoint: string;
  private readonly apiKey?: string;
  private readonly modelAllowlist?: string[];
  private readonly staticHeaders?: Record<string, string>;
  private readonly allowedEndpoints: string[];

  constructor(options: OpenAiLikeOptions) {
    this.id = options.id;
    this.endpoint = options.endpoint;
    this.apiKey = options.apiKey;
    this.modelAllowlist = options.modelAllowlist;
    this.staticHeaders = options.staticHeaders;
    this.allowedEndpoints = options.allowedEndpoints;
  }

  supports(model: string): boolean {
    if (!this.modelAllowlist || this.modelAllowlist.length === 0) {
      return true;
    }
    return this.modelAllowlist.includes(model);
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<ChatChunk> {
    assertAllowedOutbound(this.endpoint, this.allowedEndpoints);

    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...this.staticHeaders,
    };

    if (this.apiKey) {
      headers.authorization = 'Bearer ' + this.apiKey;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: req.model,
        stream: true,
        messages: [
          {
            role: 'user',
            content: req.context ? `${req.context}\n\n${req.prompt}` : req.prompt,
          },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      const err = new Error(
        `Provider request failed: ${response.status}`,
      ) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          continue;
        }
        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            yield { text };
          }
        } catch {
          continue;
        }
      }
    }

    yield { text: '', done: true };
  }
}

export function createGenericAdapter(
  id: ProviderId,
  defaultBaseUrl: string,
  settings: ProviderSettings | undefined,
  allowedEndpoints: string[],
): GenericOpenAIAdapter {
  const baseUrl = settings?.baseUrl || defaultBaseUrl;
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  return new GenericOpenAIAdapter({
    id,
    endpoint,
    apiKey: settings?.apiKey,
    modelAllowlist: settings?.models,
    staticHeaders: settings?.headers,
    allowedEndpoints,
  });
}
