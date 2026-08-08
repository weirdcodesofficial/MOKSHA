#!/usr/bin/env node
/**
 * replace-nonenglish.js
 *
 * Usage:
 *  node scripts/replace-nonenglish.js            # dry-run, lists candidate files and sample diffs
 *  node scripts/replace-nonenglish.js --apply    # actually write changes
 *  node scripts/replace-nonenglish.js --apply --commit --branch replace-nonenglish-text --message "Replace non-English tokens"
 *  node scripts/replace-nonenglish.js --apply --commit --push
 *
 * Notes:
 * - Skips node_modules, .git, dist, build by default.
 * - Targets common text file extensions.
 * - Removes Unicode diacritics (NFD -> strip combining marks -> NFC).
 * - Applies mapping table (customize `mapping` below).
 */

const fs = require('fs');
const path = require('path');
const child = require('child_process');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const COMMIT = args.includes('--commit');
const PUSH = args.includes('--push');
const BRANCH = (args.find(a => a.startsWith('--branch=')) || '--branch=replace-nonenglish-text').split('=')[1];
const MESSAGE = (args.find(a => a.startsWith('--message=')) || '--message=Replace non-English tokens').split('=')[1];

const exts = new Set([
  '.js','.jsx','.ts','.tsx','.html','.htm','.css','.scss','.md','.markdown',
  '.json','.yml','.yaml','.txt','.vue','.py','.java','.c','.cpp','.h','.cs','.xml','.svg','.html'
]);

const excludeDirs = new Set(['node_modules', '.git', 'dist', 'build', 'vendor', '.next', 'out']);

const mapping = {
  // Add or edit mappings here. Use exact tokens with diacritics as keys.
  'Name': 'Name',
  'name': 'name'
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBinaryFile(buf) {
  for (let i = 0; i < Math.min(buf.length, 512); i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (excludeDirs.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function previewDiff(orig, updated) {
  const origLines = orig.split(/\r?\n/);
  const updLines = updated.split(/\r?\n/);
  // find first differing line
  let i = 0;
  while (i < origLines.length && i < updLines.length && origLines[i] === updLines[i]) i++;
  const start = Math.max(0, i - 3);
  const end = Math.min(origLines.length, i + 3);
  const context = [];
  for (let j = start; j < end; j++) {
    const o = origLines[j] || '';
    const u = updLines[j] || '';
    if (o === u) context.push('  ' + o);
    else {
      context.push('- ' + o);
      context.push('+ ' + u);
    }
  }
  return context.join('\n');
}

const repoRoot = process.cwd();
const candidates = [];

walk(repoRoot, (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!exts.has(ext)) return;
  try {
    const buf = fs.readFileSync(filePath);
    if (isBinaryFile(buf)) return;
    const content = buf.toString('utf8');
    if (!/[^\x00-\x7F]/.test(content)) return; // no non-ascii -> skip
    candidates.push({ filePath, content });
  } catch (err) {
    // ignore unreadable files
  }
});

if (candidates.length === 0) {
  console.log('No candidate files with non-ASCII characters found in the scanned paths.');
  process.exit(0);
}

const changes = [];

for (const c of candidates) {
  let newContent = c.content;

  // First apply explicit mapping on original content
  for (const [k,v] of Object.entries(mapping)) {
    const re = new RegExp('\\b' + escapeRegExp(k) + '\\b', 'g');
    newContent = newContent.replace(re, v);
  }

  // Then remove diacritics
  try {
    newContent = newContent.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
  } catch (e) {
    // Fallback if environment doesn't support \p{M}
    newContent = newContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  }

  // Apply mapping again in case the normalized form should be mapped (e.g., Name -> Name -> Name)
  for (const [k,v] of Object.entries(mapping)) {
    const plainKey = k.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
    const re = new RegExp('\\b' + escapeRegExp(plainKey) + '\\b', 'g');
    newContent = newContent.replace(re, v);
  }

  if (newContent !== c.content) {
    changes.push({
      path: path.relative(repoRoot, c.filePath),
      before: c.content,
      after: newContent
    });
  }
}

if (changes.length === 0) {
  console.log('No replacements would be made after normalization and mapping.');
  process.exit(0);
}

console.log(`Found ${changes.length} files with changes.\n`);

for (const ch of changes) {
  console.log('===', ch.path);
  console.log(previewDiff(ch.before, ch.after));
  console.log('---\n');
}

if (!APPLY) {
  console.log('Dry-run only. Re-run with --apply to write changes.');
  process.exit(0);
}

// Write files
for (const ch of changes) {
  fs.writeFileSync(path.join(repoRoot, ch.path), ch.after, 'utf8');
}

console.log(`Wrote ${changes.length} files.`);

// Optional git commit
function run(cmd) {
  try {
    return child.execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

if (COMMIT) {
  // ensure inside git repo
  const insideGit = run('git rev-parse --is-inside-work-tree');
  if (!insideGit) {
    console.warn('Not inside a git repository; skipping commit.');
    process.exit(0);
  }
  // create branch
  run(`git checkout -b ${BRANCH}`);
  run('git add .');
  run(`git commit -m "${MESSAGE.replace(/"/g, '\\"')}"`);
  console.log(`Committed changes on branch ${BRANCH}.`);
  if (PUSH) {
    run(`git push -u origin ${BRANCH}`);
    console.log(`Pushed branch ${BRANCH} to origin.`);
  }
}

console.log('Done.');