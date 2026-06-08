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

async function init(projectRoot, templatesRoot, phaseBuilderRoot, options = {}) {
  log('🚀 Initializing context engineering...\n');
  
  const { branch, commit } = getGitInfo();
  const today = new Date().toISOString().split('T')[0];
  
  const vars = {
    DATE: today,
    BRANCH: branch,
    COMMIT: commit,
    TOKEN_LIMIT: '35,000'
  };
  
  // Buildplan
  const buildplanDir = resolve(projectRoot, 'buildplan');
  if (await checkDir(buildplanDir, 'buildplan/')) {
    log('Setting up buildplan/');
    await copyDir(resolve(templatesRoot, 'buildplan'), buildplanDir, projectRoot, vars);
    log('');
  }
  
  // Scripts
  const scriptsDir = resolve(projectRoot, 'scripts');
  if (await checkDir(scriptsDir, 'scripts/')) {
    log('Setting up scripts/');
    await copyDir(resolve(templatesRoot, 'scripts'), scriptsDir, projectRoot);
    log('');
  }
  
  // Work-log
  const workLogDir = resolve(projectRoot, 'work-log');
  if (await checkDir(workLogDir, 'work-log/')) {
    log('Setting up work-log/');
    await copyDir(resolve(templatesRoot, 'work-log'), workLogDir, projectRoot);
    log('');
  }
  
  // AGENTS.md
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
  
  // MEMORY.md
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
  if (options.phaseBuilder && phaseBuilderRoot) {
    log('Setting up phase_builder/');
    await copyDir(phaseBuilderRoot, resolve(projectRoot, 'phase_builder'), projectRoot);
    log('');
  }
  
  log('✅ Context engineering initialized!\n');
  log('Next steps:');
  log('  1. Run: python scripts/measure_context.py --tokens 0 --start-session');
  log('  2. Edit buildplan/agent_state.json for your project state');
  log('  3. Run: python scripts/render_memory.py to regenerate MEMORY.md');
  if (options.phaseBuilder) {
    log('  4. cd phase_builder && .venv/bin/pytest to run phase builder tests');
  }
}

export { init };
