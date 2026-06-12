#!/usr/bin/env node
// ============================================================================
// smoke.test.mjs — headless browser smoke test of the real app.
// Boots a static server, walks onboarding → path → learn session → exercises
// → completion, and fails on any console error.
//
// Requires: npx playwright install chromium
// Run: node tests/smoke.test.mjs
// ============================================================================
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.cpp': 'text/plain', '.md': 'text/plain' };

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const data = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const BASE = `http://127.0.0.1:${port}`;

let passed = 0, failed = 0;
const fails = [];
function check(name, cond) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; fails.push(name); console.log(`  ✗ ${name}`); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(String(err)));

console.log('\n— boot & onboarding —');
await page.goto(BASE, { waitUntil: 'networkidle' });
check('app boots', await page.locator('#app').count() === 1);
check('onboarding shows', await page.locator('.onboard').count() === 1);

await page.fill('.onboard input[type="text"]', 'smoketester');
await page.click('.onboard .btn.primary');
await page.click('.onboard .btn.primary');           // avatar step (default)
await page.click('.onboard .btn.primary');           // goal step (default)
await page.waitForSelector('.unit-header', { timeout: 5000 });
check('path renders after onboarding', true);

console.log('\n— learning path —');
check('12 unit headers', (await page.locator('.unit-header').count()) === 12);
check('54 skill nodes', (await page.locator('.skill-node').count()) === 54);
check('START bubble on first skill', (await page.locator('.sn-start').first().textContent()) === 'START');
check('later skills locked', (await page.locator('.skill-node.locked').count()) > 40);

// open flyout on first skill and start learning
await page.click('.skill-node >> nth=0');
await page.waitForSelector('.skill-flyout');
check('flyout opens', true);
await page.click('.skill-flyout .btn.primary');
await page.waitForSelector('.lesson-screen');
check('lesson screen opens', true);

console.log('\n— theory cards —');
await page.waitForSelector('.theory-card');
check('theory card shows', true);
// advance through all theory cards
for (let i = 0; i < 12; i++) {
  const btn = page.locator('.lesson-foot .btn.primary');
  const label = await btn.textContent();
  await btn.click();
  if (label.includes('Start practicing')) break;
}
await page.waitForSelector('.ex-prompt', { timeout: 5000 });
check('first exercise renders after theory', true);

console.log('\n— exercise loop —');
// answer up to 14 exercises; pick option 1 for mcq-likes, else use skip;
// verify feedback + explanation machinery appears.
let sawFeedback = false, sawExplain = false, finished = false;
for (let i = 0; i < 20; i++) {
  if (await page.locator('.lesson-done').count()) { finished = true; break; }
  const hasOpts = await page.locator('.opt-list .opt').count();
  if (hasOpts) {
    await page.click('.opt-list .opt >> nth=0');
    const checkBtn = page.locator('.lesson-foot .btn.ok');
    if (await checkBtn.isEnabled()) await checkBtn.click();
    else await page.click('.lesson-foot .btn.ghost'); // fallback skip
  } else {
    // non-mcq types in smoke test: skip (still exercises feedback path)
    await page.click('.lesson-foot .btn.ghost >> nth=0');
  }
  await page.waitForSelector('.lesson-foot.state-ok, .lesson-foot.state-bad', { timeout: 5000 });
  sawFeedback = true;
  if ((await page.locator('.v-expl').textContent()).length > 10) sawExplain = true;
  await page.click('.lesson-foot .btn.ok, .lesson-foot .btn.bad');
  await page.waitForTimeout(120);
}
if (!finished) {
  // drain any re-queued mistakes by skipping until done
  for (let i = 0; i < 30 && !(await page.locator('.lesson-done').count()); i++) {
    const skip = page.locator('.lesson-foot .btn.ghost').first();
    if (await skip.count()) { await skip.click().catch(() => {}); }
    const cont = page.locator('.lesson-foot .btn.ok, .lesson-foot .btn.bad').first();
    if (await cont.count()) await cont.click().catch(() => {});
    await page.waitForTimeout(100);
  }
  finished = (await page.locator('.lesson-done').count()) > 0;
}
check('feedback bar appears on answers', sawFeedback);
check('explanations shown with feedback', sawExplain);
check('lesson completes to celebration screen', finished);
check('XP shown on completion', (await page.locator('.ld-stat').count()) >= 2);

await page.click('.lesson-done .btn.primary');
await page.waitForSelector('.unit-header');
check('returns to path; first skill now leveled', (await page.locator('.sn-crowns').count()) >= 1);

console.log('\n— other views —');
for (const [route, sel, name] of [
  ['#/review', 'h1', 'Review renders'],
  ['#/problems', '.prob-row', 'Problems renders with rows'],
  ['#/handbook', '.hb-toc .hb-card', 'Handbook TOC renders'],
  ['#/stats', '.stat-tile', 'Stats renders'],
  ['#/team', '.team-member', 'Team renders'],
  ['#/coach', '.card-title', 'Coach renders'],
  ['#/settings', 'input', 'Settings renders'],
]) {
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(sel, { timeout: 6000 }).catch(() => {});
  check(name, (await page.locator(sel).count()) > 0);
}

// handbook wizard
await page.goto(`${BASE}/#/handbook`, { waitUntil: 'networkidle' });
await page.click('.tabs .tab >> nth=1');
await page.waitForSelector('.wizard-step .opt');
await page.click('.wizard-step .opt >> nth=1'); // monotonic answer → result
check('wizard reaches a recommendation', (await page.locator('.wizard-step .card').count()) > 0);

console.log('\n— console hygiene —');
const realErrors = consoleErrors.filter((e) => !/favicon|net::ERR|404|Failed to load resource/i.test(e));
check(`no console/page errors (${realErrors.length})`, realErrors.length === 0);
if (realErrors.length) realErrors.slice(0, 6).forEach((e) => console.log('   ⚠', e.slice(0, 200)));

await browser.close();
server.close();

console.log(`\n${'='.repeat(40)}\n${failed === 0 ? '✅' : '❌'} smoke: ${passed} passed, ${failed} failed`);
if (fails.length) fails.forEach((f) => console.log('  failed: ' + f));
process.exit(failed ? 1 : 0);
