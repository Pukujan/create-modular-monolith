#!/usr/bin/env node
/**
 * npm create @pukujan/modular-monolith
 * Copies template/ into the target directory.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, readFileSync, statSync, writeFileSync } from "fs";
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

const includeContextEngineering = !process.argv.includes("--no-memory");

const target = resolve(process.cwd(), targetArg);

if (existsSync(target) && existsSync(join(target, "package.json"))) {
  console.error(`Target already exists and looks like a project: ${target}`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
cpSync(templateDir, target, { recursive: true });
copyFileSync(join(__dirname, "LICENSE"), join(target, "LICENSE"));
if (existsSync(additionalModulesDir)) {
  const templatesRoot = join(additionalModulesDir, "context-engineering", "templates");
  // Place AGENTS.md and MEMORY.md at project root (from templates)
  for (const [name, template] of [["AGENTS.md", "AGENTS.md.template"], ["MEMORY.md", "MEMORY.md.template"]]) {
    const tplPath = join(templatesRoot, template);
    if (existsSync(tplPath)) {
      const content = readFileSync(tplPath, "utf8");
      writeFileSync(join(target, name), content);
    }
  }
  // Copy remaining additional-modules content
  for (const entry of readdirSync(additionalModulesDir)) {
    if (["phase-builder", "node_modules", "__pycache__", "AGENTS.md", "MEMORY.md"].includes(entry)) continue;
    const src = join(additionalModulesDir, entry);
    const additionalModulesTarget = join(target, "additional-modules");
    cpSync(src, join(additionalModulesTarget, entry), { recursive: true });
  }
}

const REPO_URL = "https://github.com/Pukujan/create-modular-monolith";
const NPM_URL = "https://www.npmjs.com/package/@pukujan/create-modular-monolith";

console.log(`
Created modular monolith at ${target}

Next steps:
  cd ${targetArg}
  node additional-modules/context-engineering/bin/context-eng.js init --phase-builder
  python3 additional-modules/scripts/measure_context.py --tokens 0 --start-session
  python3 additional-modules/scripts/render_memory.py
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
