#!/usr/bin/env node
// ============================================================================
// widgets.test.mjs — renders and interacts with every exercise widget type
// in a real browser: answer correctly, answer wrongly, and verify verdicts.
// Run: PLAYWRIGHT_BROWSERS_PATH=... node tests/widgets.test.mjs
// ============================================================================
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const data = await readFile(join(ROOT, p));
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'text/plain' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}`); }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
// skip onboarding so its fixed overlay can't intercept widget clicks
await page.addInitScript(() => {
  const s = { v: 1, onboarded: true, profile: { name: 'w', emoji: '🧪', dailyGoal: 50, theme: 'dark', sound: false, createdAt: '2026-01-01', pistonUrl: '' }, xp: { total: 0 }, streak: { current: 0, best: 0, lastDay: '', freezes: 0, freezeEarnedAt: 0 }, mastery: {}, srs: {}, missed: {}, problems: {}, badges: {}, unitTests: {}, activity: {}, exStats: { attempts: 0, correct: 0, byType: {} }, sessionsCount: 0 };
  localStorage.setItem('sauce-academy-v1', JSON.stringify(s));
});
await page.goto(BASE, { waitUntil: 'networkidle' });
// isolate the harness: clear the app UI so nothing overlaps
await page.evaluate(() => { document.getElementById('app').style.display = 'none'; });

// Harness: render an exercise into a fresh container, return a handle API.
await page.evaluate(() => {
  window.__harness = (async () => {
    const ex = await import('./src/exercises.js');
    return {
      render(exercise) {
        document.querySelector('#wtest')?.remove();
        const host = document.createElement('div');
        host.id = 'wtest';
        document.body.append(host);
        window.__ready = false;
        window.__ctl = ex.renderExercise(host, exercise, { setReady: (v) => { window.__ready = v; } });
        return true;
      },
      check() { return window.__ctl.check(); },
    };
  })();
});

async function render(exercise) {
  return page.evaluate(async (e) => { const h = await window.__harness; return h.render(e); }, exercise);
}
async function verdict() {
  return page.evaluate(async () => (await window.__harness).check());
}
async function ready() {
  return page.evaluate(() => window.__ready);
}

console.log('\n— mcq —');
const mcq = { id: 't1', type: 'mcq', diff: 1, prompt: 'Pick **A**', options: ['A', 'B', 'C'], answer: 0, explain: 'A is the answer because the prompt says so.' };
await render(mcq);
check('not ready before selection', !(await ready()));
// find the button whose text is exactly the right answer (options are shuffled)
await page.locator('#wtest .opt', { hasText: 'A' }).first().click();
check('ready after selection', await ready());
check('correct verdict', (await verdict()).correct === true);
await render(mcq);
await page.locator('#wtest .opt', { hasText: 'B' }).click();
check('wrong verdict', (await verdict()).correct === false);
check('correct option revealed on wrong', (await page.locator('#wtest .opt.correct').count()) === 1);

console.log('\n— tf —');
await render({ id: 't2', type: 'tf', diff: 1, statement: 'True is true', answer: true, explain: 'Yes, tautologically true indeed.' });
await page.locator('#wtest .opt', { hasText: 'True' }).click();
check('tf correct', (await verdict()).correct === true);

console.log('\n— multi —');
const multi = { id: 't3', type: 'multi', diff: 2, prompt: 'Pick A and C', options: ['A', 'B', 'C'], answers: [0, 2], explain: 'A and C were requested explicitly.' };
await render(multi);
await page.locator('#wtest .opt', { hasText: 'A' }).click();
await page.locator('#wtest .opt', { hasText: 'C' }).click();
check('multi correct', (await verdict()).correct === true);
await render(multi);
await page.locator('#wtest .opt', { hasText: 'A' }).click();
await page.locator('#wtest .opt', { hasText: 'B' }).click();
check('multi wrong on bad subset', (await verdict()).correct === false);

console.log('\n— fill —');
await render({ id: 't4', type: 'fill', diff: 2, prompt: 'Type `(ll)h`', answer: ['(ll)h', '(long long)h'], explain: 'Casting promotes the multiplication width.' });
await page.fill('#wtest input', '  (LL) h ');
check('fill ready on text', await ready());
check('fill forgiving match', (await verdict()).correct === true);

console.log('\n— output —');
await render({ id: 't5', type: 'output', diff: 1, prompt: 'Output?', code: 'cout << 1 << "\\n" << 2;', answer: '1\n2', explain: 'Two lines: 1 then 2, obviously.' });
await page.fill('#wtest textarea, #wtest input', '1\n2');
check('output multiline correct', (await verdict()).correct === true);

console.log('\n— parsons (click to place) —');
const parsons = { id: 't6', type: 'parsons', diff: 2, prompt: 'Order: A then B then C', lines: ['lineA();', 'lineB();', 'lineC();'], distractors: ['trap();'], explain: 'Alphabetical calls, the trap stays out.' };
await render(parsons);
for (const t of ['lineA();', 'lineB();', 'lineC();']) {
  await page.locator('#wtest .parsons-bank .p-line', { hasText: t.slice(0, 5) }).click();
}
check('parsons ready when 3 placed', await ready());
check('parsons correct order', (await verdict()).correct === true);
await render(parsons);
for (const t of ['lineB();', 'lineA();', 'lineC();']) {
  await page.locator('#wtest .parsons-bank .p-line', { hasText: t.slice(0, 5) }).click();
}
check('parsons wrong order detected', (await verdict()).correct === false);
check('misplaced lines highlighted', (await page.locator('#wtest .p-line.misplaced').count()) >= 1);

console.log('\n— order —');
await render({ id: 't7', type: 'order', diff: 1, prompt: 'Smallest complexity first', items: ['O(1)', 'O(n)', 'O(n²)'], explain: 'Constant beats linear beats quadratic growth.' });
for (const t of ['O(1)', 'O(n)', 'O(n²)']) {
  await page.locator('#wtest .parsons-bank .p-line', { hasText: t }).click();
}
check('order correct', (await verdict()).correct === true);

console.log('\n— bank (token fill) —');
const bank = { id: 't8', type: 'bank', diff: 2, prompt: 'Complete it', code: 'ios::___(false);\ncin.___(nullptr);', answer: ['sync_with_stdio', 'tie'], distractors: ['flush'], explain: 'The classic fast-IO pair of calls.' };
await render(bank);
await page.locator('#wtest .btn', { hasText: 'sync_with_stdio' }).click();
await page.locator('#wtest .btn', { hasText: /^tie$/ }).click();
check('bank ready when slots filled', await ready());
check('bank correct', (await verdict()).correct === true);
await render(bank);
await page.locator('#wtest .btn', { hasText: 'flush' }).click();
await page.locator('#wtest .btn', { hasText: 'sync_with_stdio' }).click();
check('bank wrong tokens detected', (await verdict()).correct === false);

console.log('\n— typein (type into code blanks) —');
const typein = {
  id: 't8b', type: 'typein', diff: 2, prompt: 'Type the missing code',
  code: 'for (int i = 0; ___; i++) {\n    sum += ___;\n}',
  answer: [['i < n', 'i<n'], 'a[i]'],
  explain: 'Loop bound and the element access, typed from memory.',
};
await render(typein);
check('typein not ready while blanks empty', !(await ready()));
await page.fill('#wtest .typein-input >> nth=0', 'i  <  n');   // whitespace-forgiving
await page.fill('#wtest .typein-input >> nth=1', 'a[i]');
check('typein ready when all filled', await ready());
check('typein correct (whitespace-forgiving)', (await verdict()).correct === true);
await render(typein);
await page.fill('#wtest .typein-input >> nth=0', 'i <= n');     // real off-by-one
await page.fill('#wtest .typein-input >> nth=1', 'a[i]');
check('typein wrong detected', (await verdict()).correct === false);
check('wrong slot highlighted', (await page.locator('#wtest .typein-input.wrong').count()) === 1);
await render(typein);
await page.fill('#wtest .typein-input >> nth=0', 'I < N');      // case must matter
await page.fill('#wtest .typein-input >> nth=1', 'a[i]');
check('typein is case-sensitive', (await verdict()).correct === false);

console.log('\n— match —');
const match = { id: 't9', type: 'match', diff: 1, prompt: 'Match them', pairs: [['AC', 'accepted'], ['WA', 'wrong'], ['TLE', 'slow']], explain: 'Verdict vocabulary, the bread and butter.' };
await render(match);
for (const [l, r] of match.pairs) {
  await page.locator('#wtest .opt', { hasText: new RegExp(`^${l}$`) }).click();
  await page.locator('#wtest .opt', { hasText: new RegExp(`^${r}$`) }).click();
}
check('match completes ready', await ready());
check('match perfect = correct', (await verdict()).correct === true);

console.log('\n— code (self-check path) —');
await render({
  id: 't10', type: 'code', diff: 3, prompt: 'Write anything',
  starter: '#include <bits/stdc++.h>\nint main(){return 0;}',
  tests: [{ input: '', expected: '' }, { input: '1', expected: '' }],
  solution: '#include <bits/stdc++.h>\nint main(){return 0;}',
  explain: 'The self-check path lets honest humans grade offline.',
});
await page.locator('#wtest .btn', { hasText: 'Compare with solution' }).click();
await page.locator('#wtest .btn', { hasText: /^Yes$/ }).click();
check('code self-check ready', await ready());
check('code self-verdict honored', (await verdict()).correct === true);
check('solution shown', (await page.locator('#wtest .code-solution').count()) === 1);

console.log('\n— console hygiene —');
check(`no page errors (${errors.length})`, errors.length === 0);
if (errors.length) errors.slice(0, 5).forEach((e) => console.log('   ⚠', e.slice(0, 200)));

await browser.close();
server.close();
console.log(`\n${'='.repeat(40)}\n${failed === 0 ? '✅' : '❌'} widgets: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
