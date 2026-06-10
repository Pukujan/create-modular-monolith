#!/usr/bin/env node
import { mkdir, readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { validatePackage, extractContracts, generatePhaseInput } from '../lib/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REQUIRED_OUTPUTS = [
  'ui-contract.json',
  'api-contract.json',
  'handoff-contract.md',
  'allowed-files.json',
  'no-drift.rules.md',
  'phase-input.json',
  'contract-report.json'
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.package || !args.out) {
    throw new Error('Usage: node ui-handoff-contract.js --package <path> --out <path>');
  }

  const report = await runContractPipeline(args.package, args.out);
  if (!report.accepted) {
    throw new Error(report.errors.join('\n'));
  }

  for (const file of REQUIRED_OUTPUTS) {
    const target = join(args.out, file);
    const content = await readFile(target, 'utf8').catch(() => null);
    if (content == null) {
      throw new Error(`Missing output: ${file}`);
    }
  }
}

async function runContractPipeline(packagePath, outDir) {
  await mkdir(outDir, { recursive: true });

  const validation = await validatePackage(packagePath);
  const report = {
    accepted: validation.ok,
    packageName: basename(packagePath),
    errors: validation.errors,
    requiredFiles: validation.requiredFiles,
    generatedFiles: REQUIRED_OUTPUTS
  };

  if (!validation.ok) {
    await writeFile(join(outDir, 'contract-report.json'), JSON.stringify(report, null, 2));
    return report;
  }

  const contracts = await extractContracts(packagePath, validation);
  const phaseInput = generatePhaseInput(contracts);

  await writeFile(join(outDir, 'ui-contract.json'), JSON.stringify(contracts.uiContract, null, 2));
  await writeFile(join(outDir, 'api-contract.json'), JSON.stringify(contracts.apiContract, null, 2));
  await writeFile(join(outDir, 'handoff-contract.md'), contracts.handoffContractMd);
  await writeFile(join(outDir, 'allowed-files.json'), JSON.stringify(contracts.allowedFiles, null, 2));
  await writeFile(join(outDir, 'no-drift.rules.md'), contracts.noDriftRulesMd);
  await writeFile(join(outDir, 'phase-input.json'), JSON.stringify(phaseInput, null, 2));
  await writeFile(join(outDir, 'contract-report.json'), JSON.stringify(report, null, 2));

  return report;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--package') out.package = next;
    if (arg === '--out') out.out = next;
  }
  return out;
}
