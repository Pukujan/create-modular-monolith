import { describe, it } from 'node:test';
import { ok } from 'node:assert';
import { readFile } from 'fs/promises';

const FILES = [
  'AGENTS.md',
  'additional-modules/context-engineering/templates/AGENTS.md.template'
];

describe('architecture grounding contract', () => {
  for (const file of FILES) {
    it(`${file} points agents at the architecture contract tree`, async () => {
      const content = await readFile(file, 'utf8');

      ok(content.includes('## Architecture Grounding'));
      ok(content.includes('additional-modules/docs/architecture/CONTRACTS_OVERVIEW.md'));
      ok(content.includes('additional-modules/docs/architecture/MODULE_INTERNAL_CONTRACT.md'));
      ok(content.includes('additional-modules/docs/architecture/ARCHITECTURE_GUARDRAILS.md'));
      ok(content.includes('additional-modules/docs/architecture/contracts/moduleAgentStateMachine.contract.md'));
      ok(content.includes('additional-modules/docs/architecture/contracts/planningPhase.contract.md'));
    });
  }
});
