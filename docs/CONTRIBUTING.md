# Contributing to SAUCE Academy

The app is intentionally zero-build: plain ES modules, no dependencies, no
bundler. If you can write JS and C++, you can extend it.

## Quick orientation

| Want to… | Touch |
|---|---|
| Fix a typo / improve an explanation | `data/units/uXX.js` (find the exercise by its `id`) |
| Add exercises to an existing skill | `data/units/uXX.js` — follow [CONTENT_SPEC.md](CONTENT_SPEC.md) |
| Add a problem recommendation | the skill's `problems` array — verify the URL actually resolves |
| Add a whole new skill | `data/curriculum.js` (metadata) + the unit content file |
| Change XP / mastery / SRS rules | `src/engine.js`, `src/srs.js` — update `tests/engine.test.js` to match |
| Add an exercise *type* | `src/exercises.js` (renderer) + `tests/validate-content.js` (schema) + CONTENT_SPEC |
| Improve the handbook | `data/handbook.js` (and keep `SAUCE.cpp` in sync in spirit) |
| Visual polish | `styles/*.css` — tokens first, components second |

## The two commands that gate every PR

```bash
node tests/engine.test.js          # logic tests must stay green
node tests/validate-content.js    # all content: schema + g++ compile/run of
                                   # every code exercise solution
```

The validator is strict on purpose: every exercise needs an `explain` that
actually teaches, `code` exercise solutions must compile and pass their own
tests, match/order/parsons items must be unambiguous.

## Content quality bar (the short version)

- Distractors are real bugs people write, not filler.
- Explanations name the principle or trap in 1–3 sentences.
- Exercise ladder per skill: traces before Parsons before typed recall before
  free coding.
- Only recommend problems you've verified exist (name + ID + URL).
- Voice: sharp coach, zero fluff, no condescension.

Full schema: [CONTENT_SPEC.md](CONTENT_SPEC.md). Research rationale:
[PEDAGOGY.md](PEDAGOGY.md).

## Team progress files

`team/*.json` files are teammates' progress exports (see the Team tab).
List each file in `team/manifest.json`:

```json
{ "files": ["sam.json", "alex.json"] }
```

Commit yours after practice; the Team tab picks them up when the app is
served from the repo.

## Testing a change by hand

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Settings → "Reset everything" gives you a clean profile for testing
onboarding and unlock logic. Export a backup first if you care about your
streak (you do).
