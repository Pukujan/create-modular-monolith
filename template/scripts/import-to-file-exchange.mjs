#!/usr/bin/env node
/**
 * Copy an inbound bundle into file-exchange/imports/{UTC-stamp}/
 * Usage: node scripts/import-to-file-exchange.mjs /path/to/bundle [optional-stamp]
 */
import { realpathSync } from "fs";
import { cp, mkdir, access, rm } from "fs/promises";
import { join, basename, dirname, resolve, isAbsolute, sep } from "path";
import { fileURLToPath } from "url";
import { formatExchangeTimestamp } from "../backend/src/shared/utils/formatExchangeTimestamp.js";
import { resolveArtifactPaths } from "../backend/src/shared/config/resolveArtifactPaths.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @param {string} child @param {string} root */
function isInside(child, root) {
  const normalizedRoot = normalizePath(root);
  const normalizedChild = normalizePath(child);
  const rootPrefix = normalizedRoot.endsWith(sep) ? normalizedRoot : `${normalizedRoot}${sep}`;
  return normalizedChild === normalizedRoot || normalizedChild.startsWith(rootPrefix);
}

function normalizePath(path) {
  try {
    return realpathSync(resolve(path));
  } catch {
    return resolve(path);
  }
}

async function main() {
  const source = process.argv[2];
  if (!source) {
    console.error("Usage: node scripts/import-to-file-exchange.mjs <sourceDirOrZipParent> [UTC-stamp]");
    process.exit(1);
  }

  const stamp = process.argv[3] || formatExchangeTimestamp();
  const { fileExchangeImports } = resolveArtifactPaths(repoRoot);
  const dest = join(fileExchangeImports, stamp);
  const absSource = isAbsolute(source) ? resolve(source) : resolve(process.cwd(), source);
  const repoRootResolved = normalizePath(repoRoot);
  const importsRoot = normalizePath(fileExchangeImports);
  const exportsRoot = normalizePath(join(repoRoot, "file-exchange/exports"));

  try {
    await access(absSource);
  } catch {
    console.error("Source not found:", absSource);
    process.exit(1);
  }

  await mkdir(dest, { recursive: true });
  const folderName = basename(absSource);
  const target = join(dest, folderName);
  await cp(absSource, target, { recursive: true });

  console.log(`Imported → ${dest}/${folderName}`);
  console.log(`Stamp: ${stamp} — use for ingest scripts or paths under this import folder.`);

  const removeSource =
    isInside(absSource, repoRootResolved) &&
    !isInside(absSource, importsRoot) &&
    !isInside(absSource, exportsRoot);

  if (removeSource) {
    await rm(absSource, { recursive: true, force: true });
    console.log(`Removed source from repo (contract): ${absSource}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
