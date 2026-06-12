// ============================================================================
// views/review.js — the spaced-repetition hub: what's due, what's fading,
// what's coming, plus the mistake bank and cold re-solve queue.
// ============================================================================
import { el, dueLabel, todayStr, plural } from '../util.js';
import { getState } from '../store.js';
import { SKILL_INDEX } from '../../data/curriculum.js';
import * as srs from '../srs.js';
import * as engine from '../engine.js';
import { startSession } from './lesson.js';

export function renderReview(root, rerender) {
  const st = getState();
  const due = srs.dueSkills(st.srs);
  const tracked = Object.keys(st.srs);
  const mistakes = Object.values(st.missed).reduce((a, m) => a + m.length, 0);
  const resolves = engine.resolveQueue(st);

  root.replaceChildren(
    el('h1', {}, '🧠 Review'),
    el('p', { class: 'muted' },
      'Forgetting is exponential; reviews reset the clock at expanding intervals. ',
      el('strong', {}, 'Mixed review feels harder than re-reading — that is the point.'),
      ' It trains picking the technique, which is the actual contest skill.'));

  // action cards
  const actions = el('div', { class: 'stats-grid', style: { marginBottom: '20px' } });
  actions.append(
    actionCard('🧠', `${due.length} due`, 'Spaced review', due.length ? 'primary' : 'ghost', due.length === 0,
      () => startSession('review', {}, rerender)),
    actionCard('🩹', `${mistakes}`, 'Mistake bank', mistakes ? 'info' : 'ghost', mistakes === 0,
      () => startSession('mistakes', {}, rerender)),
    actionCard('🎲', 'surprise me', 'Weakest skills', tracked.length ? 'gold' : 'ghost', tracked.length === 0,
      () => startSession('review', { size: 12 }, rerender)),
  );
  root.append(actions);

  // due list
  if (tracked.length === 0) {
    root.append(el('div', { class: 'card center pad-lg' },
      el('div', { style: { fontSize: '2.6rem' } }, '🌱'),
      el('h3', {}, 'Nothing tracked yet'),
      el('p', { class: 'muted' }, 'Finish your first lesson and the scheduler starts working for you.')));
    return;
  }

  const today = todayStr();
  const rows = tracked
    .map((id) => ({ id, rec: st.srs[id], s: srs.strength(st.srs[id], today) }))
    .sort((a, b) => a.s - b.s);

  root.append(el('h3', { class: 'mt-2' }, 'Skill memory'));
  const list = el('div', { class: 'col' });
  for (const { id, rec, s } of rows.slice(0, 40)) {
    const meta = SKILL_INDEX[id];
    if (!meta) continue;
    const bars = srs.strengthBars(rec, today);
    const overdue = srs.isDue(rec, today);
    const barEl = el('div', { class: `strength-bar ${bars <= 1 ? 'critical' : bars <= 2 ? 'weak' : ''}` });
    for (let i = 0; i < 4; i++) barEl.append(el('span', { class: `sb-seg ${i < bars ? 'on' : ''}` }));
    list.append(el('div', { class: `review-row ${overdue ? 'overdue' : ''}` },
      el('span', { class: 'rr-ico' }, meta.icon),
      el('div', { style: { flex: 1, minWidth: 0 } },
        el('div', { class: 'rr-name' }, meta.title),
        el('div', { class: 'rr-due' }, `${dueLabel(rec.due)} · interval ${plural(rec.interval, 'day')} · ${Math.round(s * 100)}% retained`)),
      barEl));
  }
  root.append(list);

  // forecast
  const fc = srs.dueForecast(st.srs, 7, today);
  root.append(el('h3', { class: 'mt-3' }, 'Next 7 days'));
  const maxFc = Math.max(1, ...fc);
  const fcRow = el('div', { class: 'row', style: { alignItems: 'flex-end', gap: '8px', height: '90px' } });
  const labels = ['now', '+1', '+2', '+3', '+4', '+5', '+6', '+7'];
  fc.forEach((n, i) => {
    fcRow.append(el('div', { class: 'center', style: { flex: 1 } },
      el('div', { style: {
        height: `${(n / maxFc) * 60 + 4}px`,
        background: i === 0 ? 'var(--bad)' : 'var(--info)',
        borderRadius: '6px',
        opacity: n ? 1 : 0.25,
      } }),
      el('small', { class: 'faint' }, labels[i]),
      el('div', { style: { fontWeight: 800, fontSize: 'var(--fs-xs)' } }, String(n))));
  });
  root.append(el('div', { class: 'card flat' }, fcRow));

  // cold re-solve queue
  if (resolves.length) {
    root.append(el('h3', { class: 'mt-3' }, '🧊 Cold re-solves due'),
      el('p', { class: 'muted' }, 'You solved these with editorial help. Time to solve them cold — that closes the loop.'));
    const rq = el('div', { class: 'col' });
    for (const r of resolves) {
      const [platform, pid] = r.key.split(':');
      rq.append(el('div', { class: 'review-row overdue' },
        el('span', { class: 'rr-ico' }, '🗡️'),
        el('div', { style: { flex: 1 } },
          el('div', { class: 'rr-name' }, `${platform} — ${pid}`),
          el('div', { class: 'rr-due' }, `assisted solve on ${r.at} · re-solve was due ${r.resolveDue}`)),
        el('button', { class: 'btn ok sm', onclick: () => { engine.markResolved(r.key); rerender(); } }, 'Solved cold ✓')));
    }
    root.append(rq);
  }
}

function actionCard(icon, big, label, btnKind, disabled, onclick) {
  return el('div', { class: 'stat-tile', style: { gap: '8px' } },
    el('div', { class: 'st-val' }, el('span', {}, icon), el('span', {}, big)),
    el('div', { class: 'st-label' }, label),
    el('button', { class: `btn ${btnKind} sm`, disabled, onclick }, 'Start'));
}
