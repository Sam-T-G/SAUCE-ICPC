# SAUCE Academy — Testing

Four independent test layers guard the app. The first two need only Node + g++
and run in CI on every push to `main`; the last two drive a real headless
browser. **All four currently pass** (see `docs/AUDIT.md` for the latest run).

| Layer | File | Runtime | What it proves | CI? |
|---|---|---|---|---|
| Engine unit tests | `tests/engine.test.js` | Node | SRS math, streaks, XP, mastery, unlocks, problem tracking — the rules are correct | ✅ |
| Content validation | `tests/validate-content.js` | Node + **g++** | Every unit's schema is valid **and every `code` exercise compiles and passes its own tests** | ✅ |
| App smoke | `tests/smoke.test.mjs` | Playwright | The real app boots, onboards, runs a full lesson, all 8 tabs render, zero console errors | local |
| Widget interaction | `tests/widgets.test.mjs` | Playwright | All 11 exercise widgets accept input, grade correct/wrong, give per-slot feedback | local |

---

## Running the fast layers (Node + g++)

```bash
node tests/engine.test.js            # ~instant; 27 assertions
node tests/validate-content.js       # ~45s; compiles + runs all 43 code exercises
node tests/validate-content.js u06   # validate a single unit while authoring
node tests/validate-content.js --no-compile   # skip g++ (schema only, fast)
```

`npm test` runs the engine tests then the content validator (the two CI gates).

**g++ requirement.** The content validator writes each `code` exercise's
`solution` to a temp file, compiles it with `g++ -O2 -std=c++17`, and runs it
against the exercise's own test cases. If g++ is absent it prints
`(g++ unavailable … skipped)` and still validates schema — but CI has g++, so a
non-compiling solution will fail the build. This is the strongest guarantee in
the repo: **a broken code exercise cannot ship.**

What the validator checks per skill (errors fail the run; warnings are
judgment calls):
- 4–6 theory cards, each with a heading and ≥30-char body;
- ≥8 exercises, unique ids, valid `diff` (1/2/3), and a teaching `explain`
  (≥20 chars) on **every** exercise;
- per-type structural rules (mcq answer in range, parsons/match items
  unambiguous, bank/typein slot count matches answer count, typein slots
  ≤30 chars, code has ≥2 tests + a compiling solution, …);
- ≥2 external problems with a real platform/url and valid difficulty;
- type variety (≥5 types) and a 1/2/3 difficulty spread (warnings);
- that every `data/typein.js` entry maps to a real skill.

It performs the **same `typein` merge** the app does, so the counts it reports
are exactly what ships.

---

## Running the browser layers (Playwright)

These drive headless Chromium. This sandbox ships a browser at a fixed path and
the Playwright package version must match it, so:

```bash
# one-time: pin the package to the bundled browser's version, point at it
npm install playwright@1.56.1 --no-save
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/smoke.test.mjs
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/widgets.test.mjs
```

On a normal dev machine the usual `npx playwright install chromium` works and
the `PLAYWRIGHT_BROWSERS_PATH` prefix is unnecessary. **Gotcha:** the Playwright
*package* version and the *browser* build are coupled — a mismatch errors with
"Executable doesn't exist". Pin the package to the browser you have.

Both harnesses spin up an in-process static file server on an ephemeral port
(no external server needed) and tear it down at the end. Exit code is non-zero
on any failure, so they slot into CI if you add a browser-enabled job.

### What smoke covers
Boots the app, completes onboarding, asserts the path renders **12 unit
headers + 54 skill nodes** with the first skill unlocked and the rest locked,
opens a skill, walks theory → exercises → the celebration screen (verifying the
feedback bar and elaborated explanations appear and the skill levels up), then
visits all 8 tabs and exercises the handbook wizard. Finally it asserts **zero
uncaught console/page errors** — this is what caught the real
temporal-dead-zone bug in `lesson.js` during the build.

### What widgets covers
Renders each of the 11 exercise types in isolation through a tiny harness and
checks: not-ready before input → ready after → correct verdict on the right
answer → wrong verdict + per-slot highlighting on a wrong answer. For `typein`
it specifically asserts whitespace-forgiving matching, off-by-one detection,
and **case-sensitivity** (`I < N` ≠ `i < n`).

---

## CI

`.github/workflows/pages.yml` runs the two Node layers as the `test` job on
every push to `main`; the `deploy` job (publish to `gh-pages`) only runs
`needs: test`. So the live site can never serve content that fails validation
or breaks the engine. The browser layers are run locally before pushing (the
runner image here doesn't provision Chromium); to gate on them in CI, add
`npx playwright install --with-deps chromium` + the two `node tests/*.mjs`
commands to the `test` job.

---

## Adding tests

- **New engine rule** → add assertions to `engine.test.js` (it shims
  `localStorage` for Node and uses fixed dates — no mocks).
- **New exercise type** → add a render+grade case to `widgets.test.mjs` and a
  schema branch to `validate-content.js`.
- **New view/flow** → extend the route walk in `smoke.test.mjs`.
- **New content** → nothing to write; the validator covers it generically.
