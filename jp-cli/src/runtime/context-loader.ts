import fs from 'node:fs';
import path from 'node:path';

export function readStdinIfPresent(): Promise<string | undefined> {
  if (process.stdin.isTTY) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    process.stdin.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim();
      resolve(text || undefined);
    });
    process.stdin.on('error', reject);
  });
}

export function loadFileContext(filePath?: string): string | undefined {
  if (!filePath) return undefined;
  const resolved = path.resolve(filePath);
  const stats = fs.statSync(resolved);
  if (stats.isDirectory()) {
    return fs
      .readdirSync(resolved)
      .sort()
      .map((name) => path.join(resolved, name))
      .join('\n');
  }
  return fs.readFileSync(resolved, 'utf8');
}
