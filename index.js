#!/usr/bin/env node
/**
 * npm create @pukujan/modular-monolith
 * Copies template/ into the target directory.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

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

const forceNoMiniModules = process.argv.includes("--no-mini-modules");

const target = resolve(process.cwd(), targetArg);

if (existsSync(target) && existsSync(join(target, "package.json"))) {
  console.error(`Target already exists and looks like a project: ${target}`);
  process.exit(1);
}

async function askMiniModules() {
  if (forceNoMiniModules) return false;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question("\nInclude mini-modules scaffold (ai-ops pipeline + memory)? [Y/n] ", (a) => {
      rl.close();
      resolve(a);
    });
  });
  return answer.toLowerCase() !== "n";
}

const includeMiniModules = await askMiniModules();

mkdirSync(target, { recursive: true });
cpSync(templateDir, target, { recursive: true });

if (!includeMiniModules) {
  const backendAiOps = join(target, "backend/src/modules/ai-ops");
  const frontendAiOps = join(target, "frontend/src/modules/ai-ops");

  if (existsSync(backendAiOps)) rmSync(backendAiOps, { recursive: true });
  if (existsSync(frontendAiOps)) rmSync(frontendAiOps, { recursive: true });

  console.log("\nMini-modules scaffold skipped.");
}

const REPO_URL = "https://github.com/Pukujan/create-modular-monolith";
const NPM_URL = "https://www.npmjs.com/package/@pukujan/create-modular-monolith";

console.log(`
Created modular monolith at ${target}

Next steps:
  cd ${targetArg}
  npm install --prefix backend
  npm install --prefix frontend
  npm run lint:contracts

Read docs/architecture/CONTRACTS_OVERVIEW.md and AGENTS.md before adding modules.
  npm run new:module -- my-feature --label "My Feature"

──────────────────────────────────────────────────────────────────
  Platform repo (star, docs, issues):
  ${REPO_URL}

  npm package:
  ${NPM_URL}
──────────────────────────────────────────────────────────────────
`);
