#!/usr/bin/env node
/**
 * npm create @pukujan/modular-monolith
 * Copies template/ into the target directory.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const templateDir = join(__dirname, "template");
const additionalModulesDir = join(__dirname, "additional-modules");

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
  console.log(`
  Scaffolding options:
    1) Mini-modules  (latest, default) — full pipeline agents + memory system
    2) Lightweight   — base scaffold only

`);
  const answer = await new Promise((resolve) => {
    rl.question("  Choose (1/2) [1]: ", (a) => {
      rl.close();
      resolve(a);
    });
  });
  return answer.trim() === "" || answer.trim() === "1";
}

const includeMiniModules = await askMiniModules();

mkdirSync(target, { recursive: true });
cpSync(templateDir, target, { recursive: true });
copyFileSync(join(__dirname, "LICENSE"), join(target, "LICENSE"));
if (existsSync(additionalModulesDir)) {
  for (const entry of readdirSync(additionalModulesDir)) {
    if (["phase-builder", "node_modules", "__pycache__"].includes(entry)) continue;
    const src = join(additionalModulesDir, entry);
    const dest = join(target, entry);
    if (statSync(src).isDirectory()) {
      cpSync(src, dest, { recursive: true });
    } else {
      copyFileSync(src, dest);
    }
  }
}

if (!includeMiniModules) {
  const backendAiOps = join(target, "backend/src/modules/ai-ops");
  const frontendAiOps = join(target, "frontend/src/modules/ai-ops");

  if (existsSync(backendAiOps)) rmSync(backendAiOps, { recursive: true });
  if (existsSync(frontendAiOps)) rmSync(frontendAiOps, { recursive: true });
}

const REPO_URL = "https://github.com/Pukujan/create-modular-monolith";
const NPM_URL = "https://www.npmjs.com/package/@pukujan/create-modular-monolith";

console.log(`
Created modular monolith at ${target} (mini-modules: ${includeMiniModules ? "included" : "skipped"})

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
