import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { resolve, relative } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

async function copyFileWithSubstitution(src, dest, rootDir, vars) {
  const content = await readFile(src, 'utf8');
  const substituted = content.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] || match);
  await writeFile(dest, substituted);
  log(`  ✓ ${relative(rootDir, dest)}`);
}

async function copyDir(src, dest, rootDir, vars = {}) {
  const { readdir } = await import('fs/promises');
  
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, rootDir, vars);
    } else if (entry.name.endsWith('.template') || entry.name.includes('.template.')) {
      const destName = entry.name.replace('.template', '').replace('.template.', '.');
      const cleanDest = resolve(dest, destName);
      await copyFileWithSubstitution(srcPath, cleanDest, rootDir, vars);
    } else {
      await copyFile(srcPath, destPath);
      log(`  ✓ ${relative(rootDir, destPath)}`);
    }
  }
}

function log(msg) {
  process.stdout.write(msg + '\n');
}

async function checkDir(dir, name) {
  if (existsSync(dir)) {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(dir);
    if (entries.length > 0) {
      log(`\n⚠ ${name} already exists and has files. Skipping.`);
      return false;
    }
  }
  return true;
}

function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    return { branch, commit };
  } catch {
    return { branch: 'main', commit: 'unknown' };
  }
}

async function init(projectRoot, templatesRoot, buildplanRoot, phaseBuilderRoot, workLogRoot, options = {}) {
  log('🚀 Initializing context engineering...\n');

  const { branch, commit } = getGitInfo();
  const today = new Date().toISOString().split('T')[0];

  const vars = {
    DATE: today,
    BRANCH: branch,
    COMMIT: commit,
    TOKEN_LIMIT: '35,000'
  };

  const additionalModules = resolve(projectRoot, 'additional-modules');

  // Buildplan
  const buildplanDir = resolve(additionalModules, 'buildplan');
  if (await checkDir(buildplanDir, 'additional-modules/buildplan/')) {
    log('Setting up additional-modules/buildplan/');
    await copyDir(buildplanRoot, buildplanDir, additionalModules, vars);
    log('');
  }

  // Scripts
  const scriptsDir = resolve(additionalModules, 'scripts');
  if (await checkDir(scriptsDir, 'additional-modules/scripts/')) {
    log('Setting up additional-modules/scripts/');
    await copyDir(resolve(templatesRoot, 'scripts'), scriptsDir, additionalModules);
    log('');
  }

  // Work-log
  const workLogDir = resolve(additionalModules, 'work-log');
  if (await checkDir(workLogDir, 'additional-modules/work-log/')) {
    log('Setting up additional-modules/work-log/');
    await copyDir(workLogRoot, workLogDir, additionalModules);
    log('');
  }

  // AGENTS.md (project root)
  const agentsMd = resolve(projectRoot, 'AGENTS.md');
  if (!existsSync(agentsMd)) {
    const template = await readFile(resolve(templatesRoot, 'AGENTS.md.template'), 'utf8');
    await writeFile(agentsMd, template);
    log(`  ✓ AGENTS.md`);
    log('');
  } else {
    log('⚠ AGENTS.md already exists. Run with --force to overwrite.');
    log('');
  }

  // MEMORY.md (project root)
  const memoryMd = resolve(projectRoot, 'MEMORY.md');
  if (!existsSync(memoryMd)) {
    const template = await readFile(resolve(templatesRoot, 'MEMORY.md.template'), 'utf8');
    const substituted = template.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] || match);
    await writeFile(memoryMd, substituted);
    log(`  ✓ MEMORY.md`);
    log('');
  } else {
    log('⚠ MEMORY.md already exists. Run with --force to overwrite.');
    log('');
  }

  // Phase builder addon (optional)
  if (options.phaseBuilder && phaseBuilderRoot && existsSync(phaseBuilderRoot)) {
    log('Setting up phase_builder/');
    await copyDir(phaseBuilderRoot, resolve(additionalModules, 'phase_builder'), additionalModules);
    log('');
  } else if (options.phaseBuilder) {
    log('⚠ phase_builder not available — skipping.');
    log('');
  }

  log('✅ Context engineering initialized!\n');
  log('Next steps:');
  log('  1. Run: python additional-modules/scripts/measure_context.py --tokens 0 --start-session');
  log('  2. Edit additional-modules/buildplan/agent_state.json for your project state');
  log('  3. Run: python additional-modules/scripts/render_memory.py to regenerate MEMORY.md');
  if (options.phaseBuilder) {
    log('  4. cd additional-modules/phase_builder && .venv/bin/pytest to run phase builder tests');
  }
}

export { init };
