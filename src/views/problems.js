// ============================================================================
// views/problems.js — curated external problems per skill (CSES/Codeforces),
// with solve tracking, the "assisted → cold re-solve in 14 days" loop, and
// editorial discipline guidance baked into the UI.
// ============================================================================
import { el, esc } from '../util.js';
import { UNITS, SKILL_INDEX, loadUnitContent } from '../../data/curriculum.js';
import { getState } from '../store.js';
import * as engine from '../engine.js';
import { sfx } from '../audio.js';
import { toast } from '../fx.js';

const DIFF_LABEL = { intro: 'intro', easy: 'easy', med: 'medium', hard: 'hard' };

export async function renderProblems(root, rerender, args = []) {
  const st = getState();
  const focusSkill = args[0] && SKILL_INDEX[args[0]] ? args[0] : null;

  root.replaceChildren(
    el('h1', {}, '🗡️ Real problems'),
    el('p', { class: 'muted', html:
      'Drills teach the moves; <strong>real problems make you a player</strong>. Protocol: read, think on paper, code. ' +
      'Stuck for 20–30 min with zero ideas? Read the editorial, then <em>implement it anyway</em> — and it comes back here in 2 weeks for a cold re-solve. ' +
      '<span class="faint">(Errichto’s rule + the mistake-bank loop.)</span>' }));

  const solvedCount = Object.values(st.problems).filter((p) => p.solved).length;
  root.append(el('div', { class: 'metabar', style: { justifyContent: 'flex-start' } },
    el('span', { class: 'pill ok' }, `✓ ${solvedCount} solved`),
    el('span', { class: 'pill' }, `🧊 ${engine.resolveQueue(st).length} cold re-solves due`)));

  // unit tabs
  const tabs = el('div', { class: 'tabs' });
  const body = el('div');
  let activeUnit = focusSkill ? SKILL_INDEX[focusSkill].unitId : (sessionStorage.getItem('prob-unit') ?? UNITS[0].id);

  for (const u of UNITS) {
    tabs.append(el('button', {
      class: `tab ${u.id === activeUnit ? 'active' : ''}`,
      onclick: (e) => {
        activeUnit = u.id;
        sessionStorage.setItem('prob-unit', u.id);
        [...tabs.children].forEach((t) => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderUnit();
      },
    }, `${u.icon} ${u.title}`));
  }
  root.append(tabs, body);

  async function renderUnit() {
    body.replaceChildren(el('p', { class: 'muted' }, 'Loading…'));
    let content;
    try {
      content = await loadUnitContent(activeUnit);
    } catch {
      body.replaceChildren(el('div', { class: 'callout warn' },
        el('span', { class: 'co-ico' }, '🚧'),
        el('span', {}, 'This unit’s content file is missing. See data/units/ to add it.')));
      return;
    }
    body.replaceChildren();
    const unit = UNITS.find((u) => u.id === activeUnit);

    for (const skillMeta of unit.skills) {
      const skill = content[skillMeta.id];
      if (!skill?.problems?.length) continue;

      const section = el('div', { class: 'card flat', style: { marginBottom: '14px', borderColor: focusSkill === skillMeta.id ? unit.color : undefined } });
      section.append(el('div', { class: 'card-title' },
        el('span', { class: 't-ico' }, skillMeta.icon),
        el('span', {}, skillMeta.title),
        el('span', { class: 'spacer' }),
        el('small', { class: 'faint' }, `${skill.problems.filter((p) => st.problems[engine.problemKey(p)]?.solved).length}/${skill.problems.length}`)));

      for (const p of skill.problems) {
        section.append(problemRow(p, rerender));
      }
      body.append(section);
      if (focusSkill === skillMeta.id) setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    if (!body.children.length) {
      body.append(el('p', { class: 'muted center' }, 'No problems listed for this unit yet.'));
    }
  }

  renderUnit();
}

function problemRow(p, rerender) {
  const st = getState();
  const key = engine.problemKey(p);
  const rec = st.problems[key];
  const solved = !!rec?.solved;

  const row = el('div', { class: `prob-row ${solved ? 'solved' : ''}` });
  const check = el('button', { class: 'pr-check', 'aria-label': 'toggle solved' }, '✓');
  check.addEventListener('click', () => {
    if (solved) {
      engine.markProblem(p, { solved: false });
      rerender();
    } else {
      askAssisted(p, rerender);
    }
  });

  row.append(check,
    el('div', { style: { flex: 1, minWidth: 0 } },
      el('div', { class: 'pr-name' },
        el('a', { href: p.url, target: '_blank', rel: 'noopener' }, p.name),
        rec?.assisted && !rec.resolved ? el('span', { class: 'pill bad', style: { marginLeft: '8px', fontSize: '0.6rem', padding: '1px 8px' } }, '🧊 re-solve pending') : null),
      el('small', { class: 'faint' }, `${p.platform}${p.id ? ' · ' + p.id : ''}${p.why ? ' — ' + p.why : ''}`)),
    el('div', { class: 'pr-meta' },
      el('span', { class: 'diff-dot ' + (p.difficulty ?? 'easy') }),
      el('small', { class: 'faint' }, p.rating ? `★${p.rating}` : (DIFF_LABEL[p.difficulty] ?? ''))));
  return row;
}

function askAssisted(p, rerender) {
  sfx.click();
  const backdrop = el('div', { class: 'modal-backdrop' });
  const close = () => backdrop.remove();
  backdrop.append(el('div', { class: 'modal center' },
    el('div', { style: { fontSize: '2.6rem' } }, '⚖️'),
    el('h3', {}, 'How did it go?'),
    el('p', { class: 'muted', html: `Be honest — it only changes <em>your</em> schedule. “${esc(p.name)}”` }),
    el('div', { class: 'col mt-2' },
      el('button', { class: 'btn ok block', onclick: () => { engine.markProblem(p, { solved: true, assisted: false }); close(); toast('Solo solve. Clean. 😤', { kind: 'ok', icon: '✅' }); rerender(); } },
        '💪 Solved it myself'),
      el('button', { class: 'btn info block', onclick: () => { engine.markProblem(p, { solved: true, assisted: true }); close(); toast('Logged — cold re-solve scheduled in 14 days 🧊', { icon: '📅' }); rerender(); } },
        '📖 Needed the editorial / hints'),
      el('button', { class: 'btn ghost block', onclick: close }, 'Cancel'))));
  document.body.append(backdrop);
}
