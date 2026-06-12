// ============================================================================
// views/team.js — team features without a backend: export your progress,
// import teammates' exports, compare. Optionally auto-load team/*.json files
// committed to the repo (see team/manifest.json).
// ============================================================================
import { el, esc, fmtInt, downloadText, todayStr } from '../util.js';
import { getState, exportJSON, importJSON, parseTeammate } from '../store.js';
import { UNITS } from '../../data/curriculum.js';
import * as engine from '../engine.js';
import { toast } from '../fx.js';

const LS_KEY = 'sauce-teammates-v1';

function loadTeammates() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}
function saveTeammates(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function renderTeam(root, rerender) {
  const st = getState();

  root.replaceChildren(
    el('h1', {}, '👥 Team'),
    el('p', { class: 'muted' }, 'No accounts, no server: progress lives in your browser. Trade export files with your teammates (or commit them to ',
      el('code', { class: 'inline' }, 'team/'), ' in the repo) and the rivalry takes care of itself.'));

  // my card + actions
  root.append(el('div', { class: 'card mb-2' },
    el('div', { class: 'row wrap' },
      el('div', { class: 'tm-avatar', style: { fontSize: '1.6rem' } }, st.profile.emoji),
      el('div', { style: { flex: 1 } },
        el('div', { class: 'tm-name' }, st.profile.name || 'you'),
        el('small', { class: 'muted' }, `${engine.rankFor(st.xp.total).name} · ${fmtInt(st.xp.total)} XP · 🔥 ${st.streak.current}`)),
      el('button', { class: 'btn primary', onclick: () => {
        downloadText(`sauce-${(st.profile.name || 'me').replace(/\W+/g, '-')}-${todayStr()}.json`, exportJSON());
        toast('Progress exported — share it with the team 📤', { kind: 'ok', icon: '💾' });
      } }, '📤 Export my progress'),
      importButton(rerender))));

  // teammates
  const mates = loadTeammates();
  // try auto-loading from team/manifest.json (works when served from the repo)
  try {
    const res = await fetch('team/manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const manifest = await res.json();
      for (const file of manifest.files ?? []) {
        try {
          const r = await fetch(`team/${file}`, { cache: 'no-store' });
          if (!r.ok) continue;
          const s = parseTeammate(await r.text());
          if (s && !mates.some((m) => m.profile?.name === s.profile?.name)) {
            mates.push(snapshot(s, `repo:${file}`));
          }
        } catch { /* skip */ }
      }
    }
  } catch { /* offline or not served from repo root — fine */ }

  const all = [snapshot(st, 'me'), ...mates].sort((a, b) => b.xp - a.xp);

  root.append(el('h3', {}, 'Leaderboard'));
  const lb = el('div', { class: 'col' });
  all.forEach((m, i) => {
    const isMe = m.source === 'me';
    lb.append(el('div', { class: `team-member ${isMe ? 'me' : ''}` },
      el('span', { style: { fontWeight: 900, width: '28px', color: i === 0 ? 'var(--gold)' : 'var(--text-faint)' } }, `#${i + 1}`),
      el('div', { class: 'tm-avatar' }, m.emoji),
      el('div', { style: { flex: 1, minWidth: 0 } },
        el('div', { class: 'tm-name' }, m.name, isMe ? el('small', { class: 'faint' }, ' (you)') : null),
        el('div', { class: 'tm-sub' }, `${m.rank} · ${fmtInt(m.xp)} XP · 🔥 ${m.streak} · ✓ ${m.solved} problems · ${Math.round(m.coursePct * 100)}% course`)),
      !isMe && !m.source.startsWith('repo:')
        ? el('button', { class: 'icon-btn', 'aria-label': 'remove', onclick: () => { saveTeammates(loadTeammates().filter((x) => x.name !== m.name)); rerender(); } }, '🗑️')
        : null));
  });
  root.append(lb);

  // unit-by-unit comparison
  if (all.length > 1) {
    root.append(el('h3', { class: 'mt-3' }, 'Unit coverage'));
    const table = el('table', { class: 'nice' });
    const head = el('tr', {}, el('th', {}, 'Unit'));
    all.forEach((m) => head.append(el('th', {}, `${m.emoji} ${esc(m.name).slice(0, 10)}`)));
    table.append(head);
    for (const u of UNITS) {
      const tr = el('tr', {}, el('td', {}, `${u.icon} ${u.title}`));
      all.forEach((m) => {
        const pct = m.unitPct[u.id] ?? 0;
        tr.append(el('td', {},
          el('div', { class: 'progress thin', style: { width: '80px' } },
            el('div', { class: 'fill', style: { width: `${pct * 100}%`, background: u.color } }))));
      });
      table.append(tr);
    }
    root.append(el('div', { class: 'card flat', style: { overflowX: 'auto' } }, table));
  }

  root.append(el('div', { class: 'callout info mt-3' },
    el('span', { class: 'co-ico' }, '🤝'),
    el('span', { html: 'Team ritual that works: everyone exports after Sunday practice, commits to <code>team/</code>, and lists the files in <code>team/manifest.json</code>. The leaderboard updates for everyone on the next pull. Accountability without servers.' })));
}

function snapshot(s, source) {
  const unitPct = {};
  for (const u of UNITS) unitPct[u.id] = engine.unitProgress(u.id, s).pct;
  return {
    source,
    name: s.profile?.name || 'mystery coder',
    emoji: s.profile?.emoji || '👻',
    xp: s.xp?.total ?? 0,
    rank: engine.rankFor(s.xp?.total ?? 0).name,
    streak: s.streak?.current ?? 0,
    solved: Object.values(s.problems ?? {}).filter((p) => p.solved).length,
    coursePct: engine.overallProgress(s).pct,
    unitPct,
  };
}

function importButton(rerender) {
  const input = el('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const s = parseTeammate(text);
    if (!s) { toast('That file isn’t a SAUCE export.', { kind: 'bad', icon: '⚠️' }); return; }

    const me = getState();
    if (s.profile?.name && s.profile.name === me.profile.name) {
      // importing own backup → restore
      if (confirm('This export has your name on it. Restore it as YOUR progress (overwrites current)?')) {
        const err = importJSON(text);
        if (err) toast(err, { kind: 'bad' });
        else { toast('Progress restored 💾', { kind: 'ok' }); rerender(); }
        return;
      }
    }
    const mates = loadTeammates().filter((m) => m.name !== (s.profile?.name || 'mystery coder'));
    mates.push(snapshot(s, 'import'));
    saveTeammates(mates);
    toast(`Teammate added: ${esc(s.profile?.name ?? '???')} 👋`, { kind: 'ok', icon: '👥' });
    rerender();
  });
  const btn = el('button', { class: 'btn ghost', onclick: () => input.click() }, '📥 Import');
  return el('span', {}, btn, input);
}
