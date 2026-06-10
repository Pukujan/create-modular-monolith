import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert';
import { readFile } from 'fs/promises';

const FILES = {
  overview: 'template/docs/architecture/CONTRACTS_OVERVIEW.md',
  moduleContract: 'template/docs/architecture/MODULE_INTERNAL_CONTRACT.md',
  exportScript: 'template/scripts/export-architecture-starter.mjs',
  exportManifest: 'template/file-exchange/exports/EXPORT_MANIFEST.json'
};

const ARCHIVE_FREE_FILES = [
  'template/work-log/README.md',
  'template/work-log/INDEX.md',
  'template/work-log/handoffs/README.md',
  'template/scripts/export-architecture-starter.mjs',
  'template/backend/src/shared/contracts/planningPhase.contract.js',
  'template/docs/architecture/contracts/planningPhase.contract.md',
  'template/scripts/lib/plan-artifacts.constants.mjs',
  'additional-modules/work-log/README.md',
  'additional-modules/work-log/INDEX.md',
  'additional-modules/work-log/handoffs/README.md',
  'additional-modules/scripts/render_memory.py',
  'additional-modules/scripts/measure_context.py',
  'additional-modules/context-engineering/templates/MEMORY.md.template',
  'additional-modules/context-engineering/templates/AGENTS.md.template',
  'additional-modules/context-engineering/templates/scripts/render_memory.py',
  'additional-modules/context-engineering/templates/scripts/measure_context.py'
];

describe('generic module structure contract', () => {
  it('describes generic parent/child modules instead of the old ai-ops pipeline', async () => {
    const overview = await readFile(FILES.overview, 'utf8');
    const contract = await readFile(FILES.moduleContract, 'utf8');

    ok(!overview.includes('pipelineAgentMiniModules'));
    ok(!overview.includes('ai-ops'));
    ok(contract.includes('landing'));
    ok(contract.includes('dashboard'));
    ok(!contract.includes('rule-discovery-run'));
    ok(!contract.includes('/api/ai-ops'));
    ok(!contract.includes('case-management'));
  });

  it('does not export the pipeline mini-module contract or lint script', async () => {
    const exportScript = await readFile(FILES.exportScript, 'utf8');
    const manifest = await readFile(FILES.exportManifest, 'utf8');

    ok(!exportScript.includes('pipelineAgentMiniModules.contract.md'));
    ok(!exportScript.includes('pipeline-agent-mini-modules.registry.json'));
    ok(!exportScript.includes('lint-pipeline-agent-mini-modules.mjs'));
    ok(!manifest.includes('lint-pipeline-agent-mini-modules.mjs'));
  });

  it('does not advertise archive folders in the live scaffold', async () => {
    for (const file of ARCHIVE_FREE_FILES) {
      const content = await readFile(file, 'utf8');

      ok(!content.includes('study-docs'), `${file} should not mention study-docs`);
      ok(!content.includes('work-log/sessions'), `${file} should not mention work-log/sessions`);
      ok(!content.includes('archive-session'), `${file} should not mention archive-session`);
      ok(!content.includes('studyDocsDir'), `${file} should not mention studyDocsDir`);
    }
  });
});
