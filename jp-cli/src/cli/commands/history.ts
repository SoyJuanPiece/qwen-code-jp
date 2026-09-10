import { readHistory } from '../../history/store.js';

export function historyCommand(historyPath: string): number {
  const entries = readHistory(historyPath);
  if (entries.length === 0) {
    process.stdout.write('No local history.\n');
    return 0;
  }

  for (const entry of entries) {
    process.stdout.write(
      `[${entry.timestamp}] ${entry.provider}/${entry.model}\nQ: ${entry.prompt}\nA: ${entry.response}\n\n`,
    );
  }
  return 0;
}
