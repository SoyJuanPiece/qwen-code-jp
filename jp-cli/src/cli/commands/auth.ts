import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { ConfigShape, ProviderId } from '../../providers/types.js';
import { validateConfig } from '../../config/schema.js';
import { ensureSecureConfigPath, getConfigDir, getConfigFilePath } from '../../config/secure-store.js';

export async function authCommand(provider: ProviderId | undefined): Promise<number> {
  const p = provider ?? 'opencodezen';
  const key = process.env.OPENCODE_API_KEY ?? process.argv.find((a, i) => process.argv[i - 1] === '--key') ?? '';

  if (!key) {
    process.stdout.write('Usage: jp auth --key <api-key> [--provider <id>]\n');
    process.stdout.write('Default provider: opencodezen\n');
    process.stdout.write('Set OPENCODE_API_KEY env var to skip passing the key.\n');
    return 1;
  }

  const configDir = getConfigDir();
  ensureSecureConfigPath(configDir);

  const configPath = getConfigFilePath();
  let config: ConfigShape;
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    try {
      config = JSON.parse(raw) as ConfigShape;
    } catch {
      config = { providers: {} };
    }
  } else {
    config = { providers: {} };
  }

  if (!config.providers) config.providers = {};
  config.providers[p] = { ...config.providers[p], apiKey: key };

  const json = JSON.stringify(config, null, 2) + '\n';
  fs.writeFileSync(configPath, json, { mode: 0o600 });

  process.stdout.write(\`✅ Authenticated \${p}. API key saved to \${configPath}\n\`);
  return 0;
}
