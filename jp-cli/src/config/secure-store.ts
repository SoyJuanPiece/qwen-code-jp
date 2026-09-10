import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getConfigDir(): string {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'jp-cli');
  }
  return path.join(os.homedir(), '.config', 'jp-cli');
}

export function getConfigFilePath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function ensureSecureConfigPath(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}\n', { mode: 0o600 });
  }
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o600);
  }
}
