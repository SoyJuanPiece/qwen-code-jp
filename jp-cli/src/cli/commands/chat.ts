import { appendHistory, readHistory } from '../../history/store.js';
import { loadFileContext, readStdinIfPresent } from '../../runtime/context-loader.js';
import { runChat } from '../../runtime/chat-service.js';
import { renderStream } from '../../runtime/stream-renderer.js';
import type { ConfigShape, ProviderId } from '../../providers/types.js';

interface ChatCommandOptions {
  config: ConfigShape;
  prompt?: string;
  model?: string;
  provider?: ProviderId;
  file?: string;
  historyPath: string;
  continue?: boolean;
}

export async function chatCommand(options: ChatCommandOptions): Promise<number> {
  const stdinText = await readStdinIfPresent();
  const fileContext = loadFileContext(options.file);
  const historyEntries = options.continue
    ? readHistory(options.historyPath)
    : [];
  const previousResponse =
    historyEntries.length > 0
      ? historyEntries[historyEntries.length - 1].response
      : undefined;

  const prompt = options.prompt ?? stdinText;
  if (!prompt?.trim()) {
    process.stderr.write('Missing prompt. Example: jp -m gpt-4o-mini "hola"\n');
    return 1;
  }

  const context = [
    previousResponse ? `Previous assistant response:\n${previousResponse}` : undefined,
    fileContext,
    stdinText && options.prompt ? stdinText : undefined,
  ]
    .filter(Boolean)
    .join('\n\n');

  const model = options.model ?? options.config.defaultModel ?? 'gpt-4o-mini';
  const stream = runChat(options.config, {
    prompt,
    model,
    context: context || undefined,
    provider: options.provider,
  });

  const output = await renderStream(stream);

  if (options.config.history?.enabled !== false) {
    appendHistory(options.historyPath, {
      timestamp: new Date().toISOString(),
      provider: options.provider || options.config.defaultProvider || 'auto',
      model,
      prompt,
      response: output,
    });
  }

  return 0;
}
