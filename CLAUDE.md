# CLAUDE.md — working notes for AI sessions on this repo

Orientation for Claude Code (or any agent) editing SAUCE Academy. Read this
first, then `docs/ARCHITECTURE.md` for depth.

## What this is
A static, zero-build single-page web app that trains an ICPC team from C++
basics to regionals, Duolingo-style. Plain ES modules, no framework, no
bundler, no package to install to run it. It must keep working from `file://`,
a static server, and GitHub Pages with no tooling.

## Golden rules
- **No build step. No runtime dependencies added** to the app itself. If you
  reach for a bundler or an npm UI library, stop — it's the wrong repo for that.
- **State writes go through `update()` in `src/store.js`** and nowhere else.
  Views render purely from state and call their `rerender` callback after a
  write.
- **`src/srs.js` and the scheduling math stay pure** (no DOM, no storage) — it's
  unit-tested directly.
- **Every exercise needs a teaching `explain`**, and every `code` exercise's
  `solution` must compile and pass its tests. The validator enforces both.
- **Only use verified problems** in `problems[]` — real platform/id/url. Don't
  invent CSES/CF problems.
- **Match the house voice:** sharp coach, concise, no condescension; subgoal
  comments in example code; name the trap.

## Before you commit — run the gates
```bash
node tests/engine.test.js          # rules (SRS, streaks, XP, mastery)
node tests/validate-content.js     # schema + compiles every code exercise (g++)
# browser layers (local; pin playwright to the bundled browser):
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/smoke.test.mjs
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tests/widgets.test.mjs
```
Validate a single unit while authoring: `node tests/validate-content.js u06`.

## Where things live (quick map)
- Rules/pedagogy → `src/engine.js`; scheduler → `src/srs.js`
- Exercise widgets → `src/exercises.js` (11 types, uniform controller contract)
- Views (one per tab) → `src/views/*.js`; lesson player → `src/views/lesson.js`
- State → `src/store.js`; routing/shell/onboarding → `src/main.js`
- Curriculum metadata → `data/curriculum.js`; lesson content → `data/units/uXX.js`
- "Type-the-code" drills → `data/typein.js` (merged into pools at load)
- Handbook + wizard → `data/handbook.js`; styles → `styles/*.css` (tokens first)

## Adding content (the common task)
1. Read `docs/CONTENT_SPEC.md` and `data/units/u01.js` (canonical exemplar).
2. Edit the unit file; keep the trace → assemble → typed-recall → write ladder.
3. `node tests/validate-content.js uXX` until 0 errors.

## Adding an exercise type (rarer)
Renderer + dispatcher case in `exercises.js`; schema branch in
`validate-content.js`; a `views.css` block; a case in `widgets.test.mjs`; a row
in `CONTENT_SPEC.md`.

## Deployment
Push to `main` → CI tests → workflow force-pushes `main` to `gh-pages` →
GitHub publishes. **Don't hand-edit `gh-pages`** (it's overwritten). Details and
the Pages-token gotcha: `docs/DEPLOYMENT.md`.

## Docs index
`README.md` (overview) · `docs/ARCHITECTURE.md` · `docs/PEDAGOGY.md` (the
research behind each mechanic, with citations + caveats) · `docs/CURRICULUM.md`
· `docs/CONTENT_SPEC.md` · `docs/TESTING.md` · `docs/DEPLOYMENT.md` ·
`docs/CONTRIBUTING.md` · `docs/AUDIT.md` (verified status snapshot).
