# SAUCE Academy — Progress Audit

**Date:** 2026-06-13 · **Commit:** `8aa3f31` (`main`) · **Status: complete and
live.** Every test layer passes; all 12 curriculum units are finished; the site
is deployed and serving the current code.

This is a verified snapshot — every number below was produced by running the
tooling against the repo, not estimated.

---

## 1. Verdict

| Area | Status |
|---|---|
| Application (engine, views, widgets, PWA) | ✅ Complete |
| Curriculum content (12 units / 54 skills) | ✅ Complete |
| Test suites (4 layers) | ✅ All passing |
| Documentation | ✅ Complete (this audit adds architecture/testing/deployment refs) |
| Deployment (GitHub Pages, CI-gated) | ✅ Live & in sync |

No known blocking issues. Open follow-ups are enhancements, not gaps (§6).

---

## 2. Test results (this run)

| Suite | Command | Result |
|---|---|---|
| Engine unit tests | `node tests/engine.test.js` | **27 passed, 0 failed** |
| Content validation | `node tests/validate-content.js` | **valid** — 0 errors |
| App smoke (browser) | `node tests/smoke.test.mjs` | **25 passed, 0 failed** |
| Widget interaction (browser) | `node tests/widgets.test.mjs` | **31 passed, 0 failed** |

The content validator additionally **compiled and executed all 43 `code`
exercises** with `g++ -O2 -std=c++17`; every solution compiled and passed its
own test cases.

---

## 3. Content inventory (measured)

```
12 units · 54 skills · 296 theory cards · 694 exercises · 184 problem placements
```

Exercise types (694 total):

| Type | Count | | Type | Count |
|---|---:|---|---|---:|
| mcq | 222 | | match | 39 |
| output (trace) | 102 | | parsons | 39 |
| fill | 83 | | typein | 38 |
| code (judged) | 43 | | order | 18 |
| tf | 60 | | multi | 9 |
| bank | 41 | | | |

**Problems:** 184 placements across skills, **168 unique** (122 CSES,
60 Codeforces, 2 Kattis). Some problems intentionally recur across skills
(e.g. *String Matching* appears under hashing, KMP, and tries to contrast
three techniques on one task).

Per-unit health — **every skill has ≥10 exercises** (min observed: 10):

| Unit | Skills | Theory | Exercises | Problems |
|---|---:|---:|---:|---:|
| u01 C++ Bootcamp | 6 | 30 | 74 | 23 |
| u02 STL & Complexity | 5 | 25 | 67 | 14 |
| u03 Core Patterns | 6 | 35 | 78 | 22 |
| u04 Math & Counting | 5 | 29 | 67 | 18 |
| u05 Graphs I | 5 | 30 | 69 | 19 |
| u06 Dynamic Programming | 6 | 33 | 77 | 21 |
| u07 Trees | 3 | 15 | 37 | 11 |
| u08 Range Queries | 4 | 24 | 55 | 13 |
| u09 Strings | 3 | 14 | 36 | 10 |
| u10 Graphs II & Flows | 3 | 17 | 39 | 9 |
| u11 Math II & Geometry | 4 | 23 | 53 | 14 |
| u12 Contest Craft | 4 | 21 | 42 | 10 |

---

## 4. Codebase metrics (measured)

```
JS    19,022 lines / 37 files     (data/ ≈ 14.9k content, src/+styles ≈ 3.5k hand-written)
CSS    1,355 lines / 4 files
Docs     ~2k lines (README + 7 docs)
SAUCE.cpp  936 lines (preserved handbook)
```

Structure: `src/` 10 core modules + 9 view renderers; `data/` curriculum
metadata + 12 unit content files + typein drills + handbook; `styles/` 4
cascade-ordered sheets; `tests/` 4 suites. Full map in
`docs/ARCHITECTURE.md`.

---

## 5. Deployment state (measured)

- `origin/main` = `origin/gh-pages` = `8aa3f31` → **the live site serves the
  current code.**
- CI: the `pages.yml` `test` job (engine + content validation) gates the
  `deploy` job; a failing build never publishes. Mechanism and the
  Pages-permissions gotcha are documented in `docs/DEPLOYMENT.md`.
- Local working tree clean; `main` and `claude/affectionate-fermi-k928sk` in
  sync.

---

## 6. Honest gaps & follow-ups (non-blocking)

Enhancements, deliberately out of the initial scope:

1. **Browser tests aren't in CI.** Smoke + widget suites run locally (the CI
   runner doesn't provision Chromium). Adding `playwright install --with-deps`
   to the `test` job would close this — see `docs/TESTING.md`.
2. **Piston is a shared public endpoint.** Fine for individuals; a team should
   self-host (Settings → Code runner). Documented.
3. **Content is regionals-depth by design.** Advanced topics (suffix
   structures, FFT, HLD, flows beyond Dinic, D&C/CHT DP optimizations) are
   listed as "where to go beyond" in `docs/CURRICULUM.md`, not yet authored as
   units. The authoring pipeline (`CONTENT_SPEC.md` + validator) makes adding
   them low-risk.
4. **No spaced-repetition of *external problems* beyond the 14-day cold
   re-solve.** A natural extension is full SRS over the problem ladder.
5. **Single-device progress.** No cross-device sync by design (no backend);
   export/import + the `team/` ritual cover sharing.

---

## 7. How to re-run this audit

```bash
node tests/engine.test.js
node tests/validate-content.js
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/smoke.test.mjs
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/widgets.test.mjs
git fetch origin && git rev-parse origin/main origin/gh-pages   # expect equal
```
