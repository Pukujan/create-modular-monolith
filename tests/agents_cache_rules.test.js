import { describe, it } from 'node:test';
import { ok } from 'node:assert';
import { readFile } from 'fs/promises';

const AGENT_FILES = [
  'AGENTS.md',
  'additional-modules/context-engineering/templates/AGENTS.md.template'
];

describe('AGENTS.md cache governance contract', () => {
  for (const file of AGENT_FILES) {
    it(`${file} defines stable prompt-prefix rules`, async () => {
      const content = await readFile(file, 'utf8');

      ok(content.includes('## Cache-Stable Prompt Rules'));
      ok(content.includes('Keep stable project rules and architecture grounding above volatile task details.'));
      ok(content.includes('Do not place timestamps, token counts, random IDs, branch names, commit hashes, command output, or generated status blocks before stable instructions.'));
      ok(content.includes('Keep normal requests under 8k tokens and debug/error-log requests under 12k tokens whenever possible.'));
      ok(content.includes('Read the minimum files needed for the current phase; summarize old state instead of repasting it.'));
      ok(content.includes('Put changing task details, logs, file excerpts, and test output near the bottom of prompts or handoffs.'));
    });
  }
});
