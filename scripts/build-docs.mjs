#!/usr/bin/env node
/**
 * Build and copy dist/ → docs/ for GitHub Pages (main branch, /docs folder).
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');
const docsDir = join(repoRoot, 'docs');

execSync('npm run build', { cwd: repoRoot, stdio: 'inherit' });

if (!existsSync(distDir)) {
  console.error('dist/ not found after build');
  process.exit(1);
}

rmSync(docsDir, { recursive: true, force: true });
cpSync(distDir, docsDir, { recursive: true });
console.log('Built site copied to docs/ — commit and push, then set Pages to main /docs');
