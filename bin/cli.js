#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Colour helpers (no deps — raw ANSI) ────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  white:  '\x1b[37m',
};

const log   = (msg)  => process.stdout.write(msg + '\n');
const ok    = (msg)  => log(`${c.green}✔${c.reset}  ${msg}`);
const skip  = (msg)  => log(`${c.yellow}↷${c.reset}  ${c.dim}${msg}${c.reset}`);
const info  = (msg)  => log(`${c.cyan}ℹ${c.reset}  ${msg}`);
const err   = (msg)  => log(`${c.red}✖${c.reset}  ${msg}`);

// ─── Paths ───────────────────────────────────────────────────────────────────
// __dirname is <package>/bin — package root is one level up
const PKG_ROOT = path.join(__dirname, '..');
const DEST     = process.cwd();

// Guard: refuse to scaffold into the package's own directory
if (path.resolve(DEST) === path.resolve(PKG_ROOT)) {
  err('Run this command inside your project directory, not inside the package itself.');
  process.exit(1);
}

// ─── Files & dirs to scaffold ────────────────────────────────────────────────
const FILES = [
  'CLAUDE.md',
  'progress.md',
];

const DIRS = [
  '.claude',
];

const CREATE_EMPTY = [
  'specs',
];

// ─── Banner ───────────────────────────────────────────────────────────────────
log('');
log(`${c.bold}${c.cyan}  ╔══════════════════════════════════════════════╗${c.reset}`);
log(`${c.bold}${c.cyan}  ║   🔍  create-iris-pipeline  v${require('../package.json').version}           ║${c.reset}`);
log(`${c.bold}${c.cyan}  ║   AIDLC 10/10 — 9 Groups · 52 Sub-Agents    ║${c.reset}`);
log(`${c.bold}${c.cyan}  ╚══════════════════════════════════════════════╝${c.reset}`);
log('');
info(`Scaffolding into: ${c.bold}${DEST}${c.reset}`);
log('');

let copied  = 0;
let skipped = 0;

// ─── Helper: copy a file (skip if exists) ────────────────────────────────────
function copyFile(srcFile, destFile) {
  if (fs.existsSync(destFile)) {
    skip(`Already exists — skipped: ${path.relative(DEST, destFile)}`);
    skipped++;
    return;
  }
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  ok(path.relative(DEST, destFile));
  copied++;
}

// ─── Helper: recursively copy a directory ────────────────────────────────────
function copyDir(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// ─── Copy root files ──────────────────────────────────────────────────────────
for (const file of FILES) {
  const srcFile  = path.join(PKG_ROOT, file);
  const destFile = path.join(DEST, file);
  if (fs.existsSync(srcFile)) {
    copyFile(srcFile, destFile);
  }
}

// ─── Copy directories ─────────────────────────────────────────────────────────
for (const dir of DIRS) {
  const srcDir  = path.join(PKG_ROOT, dir);
  const destDir = path.join(DEST, dir);
  if (fs.existsSync(srcDir)) {
    copyDir(srcDir, destDir);
  }
}

// ─── Create empty dirs ────────────────────────────────────────────────────────
for (const dir of CREATE_EMPTY) {
  const destDir  = path.join(DEST, dir);
  const keepFile = path.join(destDir, '.gitkeep');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(keepFile, '');
    ok(`${dir}/  (created)`);
    copied++;
  } else {
    skip(`${dir}/  (already exists)`);
    skipped++;
  }
}

// ─── Result summary ───────────────────────────────────────────────────────────
log('');
log(`${c.bold}  ─────────────────────────────────────────────${c.reset}`);
log(`${c.green}${c.bold}  ✔ ${copied} file(s) scaffolded${c.reset}${skipped ? `  ${c.dim}(${skipped} skipped — already existed)${c.reset}` : ''}`);
log(`${c.bold}  ─────────────────────────────────────────────${c.reset}`);
log('');
log(`${c.bold}  YOUR AIDLC 10/10 PIPELINE IS READY${c.reset}`);
log('');
log(`  ${c.cyan}9 agent groups installed (52 sub-agents total):${c.reset}`);
log(`    /iris       → Requirements Intelligence        (6 sub-agents)`);
log(`    /sage       → Architecture & Design            (7 sub-agents)`);
log(`    /atlas      → Knowledge & Context              (6 sub-agents)`);
log(`    /forge      → Code Generation & Implementation (8 sub-agents)`);
log(`    /qa         → Quality Assurance Execution      (6 sub-agents)`);
log(`    /sentinel   → Security & Compliance            (8 sub-agents)`);
log(`    /conductor  → Deployment & Orchestration       (8 sub-agents)`);
log(`    /guardian   → Monitoring & Incident Response   (8 sub-agents)`);
log(`    /mlops      → ML & Data Operations             (5 sub-agents)`);
log('');
log(`  ${c.cyan}Next steps:${c.reset}`);
log(`    1. Open this project in ${c.bold}Claude Code${c.reset}`);
log(`    2. Claude will auto-read ${c.bold}CLAUDE.md${c.reset} on session start`);
log(`    3. Paste your customer feedback and run ${c.bold}/iris${c.reset}`);
log('');
log(`  ${c.dim}Run order:  IRIS → SAGE → FORGE → QA → SENTINEL → CONDUCTOR → GUARDIAN${c.reset}`);
log('');
