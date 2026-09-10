import type { ProviderId } from '../providers/types.js';

export interface ParsedArgs {
  command: 'chat' | 'history' | 'clean' | 'auth';
  prompt?: string;
  provider?: ProviderId;
  model?: string;
  file?: string;
  continue?: boolean;
  help?: boolean;
  apiKey?: string;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  const parsed: ParsedArgs = { command: 'chat' };

  const first = args[0];
  if (first === 'history' || first === 'clean' || first === 'chat' || first === 'auth') {
    parsed.command = first;
    args.shift();
  }

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === '--provider' && args[i + 1]) {
      parsed.provider = args[i + 1] as ProviderId;
      i += 1;
      continue;
    }
    if (token === '--model' || token === '-m') {
      parsed.model = args[i + 1];
      i += 1;
      continue;
    }
    if (token === '--file' || token === '-f') {
      parsed.file = args[i + 1];
      i += 1;
      continue;
    }
    if (token === '--key') {
      parsed.apiKey = args[i + 1];
      i += 1;
      continue;
    }
    if (token === '--continue') {
      parsed.continue = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      parsed.help = true;
      continue;
    }
    if (!token.startsWith('-')) {
      parsed.prompt = parsed.prompt ? \`\${parsed.prompt} \${token}\` : token;
    }
  }

  return parsed;
}
