#!/usr/bin/env node
/**
 * Shown once after the first `npm install` in backend/ (scaffolded app).
 */
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

const REPO_URL = "https://github.com/Pukujan/create-modular-monolith";
const NPM_URL = "https://www.npmjs.com/package/@pukujan/create-modular-monolith";
const FLAG_NAME = ".create-modular-monolith-welcome";

/**
 * @param {string} cwd
 * @returns {string}
 */
function resolveProjectRoot(cwd) {
  const base = cwd.split(/[/\\]/).pop();
  if (base === "backend" || base === "frontend") {
    return join(cwd, "..");
  }
  return cwd;
}

const projectRoot = resolveProjectRoot(process.cwd());
const flagPath = join(projectRoot, FLAG_NAME);

if (existsSync(flagPath)) {
  process.exit(0);
}

writeFileSync(flagPath, new Date().toISOString(), "utf8");

console.log(`
┌─────────────────────────────────────────────────────────────────┐
│  Built with Pukujan Modular Monolith Platform (MIT)             │
│                                                                 │
│  Star · issues · docs · releases:                               │
│  ${REPO_URL}
│                                                                 │
│  npm: ${NPM_URL}
│                                                                 │
│  Start here: AGENTS.md · docs/architecture/CONTRACTS_OVERVIEW.md│
└─────────────────────────────────────────────────────────────────┘
`);
