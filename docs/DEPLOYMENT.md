# SAUCE Academy — Deployment & Operations

The app is static files. "Deploying" means serving the repo root over HTTP.
This document covers the live GitHub Pages setup (including a non-obvious
permissions gotcha), local serving, the runtime's one external dependency, and
day-2 operations for a team.

---

## Live site

**https://sam-t-g.github.io/SAUCE-ICPC/**

Served from the `gh-pages` branch, which is a tested mirror of `main`. Verified
in the audit: `origin/gh-pages` and `origin/main` point at the same commit, so
the site is exactly the current code.

---

## How publishing works (and the gotcha)

The flow is **push to `main` → CI tests → mirror to `gh-pages` → GitHub
publishes**:

```
push main ──▶ .github/workflows/pages.yml
                ├─ job: test   (engine tests + content validation w/ g++)
                └─ job: deploy (needs: test)
                       └─ git push origin HEAD:gh-pages --force
                                   │
                                   ▼
              GitHub's built-in "pages build and deployment"
              picks up gh-pages and serves it on the .github.io URL
```

**Why the mirror instead of `actions/deploy-pages`?** The first attempt used
the standard `configure-pages` + `upload-pages-artifact` + `deploy-pages`
("Source: GitHub Actions") flow. It failed at `configure-pages` with
`Resource not accessible by integration` — the workflow's `GITHUB_TOKEN`
**cannot create a Pages site** (that needs repository-admin scope, which Action
tokens never get). The workaround that worked: push a `gh-pages` branch, which
auto-enables Pages in "deploy from branch" mode; from then on the only thing
that branch mode will publish is the `gh-pages` branch. So the workflow now
just force-pushes `main` to `gh-pages` after tests pass, and GitHub's own
publisher does the rest. The test gate is preserved — `deploy` still
`needs: test`.

**If you ever switch Settings → Pages → Source back to "GitHub Actions",**
replace the `deploy` job with the `configure-pages`/`upload-pages-artifact`/
`deploy-pages` trio (kept in git history at commit `bce82b0`). Branch mode is
simpler and is what's live.

### Consequence for contributors
Don't hand-edit `gh-pages`; it is overwritten on every successful `main` build.
Work on a feature branch → merge to `main` → the site updates automatically.

---

## Serving locally

Any static server works (the app is pure static assets):

```bash
python3 -m http.server 8000        # → http://localhost:8000
# or
npx serve
```

It also runs from `file://` by simply opening `index.html`, with two caveats:
the service worker won't register (http-only — harmless, just no offline
cache), and some browsers restrict module loading from `file://`. A local
server is the reliable path.

---

## Runtime dependencies

The app is self-contained **except for one optional external service**: the
`code` exercises and the Handbook playground compile/run C++ via the **Piston
API** (`runner.js`). Default endpoint is the free public instance
`https://emkc.org/api/v2/piston/execute`, which is rate-limited (calls are
queued and spaced in `runner.js`). For team-scale use, self-host Piston and
point Settings → Code runner at your instance. Everything else — lessons,
reviews, the SRS engine, stats, the team leaderboard — works fully offline; if
Piston is unreachable, `code` exercises fall back to honest self-check.

No fonts/CDNs are fetched at runtime; the favicon and PWA icon are an inline
`icon.svg`. The only network calls the app makes are to the configured Piston
endpoint.

---

## PWA / offline

`manifest.webmanifest` + `sw.js` make the app installable and offline-capable.
The service worker is network-first with a cache fallback, so a returning user
can practice on a train. Bump `VERSION` in `sw.js` to invalidate the cache on a
breaking release. (No effect on `file://`; http(s) only.)

---

## Data, privacy, backup

There is **no server and no account** — all progress lives in the browser's
`localStorage` under `sauce-academy-v1`. Implications:

- Progress is **per-browser, per-device**. Clearing site data wipes it.
- **Back up** from Settings → Export (or the Team tab). Restore by import.
- Nothing leaves the device except C++ submissions sent to the Piston endpoint.

---

## Team operations (the weekly ritual)

The Team tab is a serverless leaderboard built from committed export files:

1. Each member trains, then **Team → Export my progress** (downloads a JSON).
2. Drop the file in `team/` and add its name to `team/manifest.json`:
   ```json
   { "files": ["sam.json", "alex.json", "jordan.json"] }
   ```
3. Commit + push. On the next pull/visit, the Team tab auto-loads every listed
   file and shows the leaderboard + per-unit coverage for the whole team.

Re-export and re-commit after each practice week. See `docs/COACH` content
in-app (the Coach tab) for the training cadence this supports.

---

## Operational checklist

| Symptom | Check |
|---|---|
| Site 404 right after a deploy | First-build CDN propagation — wait 1–2 min, hard refresh. |
| Site not updating after push | Did the `test` job pass? A red build never reaches `deploy`. Check the Actions tab. |
| `code` exercises all error | Piston endpoint down/rate-limited — set a self-hosted URL in Settings, or use self-check. |
| Lost all progress | localStorage cleared. Restore from an exported backup (Settings → Import). |
| Offline doesn't work | Served over `file://`, or first visit hasn't cached yet — load once online over http(s). |
