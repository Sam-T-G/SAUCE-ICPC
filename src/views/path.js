// ============================================================================
// views/path.js — the Learn tab: a single winding path through all units.
// One obvious "next thing to do" (Duolingo 2022 path rationale) + jump-ahead
// unit tests as the pressure valve for strong users.
// ============================================================================
import { el, ring } from '../util.js';
import { UNITS } from '../../data/curriculum.js';
import { getState } from '../store.js';
import * as engine from '../engine.js';
import * as srs from '../srs.js';
import { startSession } from './lesson.js';
import { sfx } from '../audio.js';
import { toast } from '../fx.js';

const WIND = [0, 1, 2, 1, 0, -1, -2, -1]; // path meander, in 44px steps

export function renderPath(root, rerender) {
  const st = getState();
  const cur = engine.currentSkill(st);
  const due = srs.dueSkills(st.srs).length;
  const mistakes = Object.values(st.missed).reduce((a, m) => a + m.length, 0);

  root.replaceChildren();
  root.append(metabar(st));

  // review nudge — spacing is the whole game
  if (due > 0) {
    root.append(el('div', { class: 'card', style: { borderColor: 'var(--violet, #a06bff)', marginBottom: '14px' } },
      el('div', { class: 'row wrap' },
        el('span', { style: { fontSize: '1.6rem' } }, '🧠'),
        el('div', { style: { flex: 1, minWidth: '180px' } },
          el('div', { style: { fontWeight: 800 } }, `${due} skill${due > 1 ? 's' : ''} due for review`),
          el('small', {}, 'Memories decay on a schedule. Reviews pay 1.2× XP.')),
        el('button', { class: 'btn primary', onclick: () => startSession('review', {}, rerender) }, 'Review now'))));
  } else if (mistakes > 0) {
    root.append(el('div', { class: 'card flat', style: { marginBottom: '14px' } },
      el('div', { class: 'row wrap' },
        el('span', { style: { fontSize: '1.4rem' } }, '🩹'),
        el('div', { style: { flex: 1, minWidth: '180px' } },
          el('div', { style: { fontWeight: 800 } }, `${mistakes} missed exercise${mistakes > 1 ? 's' : ''} in your mistake bank`),
          el('small', {}, 'Clear them while they’re fresh.')),
        el('button', { class: 'btn info', onclick: () => startSession('mistakes', {}, rerender) }, 'Fix mistakes'))));
  }

  let flyout = null;
  let openSkill = null;

  for (const unit of UNITS) {
    const prog = engine.unitProgress(unit.id, st);
    const unlocked = engine.isUnitUnlocked(unit.id, st);
    const testInfo = st.unitTests[unit.id];

    const testBtn = el('button', {
      class: 'btn sm',
      onclick: () => {
        sfx.click();
        startSession('unittest', { unitId: unit.id }, (summary) => {
          if (summary?.passed) toast(`Unit unlocked: <strong>${unit.title}</strong>`, { kind: 'gold', icon: '🎓' });
          rerender();
        });
      },
    }, testInfo?.passed ? '✓ passed' : unlocked ? '🎓 unit test' : '⤴ jump ahead');

    root.append(el('div', { class: 'unit-header', style: { background: `linear-gradient(135deg, ${unit.color}, ${unit.color}bb)` } },
      el('span', { class: 'uh-ico' }, unit.icon),
      el('div', {},
        el('div', { class: 'uh-kicker' }, `Unit ${Number(unit.id.slice(1))} · ${prog.done}/${prog.total} ✦`),
        el('div', { class: 'uh-title' }, unit.title),
        el('div', { style: { fontSize: 'var(--fs-xs)', opacity: 0.85 } }, unit.tagline)),
      el('div', { class: 'uh-actions' }, testBtn)));

    const pathEl = el('div', { class: 'path' });
    unit.skills.forEach((skill, i) => {
      const m = engine.masteryOf(skill.id, st);
      const skillUnlocked = engine.isSkillUnlocked(skill.id, st);
      const isCurrent = skill.id === cur;
      const wind = WIND[i % WIND.length] * 44;
      const rec = st.srs[skill.id];
      const bars = rec ? srs.strengthBars(rec) : null;

      const node = el('button', {
        class: `skill-node ${!skillUnlocked ? 'locked' : ''} ${m.level >= 5 ? 'legendary' : m.level >= 3 ? 'done' : ''}`,
        style: { transform: `translateX(${wind}px)` },
        onclick: () => toggleFlyout(skill, unit, node),
      });

      const circle = el('div', { class: 'sn-circle', style: skillUnlocked && m.level < 3 ? { background: unit.color } : {} },
        skillUnlocked ? skill.icon : '🔒');
      if (skillUnlocked) {
        const pct = m.level / 5;
        const ringEl = el('div', { class: 'sn-ring' });
        ringEl.append(ring(pct, { size: 90, stroke: 5, color: m.level >= 5 ? 'var(--gold)' : '#ffffff88', label: '' }));
        node.append(ringEl);
      }
      node.append(circle);
      if (m.level > 0) node.append(el('span', { class: 'sn-crowns' }, '👑', String(m.level)));
      if (isCurrent && skillUnlocked) node.append(el('span', { class: 'sn-start' }, m.level === 0 ? 'START' : 'CONTINUE'));
      node.append(el('span', { class: 'sn-label' },
        skill.title,
        bars !== null && bars <= 1 && m.level > 0 ? el('span', { style: { color: 'var(--warn)' } }, ' ⚠') : null));

      const row = el('div', { class: 'path-row' }, node);
      pathEl.append(row);
    });
    root.append(pathEl);

    function toggleFlyout(skill, unit2, node) {
      sfx.click();
      flyout?.remove();
      if (openSkill === skill.id) { openSkill = null; flyout = null; return; }
      openSkill = skill.id;
      flyout = buildFlyout(skill, unit2, rerender);
      node.closest('.path-row').after(flyout);
      flyout.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // finale
  root.append(el('div', { class: 'center', style: { padding: '40px 0 30px' } },
    el('div', { style: { fontSize: '3rem' } }, '🏆'),
    el('h3', {}, 'ICPC Regionals'),
    el('p', { class: 'muted' }, 'The path ends where the contest begins. Go make the scoreboard interesting.')));
}

function buildFlyout(skill, unit, rerender) {
  const st = getState();
  const m = engine.masteryOf(skill.id, st);
  const unlocked = engine.isSkillUnlocked(skill.id, st);
  const rec = st.srs[skill.id];
  const bars = rec ? srs.strengthBars(rec) : null;

  const fly = el('div', { class: 'skill-flyout', style: { background: `linear-gradient(140deg, ${unit.color}, ${unit.color}cc)` } });
  fly.append(
    el('div', { class: 'sf-title' }, `${skill.icon} ${skill.title}`),
    el('div', { class: 'sf-blurb' }, skill.blurb));

  const metaRow = el('div', { class: 'sf-meta' });
  metaRow.append(el('span', { class: 'pill' }, `👑 level ${m.level}/5`));
  if (bars !== null) metaRow.append(el('span', { class: 'pill' }, `${['🪫 critical', '🪫 fading', '🔋 ok', '🔋 strong', '⚡ fresh'][bars]}`));
  if (m.level >= 5) metaRow.append(el('span', { class: 'pill' }, '✨ legendary'));
  fly.append(metaRow);

  const actions = el('div', { class: 'col' });
  if (!unlocked) {
    actions.append(el('div', { class: 'callout', style: { background: 'rgba(0,0,0,.25)', border: 'none', color: '#fff' } },
      el('span', { class: 'co-ico' }, '🔒'),
      el('span', {}, 'Finish the previous skill (or pass this unit’s test via “jump ahead”) to unlock.')));
  } else if (m.level === 0) {
    actions.append(el('button', { class: 'btn primary block lg', onclick: () => startSession('learn', { skillId: skill.id }, rerender) }, '📖 Learn'));
  } else {
    if (m.level < 4) {
      const gateNote = m.level === 3 && m.lastLevelDay === new Date().toLocaleDateString('en-CA')
        ? ' (level 4 needs a fresh day — spacing beats cramming)' : '';
      actions.append(el('button', { class: 'btn primary block lg', onclick: () => startSession('practice', { skillId: skill.id }, rerender) },
        `💪 Practice — level ${m.level} → ${Math.min(4, m.level + 1)}${gateNote}`));
    } else if (m.level === 4) {
      actions.append(
        el('button', { class: 'btn gold block lg', onclick: () => startSession('legendary', { skillId: skill.id }, rerender) }, '👑 Legendary challenge'),
        el('button', { class: 'btn ghost block', onclick: () => startSession('practice', { skillId: skill.id }, rerender) }, '💪 Casual practice'));
    } else {
      actions.append(el('button', { class: 'btn ghost block', onclick: () => startSession('practice', { skillId: skill.id }, rerender) }, '💪 Practice (legendary ✨)'));
    }
    actions.append(el('button', { class: 'btn ghost block', onclick: () => { location.hash = `#/problems/${skill.id}`; } }, '🗡️ Real problems'));
    if (m.level >= 1) {
      actions.append(el('button', { class: 'btn ghost block', onclick: () => startSession('learn', { skillId: skill.id }, rerender) }, '📖 Re-read theory'));
    }
  }
  fly.append(actions);
  return fly;
}

function metabar(st) {
  const rank = engine.rankFor(st.xp.total);
  const goal = st.profile.dailyGoal || 50;
  const today = engine.xpToday(st);
  const alive = engine.streakAlive(st);

  return el('div', { class: 'metabar' },
    el('span', { class: 'pill streak', 'data-tip': st.streak.freezes ? `${st.streak.freezes} streak freeze${st.streak.freezes > 1 ? 's' : ''} banked` : 'practice daily to build your streak' },
      el('span', { class: 'p-ico' }, alive && st.streak.current > 0 ? '🔥' : '🧊'),
      `${st.streak.current} day${st.streak.current === 1 ? '' : 's'}`),
    el('span', { class: 'pill xp', 'data-tip': `daily goal: ${goal} XP` },
      el('span', { class: 'p-ico' }, '⚡'),
      `${today}/${goal} XP today`),
    el('span', { class: 'pill gem', 'data-tip': `${st.xp.total} total XP`, style: { color: rank.color, borderColor: rank.color + '55' } },
      el('span', { class: 'p-ico' }, '🏅'),
      rank.name),
  );
}
