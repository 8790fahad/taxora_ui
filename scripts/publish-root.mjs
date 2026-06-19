#!/usr/bin/env node
/**
 * Build and copy dist/ to the repository root for GitHub Pages (main / root).
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');

const rootTargets = ['index.html', '404.html', 'CNAME', '.nojekyll'];
const rootDirs = ['assets', 'brand'];

execSync('npm run build', { cwd: repoRoot, stdio: 'inherit' });

if (!existsSync(distDir)) {
  console.error('dist/ not found after build');
  process.exit(1);
}

for (const file of rootTargets) {
  const src = join(distDir, file);
  if (existsSync(src)) {
    cpSync(src, join(repoRoot, file));
  }
}

for (const dir of rootDirs) {
  const src = join(distDir, dir);
  const dest = join(repoRoot, dir);
  if (existsSync(src)) {
    rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
  }
}

// Keep docs/ in sync for anyone using main /docs as the Pages folder.
const docsDir = join(repoRoot, 'docs');
rmSync(docsDir, { recursive: true, force: true });
cpSync(distDir, docsDir, { recursive: true });

console.log('Published production build to repository root (and docs/).');
