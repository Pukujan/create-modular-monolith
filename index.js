#!/usr/bin/env node
/**
 * npm create @pukujan/modular-monolith
 * Copies template/ into the target directory.
 */
import { cpSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const templateDir = join(__dirname, "template");

const targetArg = process.argv[2];
if (!targetArg || targetArg === "--help" || targetArg === "-h") {
  console.log(`
Usage: npm create @pukujan/modular-monolith@2 <project-directory>

Scaffolds a modular monolith with architecture contracts, file-exchange,
pre-push dev logs (human + agent), and consolidated export tooling.

Docs: https://github.com/Pukujan/create-modular-monolith
`);
  process.exit(targetArg ? 0 : 1);
}

const target = resolve(process.cwd(), targetArg);

if (existsSync(target) && existsSync(join(target, "package.json"))) {
  console.error(`Target already exists and looks like a project: ${target}`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
cpSync(templateDir, target, { recursive: true });

console.log(`
Created modular monolith at ${target}

Next steps:
  cd ${targetArg}
  npm install --prefix backend
  npm install --prefix frontend
  npm run lint:contracts

Read docs/architecture/CONTRACTS_OVERVIEW.md and AGENTS.md before adding modules.
`);
console.log(`  npm run new:module -- my-feature --label "My Feature"\n`);
