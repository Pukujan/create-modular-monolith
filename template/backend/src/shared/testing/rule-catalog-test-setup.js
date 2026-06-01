import { mkdtempSync } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";
import { openDatabase } from "../db/openDatabase.js";
import { runSqlMigration } from "../db/sqlite.js";
import { createSqliteRuleCatalogRepository } from "../../modules/ai-ops/repositories/rule-catalog.repository.sqlite.js";
import { createRuleCatalogService } from "../../modules/ai-ops/services/rule-catalog.service.js";
import {
  setRuleCatalogService,
  resetRuleCatalogService
} from "../../modules/ai-ops/services/rule-catalog.provider.js";
import { seedRuleCatalogIfEmpty } from "../../../scripts/seed-rule-catalog.mjs";

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Initialize SQLite rule catalog for unit tests (bootstrap seed runs once).
 */
export async function initRuleCatalogForTests() {
  resetRuleCatalogService();
  const tempRoot = mkdtempSync(join(tmpdir(), "rule-catalog-test-"));
  const opened = openDatabase(`file:${join(tempRoot, "catalog.db")}`, backendRoot);
  runSqlMigration(
    opened.client,
    join(backendRoot, "src/modules/ai-ops/repositories/migrations/002_rule_discovery_catalog.sql")
  );
  const repository = createSqliteRuleCatalogRepository({ db: opened.client });
  await seedRuleCatalogIfEmpty(repository);
  const service = createRuleCatalogService({ repository });
  await service.refresh();
  setRuleCatalogService(service);
  return service;
}
