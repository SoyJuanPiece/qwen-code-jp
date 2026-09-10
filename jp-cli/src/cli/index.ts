#!/usr/bin/env node

import { parseArgs } from './args.js';
import { loadConfig } from '../config/loader.js';
import { resolveHistoryPath } from '../history/store.js';
import { historyCommand } from './commands/history.js';
import { cleanCommand } from './commands/clean.js';
import { chatCommand } from './commands/chat.js';
import { authCommand } from './commands/auth.js';

function printHelp(): void {
  process.stdout.write(\`jp cli

Usage:
  jp [--provider <id>] [--model <model>] [-f <file>] [--continue] "<prompt}"
  jp chat [options] "<prompt>"
  jp history
  jp clean
  jp auth --key <api-key> [--provider <id>]

Options:
  --provider    openai|anthropic|gemini|deepseek|groq|openrouter|ollama|opencodezen|generic-openai
  --model, -m   model id
  --file, -f    context file or directory
  --key         API key for auth command
  --continue    continue from last local session response
  --help, -h    show help
\`.trim());
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
  }

  if (args.command === 'auth') {
    return authCommand(args.provider);
  }

  const config = loadConfig();
  const historyPath = resolveHistoryPath(config.history?.path);

  if (args.command === 'history') {
    return historyCommand(historyPath);
  }

  if (args.command === 'clean') {
    return cleanCommand(historyPath);
  }

  return chatCommand({
    config,
    prompt: args.prompt,
    model: args.model,
    provider: args.provider,
    file: args.file,
    historyPath,
    continue: args.continue,
  });
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(\`jp error: \${message}\n\`);
    process.exit(1);
  });
