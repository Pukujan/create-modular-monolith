#!/usr/bin/env node

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { init } from './lib/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(__dirname, '..', 'templates');

const projectRoot = process.cwd();

const command = process.argv[2] || 'init';

if (command === 'init') {
  await init(projectRoot, TEMPLATES);
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Usage: context-engineering init');
  process.exit(1);
}
