#!/usr/bin/env node

import { parseArgs } from './args.js';
import { loadConfig } from '../config/loader.js';
import { resolveHistoryPath } from '../history/store.js';
import { historyCommand } from './commands/history.js';
import { cleanCommand } from './commands/clean.js';
import { chatCommand } from './commands/chat.js';

function printHelp(): void {
  process.stdout.write(`jp cli

Usage:
  jp [--provider <id>] [--model <model>] [-f <file>] [--continue] "<prompt>"
  jp chat [options] "<prompt>"
  jp history
  jp clean

Options:
  --provider    openai|anthropic|gemini|deepseek|groq|openrouter|ollama|generic-openai
  --model, -m   model id
  --file, -f    context file or directory
  --continue    continue from last local session response
  --help, -h    show help
`);
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
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
    process.stderr.write(`jp error: ${message}\n`);
    process.exit(1);
  });
