#!/usr/bin/env node
/**
 * Force-push only dist/ to the gh-pages branch (replaces branch contents).
 * Run `npm run build` first (predeploy does this automatically).
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'taxora-gh-pages-'));

try {
  cpSync(distDir, tmp, { recursive: true });

  execSync('git init', { cwd: tmp, stdio: 'inherit' });
  execSync('git checkout -b gh-pages', { cwd: tmp, stdio: 'inherit' });
  execSync('git add -A', { cwd: tmp, stdio: 'inherit' });
  execSync('git -c user.email=deploy@taxora.com.ng -c "user.name=Taxora Deploy" commit -m "Deploy production build"', {
    cwd: tmp,
    stdio: 'inherit',
  });

  const remote = execSync('git remote get-url origin', {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
  execSync(`git push -f ${remote} gh-pages`, { cwd: tmp, stdio: 'inherit' });

  console.log('Published clean gh-pages branch from dist/');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
