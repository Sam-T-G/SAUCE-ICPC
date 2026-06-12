// ============================================================================
// views/stats.js — progress dashboard: rank, XP chart, activity heatmap,
// accuracy by exercise type, mastery per unit, badges.
// ============================================================================
import { el, todayStr, addDays, fmtInt, fmtDuration, ring } from '../util.js';
import { getState } from '../store.js';
import { UNITS } from '../../data/curriculum.js';
import * as engine from '../engine.js';
import { TYPE_LABELS } from '../exercises.js';

export function renderStats(root) {
  const st = getState();
  const rank = engine.rankFor(st.xp.total);
  const prog = engine.overallProgress(st);
  const totalMs = Object.values(st.activity).reduce((a, d) => a + (d.ms ?? 0), 0);
  const totalEx = st.exStats.attempts;
  const acc = totalEx ? Math.round((st.exStats.correct / totalEx) * 100) : 0;
  const solved = Object.values(st.problems).filter((p) => p.solved).length;

  root.replaceChildren(el('h1', {}, '📊 Stats'));

  // headline tiles
  const tiles = el('div', { class: 'stats-grid' });
  tiles.append(
    tile(`⚡ ${fmtInt(st.xp.total)}`, 'total XP'),
    tile(`🔥 ${st.streak.current}`, `streak (best ${st.streak.best})`),
    tile(`🎯 ${acc}%`, `accuracy · ${fmtInt(totalEx)} exercises`),
    tile(`🗡️ ${solved}`, 'problems solved'),
    tile(`⏱ ${fmtDuration(totalMs)}`, 'time practicing'),
    tile(`🧊 ${st.streak.freezes}`, 'streak freezes banked'),
  );
  root.append(tiles);

  // rank card
  const rankCard = el('div', { class: 'card mt-2' });
  rankCard.append(el('div', { class: 'row wrap' },
    ring(rank.progress, { size: 84, stroke: 9, color: rank.color, label: '🏅' }),
    el('div', { style: { flex: 1, minWidth: '200px' } },
      el('h3', { style: { color: rank.color, marginBottom: '2px' } }, rank.name),
      rank.next
        ? el('small', { class: 'muted' }, `${fmtInt(rank.next.at - st.xp.total)} XP to ${rank.next.name}`)
        : el('small', { class: 'muted' }, 'Maximum rank. Touch grass occasionally.'),
      el('div', { class: 'progress xp thin mt-1' }, el('div', { class: 'fill', style: { width: `${rank.progress * 100}%` } }))),
    el('div', { class: 'center' },
      ring(prog.pct, { size: 84, stroke: 9, color: 'var(--ok)', label: `${Math.round(prog.pct * 100)}%` }),
      el('small', { class: 'faint' }, 'course'))));
  root.append(rankCard);

  // 14-day XP chart
  root.append(el('h3', { class: 'mt-3' }, 'Last 14 days'));
  root.append(xpChart(st));

  // activity heatmap (last ~18 weeks)
  root.append(el('h3', { class: 'mt-3' }, 'Activity'));
  root.append(heatmap(st));

  // accuracy by type
  const types = Object.entries(st.exStats.byType).filter(([, v]) => v.a >= 3);
  if (types.length) {
    root.append(el('h3', { class: 'mt-3' }, 'Accuracy by exercise type'));
    const list = el('div', { class: 'col' });
    types.sort((a, b) => (a[1].c / a[1].a) - (b[1].c / b[1].a));
    for (const [type, v] of types) {
      const pct = Math.round((v.c / v.a) * 100);
      list.append(el('div', { class: 'row' },
        el('span', { style: { width: '170px', fontWeight: 700, fontSize: 'var(--fs-sm)' } }, TYPE_LABELS[type] ?? type),
        el('div', { class: 'progress thin', style: { flex: 1 } },
          el('div', { class: 'fill', style: { width: `${pct}%`, background: pct >= 80 ? undefined : 'linear-gradient(90deg,var(--warn),var(--xp))' } })),
        el('small', { style: { width: '90px', textAlign: 'right' } }, `${pct}% · ${v.a} tries`)));
    }
    root.append(list, el('small', { class: 'faint' }, 'Weakest types float to the top — that’s your deliberate-practice menu.'));
  }

  // mastery per unit
  root.append(el('h3', { class: 'mt-3' }, 'Mastery by unit'));
  const units = el('div', { class: 'col' });
  for (const u of UNITS) {
    const p = engine.unitProgress(u.id, st);
    units.append(el('div', { class: 'row' },
      el('span', { style: { width: '30px', textAlign: 'center' } }, u.icon),
      el('span', { style: { width: '180px', fontWeight: 700, fontSize: 'var(--fs-sm)' } }, u.title),
      el('div', { class: 'progress thin', style: { flex: 1 } },
        el('div', { class: 'fill', style: { width: `${p.pct * 100}%`, background: u.color } })),
      el('small', { style: { width: '64px', textAlign: 'right' } }, `${p.done}/${p.total}`)));
  }
  root.append(units);

  // badges
  root.append(el('h3', { class: 'mt-3' }, `Badges · ${Object.keys(st.badges).length}/${engine.BADGES.length}`));
  const grid = el('div', { class: 'badge-grid' });
  for (const b of engine.BADGES) {
    const earned = st.badges[b.id];
    grid.append(el('div', { class: `badge-tile ${earned ? 'earned' : ''}`, 'data-tip': earned ? `earned ${earned}` : 'locked' },
      el('div', { class: 'b-ico' }, b.icon),
      el('div', { class: 'b-name' }, b.name),
      el('div', { class: 'b-desc' }, b.desc)));
  }
  root.append(grid);
}

