#!/usr/bin/env node
// ============================================================================
// validate-content.js — schema validation for all unit content files, plus
// compile-and-run verification of every `code` exercise (g++ required for
// that part; skipped gracefully if missing).
//
// Usage: node tests/validate-content.js [--no-compile] [u01 u02 ...]
// ============================================================================
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const noCompile = args.includes('--no-compile');
const onlyUnits = args.filter((a) => /^u\d\d$/.test(a));

const { UNITS } = await import(pathToFileURL(join(ROOT, 'data/curriculum.js')));

let errors = [];
let warnings = [];
let stats = { skills: 0, exercises: 0, theory: 0, problems: 0, codeChecked: 0, byType: {} };

const TYPES = ['mcq', 'tf', 'multi', 'fill', 'output', 'parsons', 'order', 'bank', 'match', 'code'];

function err(loc, msg) { errors.push(`✗ ${loc}: ${msg}`); }
function warn(loc, msg) { warnings.push(`⚠ ${loc}: ${msg}`); }

function hasGpp() {
  try { execFileSync('g++', ['--version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
}
const gpp = !noCompile && hasGpp();

function normalizeOutput(s) {
  return String(s ?? '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
}

function checkCodeExercise(loc, ex, tmp) {
  const src = join(tmp, 'sol.cpp');
  const bin = join(tmp, 'sol');
  writeFileSync(src, ex.solution);
  const compile = spawnSync('g++', ['-O2', '-std=c++17', '-o', bin, src], { encoding: 'utf8', timeout: 30000 });
  if (compile.status !== 0) {
    err(loc, `solution does not compile:\n${(compile.stderr || '').slice(0, 500)}`);
    return;
  }
  for (let i = 0; i < ex.tests.length; i++) {
    const t = ex.tests[i];
    const run = spawnSync(bin, [], { input: t.input ?? '', encoding: 'utf8', timeout: 5000 });
    if (run.status !== 0) {
      err(loc, `solution crashed on test ${i + 1} (exit ${run.status})`);
      continue;
    }
    if (normalizeOutput(run.stdout) !== normalizeOutput(t.expected)) {
      err(loc, `solution output mismatch on test ${i + 1}: expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(run.stdout.trim())}`);
    }
  }
  stats.codeChecked++;
}

function validateExercise(loc, ex, seenIds, tmp) {
  if (!ex.id) err(loc, 'missing id');
  else if (seenIds.has(ex.id)) err(loc, `duplicate exercise id "${ex.id}"`);
  else seenIds.add(ex.id);

  if (!TYPES.includes(ex.type)) { err(loc, `unknown type "${ex.type}"`); return; }
  stats.byType[ex.type] = (stats.byType[ex.type] ?? 0) + 1;

  if (![1, 2, 3].includes(ex.diff)) err(loc, `diff must be 1|2|3 (got ${ex.diff})`);
  if (ex.type !== 'tf' && !ex.prompt) err(loc, 'missing prompt');
  if (!ex.explain || ex.explain.length < 20) err(loc, 'explain missing or too short (<20 chars) — elaborated feedback is required');

  switch (ex.type) {
    case 'mcq': {
      if (!Array.isArray(ex.options) || ex.options.length < 2 || ex.options.length > 5) err(loc, 'mcq needs 2-5 options');
      else if (!Number.isInteger(ex.answer) || ex.answer < 0 || ex.answer >= ex.options.length) err(loc, `mcq answer index out of range (${ex.answer})`);
      if (Array.isArray(ex.options) && new Set(ex.options.map(String)).size !== ex.options.length) err(loc, 'mcq has duplicate options');
      break;
    }
    case 'tf': {
      if (!ex.statement && !ex.prompt) err(loc, 'tf needs statement or prompt');
      if (typeof ex.answer !== 'boolean') err(loc, 'tf answer must be boolean');
      break;
    }
    case 'multi': {
      if (!Array.isArray(ex.options) || ex.options.length < 3) err(loc, 'multi needs ≥3 options');
      if (!Array.isArray(ex.answers) || ex.answers.length < 1) err(loc, 'multi needs ≥1 answers');
      else if (ex.answers.some((a) => !Number.isInteger(a) || a < 0 || a >= (ex.options?.length ?? 0))) err(loc, 'multi answers out of range');
      break;
    }
    case 'fill': {
      const ok = typeof ex.answer === 'string' || (Array.isArray(ex.answer) && ex.answer.every((a) => typeof a === 'string') && ex.answer.length);
      if (!ok) err(loc, 'fill answer must be string or string[]');
      break;
    }
    case 'output': {
      if (!ex.code) err(loc, 'output needs code');
      if (typeof ex.answer !== 'string' || !ex.answer.length) err(loc, 'output answer must be a non-empty string');
      break;
    }
    case 'parsons': {
      if (!Array.isArray(ex.lines) || ex.lines.length < 3) err(loc, 'parsons needs ≥3 lines');
      if (ex.lines && new Set(ex.lines).size !== ex.lines.length) warn(loc, 'parsons has duplicate lines (ambiguous ordering will be marked wrong)');
      if (ex.distractors && ex.lines && ex.distractors.some((d) => ex.lines.includes(d))) err(loc, 'parsons distractor duplicates a real line');
      break;
    }
    case 'order': {
      if (!Array.isArray(ex.items) || ex.items.length < 3) err(loc, 'order needs ≥3 items');
      if (ex.items && new Set(ex.items).size !== ex.items.length) err(loc, 'order has duplicate items');
      break;
    }
    case 'bank': {
      if (!ex.code || !ex.code.includes('___')) { err(loc, 'bank needs code with ___ slots'); break; }
      const slots = (ex.code.match(/___/g) ?? []).length;
      if (!Array.isArray(ex.answer) || ex.answer.length !== slots) err(loc, `bank answer length (${ex.answer?.length}) ≠ slot count (${slots})`);
      break;
    }
    case 'match': {
      if (!Array.isArray(ex.pairs) || ex.pairs.length < 3 || ex.pairs.length > 6) err(loc, 'match needs 3-6 pairs');
      else if (ex.pairs.some((p) => !Array.isArray(p) || p.length !== 2)) err(loc, 'match pairs must be [left, right]');
      else {
        const lefts = ex.pairs.map((p) => p[0]), rights = ex.pairs.map((p) => p[1]);
        if (new Set(lefts).size !== lefts.length || new Set(rights).size !== rights.length) err(loc, 'match has duplicate left or right values (ambiguous)');
      }
      break;
    }
    case 'code': {
      if (!ex.starter) err(loc, 'code needs starter');
      if (!ex.solution) err(loc, 'code needs solution');
      if (!Array.isArray(ex.tests) || ex.tests.length < 2) err(loc, 'code needs ≥2 tests');
      else if (ex.tests.some((t) => typeof t.expected !== 'string')) err(loc, 'code tests need expected strings');
      else if (gpp && ex.solution) checkCodeExercise(loc, ex, tmp);
      break;
    }
  }
}

function validateSkill(unitId, skillId, skill, tmp) {
  const loc = `${unitId}/${skillId}`;
  stats.skills++;

  if (!Array.isArray(skill.objectives) || skill.objectives.length < 2) warn(loc, 'objectives should list 2+ goals');

  if (!Array.isArray(skill.theory) || skill.theory.length < 3 || skill.theory.length > 8) {
    err(loc, `theory must have 3-8 cards (got ${skill.theory?.length ?? 0})`);
  } else {
    skill.theory.forEach((c, i) => {
      if (!c.h) err(`${loc}/theory[${i}]`, 'missing heading h');
      if (!c.md || c.md.length < 30) err(`${loc}/theory[${i}]`, 'md missing or too short');
      stats.theory++;
    });
  }

  if (!Array.isArray(skill.exercises) || skill.exercises.length < 8) {
    err(loc, `needs ≥8 exercises (got ${skill.exercises?.length ?? 0})`);
  }
  const seenIds = new Set();
  const types = new Set();
  const diffs = new Set();
  for (let i = 0; i < (skill.exercises?.length ?? 0); i++) {
    const ex = skill.exercises[i];
    validateExercise(`${loc}/ex[${ex.id ?? i}]`, ex, seenIds, tmp);
    types.add(ex.type);
    diffs.add(ex.diff);
    stats.exercises++;
  }
  if (types.size < 4) warn(loc, `only ${types.size} exercise types — aim for ≥4 (variety drives engagement)`);
  if (!(diffs.has(1) && diffs.has(2) && diffs.has(3))) warn(loc, `difficulty spread incomplete (${[...diffs].join(',')}) — need 1, 2 and 3`);

  if (!Array.isArray(skill.problems) || skill.problems.length < 2) {
    warn(loc, `should list ≥2 external problems (got ${skill.problems?.length ?? 0})`);
  } else {
    for (const p of skill.problems) {
      if (!p.name || !p.platform || !p.url) err(loc, `problem entry incomplete: ${JSON.stringify(p).slice(0, 80)}`);
      if (!['intro', 'easy', 'med', 'hard'].includes(p.difficulty)) err(loc, `problem "${p.name}" difficulty must be intro|easy|med|hard`);
      if (p.url && !/^https?:\/\//.test(p.url)) err(loc, `problem "${p.name}" url invalid`);
      stats.problems++;
    }
  }
}

// ---------------------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'sauce-validate-'));
let unitsChecked = 0;

for (const unit of UNITS) {
  if (onlyUnits.length && !onlyUnits.includes(unit.id)) continue;
  let mod;
  try {
    mod = await import(pathToFileURL(join(ROOT, `data/units/${unit.id}.js`)));
  } catch (e) {
    err(unit.id, `cannot load content file: ${e.message.split('\n')[0]}`);
    continue;
  }
  unitsChecked++;
  const SKILLS = mod.SKILLS;
  if (!SKILLS) { err(unit.id, 'no SKILLS export'); continue; }

  for (const s of unit.skills) {
    if (!SKILLS[s.id]) { err(unit.id, `missing content for skill "${s.id}"`); continue; }
    validateSkill(unit.id, s.id, SKILLS[s.id], tmp);
  }
  for (const key of Object.keys(SKILLS)) {
    if (!unit.skills.some((s) => s.id === key)) warn(unit.id, `content for unknown skill "${key}" (not in curriculum)`);
  }
}

rmSync(tmp, { recursive: true, force: true });

// ---------------------------------------------------------------------------
console.log(`\n📦 Units checked: ${unitsChecked}   skills: ${stats.skills}   theory cards: ${stats.theory}   exercises: ${stats.exercises}   problems: ${stats.problems}`);
console.log(`🧪 code exercises compiled+tested: ${stats.codeChecked}${gpp ? '' : ' (g++ unavailable or --no-compile: skipped)'}`);
console.log(`🎛  exercise types: ${Object.entries(stats.byType).map(([t, n]) => `${t}:${n}`).join('  ')}`);

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warnings:`);
  for (const w of warnings) console.log('  ' + w);
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} errors:`);
  for (const e of errors) console.log('  ' + e);
  process.exit(1);
}
console.log('\n✅ content valid');
