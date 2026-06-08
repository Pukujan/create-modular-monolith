#!/usr/bin/env node
/**
 * Wipe live AI Ops data: agent runs + document vault (Neon/SQLite) and local upload folders.
 * Demo JSON fixtures in frontend are untouched.
 *
 * Usage: node scripts/reset-ai-ops-data.mjs [--yes]
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import { rm, readdir, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(scriptDir, "..");
const repoRoot = join(backendRoot, "..");

config({ path: join(backendRoot, ".env") });

const TABLES_POSTGRES = [
  "agent_run_events",
  "agent_runs",
  "document_text_versions",
  "document_blobs",
  "tasks",
  "case_state_snapshots",
  "documents",
  "cases"
];

const TABLES_SQLITE = [...TABLES_POSTGRES];

function isPostgresUrl(url) {
  const t = String(url ?? "").trim();
  return t.startsWith("postgres://") || t.startsWith("postgresql://");
}

function sqlitePathFromUrl(url) {
  const raw = String(url ?? "").trim();
  if (!raw.startsWith("file:")) return null;
  const pathPart = raw.slice("file:".length);
  return pathPart.startsWith("/") || /^[A-Za-z]:/.test(pathPart)
    ? pathPart
    : join(backendRoot, pathPart);
}

async function wipePostgres(databaseUrl) {
  const sql = neon(databaseUrl);
  const tableList = TABLES_POSTGRES.join(", ");
  await sql.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
  const counts = {};
  for (const table of TABLES_POSTGRES) {
    const rows = await sql.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    counts[table] = rows[0]?.n ?? 0;
  }
  return counts;
}

function wipeSqlite(dbPath) {
  const db = new Database(dbPath);
  try {
    db.pragma("foreign_keys = OFF");
    for (const table of TABLES_SQLITE) {
      try {
        db.prepare(`DELETE FROM ${table}`).run();
      } catch {
        /* table may not exist in this db */
      }
    }
    db.pragma("foreign_keys = ON");
  } finally {
    db.close();
  }
}

async function clearUploadsDir(uploadsRoot) {
  let removed = 0;
  try {
    const entries = await readdir(uploadsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      await rm(join(uploadsRoot, entry.name), { recursive: true, force: true });
      removed += 1;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return removed;
}

async function removeLocalSqliteArtifacts() {
  const dataDir = join(repoRoot, "data");
  let removed = 0;
  let entries = [];
  try {
    entries = await readdir(dataDir);
  } catch {
    return removed;
  }
  for (const name of entries) {
    if (!/\.db(-shm|-wal)?$/i.test(name)) continue;
    await unlink(join(dataDir, name)).catch(() => {});
    removed += 1;
  }
  return removed;
}

async function main() {
  const confirmed = process.argv.includes("--yes");
  if (!confirmed) {
    console.error("This deletes ALL agent runs and vault documents in DATABASE_URL.");
    console.error("Re-run with: node scripts/reset-ai-ops-data.mjs --yes");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in backend/.env");
    process.exit(1);
  }

  if (isPostgresUrl(databaseUrl)) {
    const counts = await wipePostgres(databaseUrl);
    console.log("Neon/Postgres truncated:", TABLES_POSTGRES.join(", "));
    console.log("Row counts after wipe:", counts);
  } else {
    const dbPath = sqlitePathFromUrl(databaseUrl);
    if (!dbPath) {
      console.error("Unsupported DATABASE_URL:", databaseUrl);
      process.exit(1);
    }
    wipeSqlite(dbPath);
    console.log("SQLite wiped:", dbPath);
  }

  const uploadsRemoved = await clearUploadsDir(join(repoRoot, "data", "uploads"));
  console.log(`Removed ${uploadsRemoved} folder(s) from data/uploads/`);

  const dbFilesRemoved = await removeLocalSqliteArtifacts();
  console.log(`Removed ${dbFilesRemoved} local data/*.db artifact(s)`);

  console.log("Done. Restart the backend dev server, then hard-refresh AI Ops (Ctrl+Shift+R).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
