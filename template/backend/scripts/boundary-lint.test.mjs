import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { findMiniModuleViolations } from "./check-parent-mini-modules.mjs";
import { findModuleBoundaryViolations } from "./check-module-boundaries.mjs";

test("mini-module: barrel import is allowed", () => {
  const root = mkdtempSync(join(tmpdir(), "mini-mod-"));
  const modulesDir = join(root, "modules");
  const file = join(modulesDir, "ai-ops", "document-intelligence", "services", "x.js");
  mkdirSync(join(modulesDir, "ai-ops", "document-intelligence", "services"), { recursive: true });
  mkdirSync(join(modulesDir, "ai-ops", "rule-discovery"), { recursive: true });
  writeFileSync(
    file,
    `import { planAuthorities } from "../../rule-discovery/index.js";\n`,
    "utf8"
  );

  const violations = findMiniModuleViolations({ modulesDir, skipBackend: true });
  assert.equal(violations.length, 0);
  rmSync(root, { recursive: true, force: true });
});

test("mini-module: deep sibling import is forbidden", () => {
  const root = mkdtempSync(join(tmpdir(), "mini-mod-"));
  const modulesDir = join(root, "modules");
  const file = join(modulesDir, "ai-ops", "document-intelligence", "services", "x.js");
  mkdirSync(join(modulesDir, "ai-ops", "document-intelligence", "services"), { recursive: true });
  writeFileSync(
    file,
    `import X from "../../rule-discovery/components/Bad.jsx";\n`,
    "utf8"
  );

  const violations = findMiniModuleViolations({ modulesDir, skipBackend: true });
  assert.equal(violations.length, 1);
  assert.match(violations[0].specifier, /rule-discovery\/components/);
  rmSync(root, { recursive: true, force: true });
});

test("backend mini-module: barrel import is allowed", () => {
  const root = mkdtempSync(join(tmpdir(), "backend-mini-"));
  const modulesDir = join(root, "modules");
  const file = join(modulesDir, "ai-ops", "ocr-agent", "services", "x.js");
  mkdirSync(join(modulesDir, "ai-ops", "ocr-agent", "services"), { recursive: true });
  mkdirSync(join(modulesDir, "ai-ops", "parser-agent"), { recursive: true });
  writeFileSync(file, `import { classifyUploadedFile } from "../../parser-agent/index.js";\n`, "utf8");

  const violations = findMiniModuleViolations({ backendModulesDir: modulesDir, skipFrontend: true });
  assert.equal(violations.length, 0);
  rmSync(root, { recursive: true, force: true });
});

test("backend mini-module: deep sibling import is forbidden", () => {
  const root = mkdtempSync(join(tmpdir(), "backend-mini-"));
  const modulesDir = join(root, "modules");
  const file = join(modulesDir, "ai-ops", "ocr-agent", "services", "x.js");
  mkdirSync(join(modulesDir, "ai-ops", "ocr-agent", "services"), { recursive: true });
  writeFileSync(
    file,
    `import X from "../../parser-agent/services/parse-route.service.js";\n`,
    "utf8"
  );

  const violations = findMiniModuleViolations({ backendModulesDir: modulesDir, skipFrontend: true });
  assert.equal(violations.length, 1);
  assert.match(violations[0].specifier, /parser-agent\/services/);
  rmSync(root, { recursive: true, force: true });
});

test("cross-module: allowlisted app-shell to case-management", () => {
  const root = mkdtempSync(join(tmpdir(), "cross-mod-"));
  const frontendRoot = join(root, "frontend");
  const modulesDir = join(frontendRoot, "src/modules");
  const file = join(modulesDir, "app-shell", "components", "App.jsx");
  mkdirSync(dirnameFor(file), { recursive: true });
  mkdirSync(join(modulesDir, "case-management", "components"), { recursive: true });
  writeFileSync(file, `import X from "../../case-management/components/X.jsx";\n`, "utf8");

  const violations = findModuleBoundaryViolations({
    apps: [
      {
        name: "frontend",
        root: frontendRoot,
        modulesSubpath: "src/modules"
      }
    ]
  });
  assert.equal(violations.length, 0);
  rmSync(root, { recursive: true, force: true });
});

test("cross-module: ai-ops to case-management is forbidden", () => {
  const root = mkdtempSync(join(tmpdir(), "cross-mod-"));
  const frontendRoot = join(root, "frontend");
  const modulesDir = join(frontendRoot, "src/modules");
  const file = join(modulesDir, "ai-ops", "pages", "Bad.jsx");
  mkdirSync(join(modulesDir, "ai-ops", "pages"), { recursive: true });
  writeFileSync(
    file,
    `import { listRules } from "../../case-management/services/rules-authority.service.js";\n`,
    "utf8"
  );

  const violations = findModuleBoundaryViolations({
    apps: [
      {
        name: "frontend",
        root: frontendRoot,
        modulesSubpath: "src/modules"
      }
    ]
  });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].rule, "relative-cross-module");
  rmSync(root, { recursive: true, force: true });
});

function dirnameFor(filePath) {
  return filePath.replace(/[/\\][^/\\]+$/, "");
}
