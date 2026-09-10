import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { ConfigShape, ProviderId } from '../providers/types.js';
import { validateConfig } from './schema.js';
import { ensureSecureConfigPath, getConfigDir, getConfigFilePath } from './secure-store.js';

function readLocalEnv(configDir: string): Record<string, string> {
  const envPath = path.join(configDir, '.env');
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean || clean.startsWith('#')) continue;
    const idx = clean.indexOf('=');
    if (idx <= 0) continue;
    const key = clean.slice(0, idx).trim();
    const value = clean.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
  return env;
}

function loadRawConfig(): ConfigShape {
  const configDir = getConfigDir();
  const jsonPath = getConfigFilePath();
  const yamlPath = path.join(configDir, 'config.yaml');
  const ymlPath = path.join(configDir, 'config.yml');

  ensureSecureConfigPath(jsonPath);

  if (fs.existsSync(yamlPath)) {
    return YAML.parse(fs.readFileSync(yamlPath, 'utf8')) as ConfigShape;
  }
  if (fs.existsSync(ymlPath)) {
    return YAML.parse(fs.readFileSync(ymlPath, 'utf8')) as ConfigShape;
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as ConfigShape;
}

function resolveApiKey(
  provider: ProviderId,
  config: ConfigShape,
  envFileVars: Record<string, string>,
): string | undefined {
  const envKey =
    config.providers?.[provider]?.apiKeyEnv ??
    `JP_CLI_${provider.toUpperCase().replace('-', '_')}_KEY`;

  return (
    process.env[envKey] ??
    envFileVars[envKey] ??
    config.providers?.[provider]?.apiKey
  );
}

export function loadConfig(): ConfigShape {
  const config = validateConfig(loadRawConfig());
  const envFileVars = readLocalEnv(getConfigDir());

  const providers = { ...(config.providers ?? {}) };

  (Object.keys(providers) as ProviderId[]).forEach((providerId) => {
    providers[providerId] = {
      ...providers[providerId],
      apiKey: resolveApiKey(providerId, config, envFileVars),
    };
  });

  return {
    ...config,
    providers,
  };
}
