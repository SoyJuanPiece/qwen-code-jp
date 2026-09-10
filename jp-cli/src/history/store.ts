import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface HistoryEntry {
  timestamp: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
}

export function resolveHistoryPath(configPath?: string): string {
  if (configPath) {
    if (configPath.startsWith('~/')) {
      return path.join(os.homedir(), configPath.slice(2));
    }
    return configPath;
  }
  return path.join(os.homedir(), '.config', 'jp-cli', 'history.jsonl');
}

export function appendHistory(filePath: string, entry: HistoryEntry): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const line = `${JSON.stringify(entry)}\n`;
  fs.appendFileSync(filePath, line, { mode: 0o600 });
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o600);
  }
}

export function readHistory(filePath: string): HistoryEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines
    .map((line) => JSON.parse(line) as HistoryEntry)
    .filter(Boolean);
}

export function cleanHistory(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
