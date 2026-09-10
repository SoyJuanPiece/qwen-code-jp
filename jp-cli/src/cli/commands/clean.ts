import { cleanHistory } from '../../history/store.js';

export function cleanCommand(historyPath: string): number {
  cleanHistory(historyPath);
  process.stdout.write('Local history removed.\n');
  return 0;
}