function tile(val, label) {
  return el('div', { class: 'stat-tile' },
    el('div', { class: 'st-val' }, val),
    el('div', { class: 'st-label' }, label));
}

function xpChart(st) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(todayStr(), -i);
    days.push({ d, xp: st.activity[d]?.xp ?? 0 });
  }
  const max = Math.max(50, ...days.map((x) => x.xp));
  const W = 700, H = 170, pad = 26;
  const bw = (W - pad * 2) / days.length;
  const goal = st.profile.dailyGoal || 50;
  const gy = H - 20 - (goal / max) * (H - 50);

  let bars = '';
  days.forEach((x, i) => {
    const h = (x.xp / max) * (H - 50);
    const today = i === days.length - 1;
    bars += `<rect class="bar ${today ? 'today' : ''}" x="${pad + i * bw + 3}" y="${H - 20 - h}" width="${bw - 6}" height="${Math.max(2, h)}" rx="4"></rect>`;
    if (i % 2 === 0) bars += `<text class="axis-label" x="${pad + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${x.d.slice(5)}</text>`;
    if (x.xp > 0) bars += `<text class="axis-label" x="${pad + i * bw + bw / 2}" y="${H - 26 - h}" text-anchor="middle">${x.xp}</text>`;
  });

  const card = el('div', { class: 'card flat' });
  card.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="XP earned per day, last 14 days">
      <line class="grid-line" x1="${pad}" y1="${gy}" x2="${W - pad}" y2="${gy}"></line>
      <text class="axis-label" x="${pad + 2}" y="${gy - 5}" text-anchor="start">goal ${goal}</text>
      ${bars}
    </svg>`;
  return card;
}

function heatmap(st) {
  const weeks = 18;
  const cells = [];
  const start = addDays(todayStr(), -(weeks * 7 - 1));
  // align to Sunday
  const startDate = new Date(start + 'T12:00');
  const offset = startDate.getDay();
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 0; i < weeks * 7 - offset; i++) {
    const d = addDays(start, i);
    if (d > todayStr()) break;
    cells.push({ d, xp: st.activity[d]?.xp ?? 0 });
  }
  const grid = el('div', { class: 'heatmap' });
  for (const c of cells) {
    if (!c) { grid.append(el('span', { class: 'hm-cell', style: { opacity: 0 } })); continue; }
    const lvl = c.xp === 0 ? 0 : c.xp < 30 ? 1 : c.xp < 60 ? 2 : c.xp < 120 ? 3 : 4;
    grid.append(el('span', { class: `hm-cell ${lvl ? 'l' + lvl : ''}`, 'data-tip': `${c.d}: ${c.xp} XP` }));
  }
  return el('div', { class: 'card flat' }, grid);
}
