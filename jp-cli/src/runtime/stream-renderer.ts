import type { ChatChunk } from '../providers/types.js';

export async function renderStream(stream: AsyncGenerator<ChatChunk>): Promise<string> {
  let output = '';
  process.stdout.write('\n');
  for await (const chunk of stream) {
    output += chunk.text;
    process.stdout.write(chunk.text);
  }
  process.stdout.write('\n');
  return output;
}
