// ============================================================================
// main.js — boot, router, shell (sidebar/tabbar), onboarding
// ============================================================================
import { el } from './util.js';
import { loadState, getState, update, subscribe } from './store.js';
import { setSoundEnabled, sfx } from './audio.js';
import * as srs from './srs.js';
import { renderPath } from './views/path.js';
import { renderReview } from './views/review.js';
import { renderProblems } from './views/problems.js';
import { renderHandbook } from './views/handbook.js';
import { renderStats } from './views/stats.js';
import { renderTeam } from './views/team.js';
import { renderCoach } from './views/coach.js';
import { renderSettings } from './views/settings.js';

const NAV = [
  { id: 'learn',    icon: '🗺️', label: 'Learn',    render: renderPath },
  { id: 'review',   icon: '🧠', label: 'Review',   render: renderReview, badge: (st) => srs.dueSkills(st.srs).length || null },
  { id: 'problems', icon: '🗡️', label: 'Problems', render: renderProblems },
  { id: 'handbook', icon: '📕', label: 'Handbook', render: renderHandbook },
  { id: 'stats',    icon: '📊', label: 'Stats',    render: renderStats },
  { id: 'team',     icon: '👥', label: 'Team',     render: renderTeam },
  { id: 'coach',    icon: '🎓', label: 'Coach',    render: renderCoach },
  { id: 'settings', icon: '⚙️', label: 'Settings', render: renderSettings },
];

const viewEl = document.getElementById('view');

function applyProfile() {
  const p = getState().profile;
  document.documentElement.dataset.theme = p.theme ?? 'dark';
  setSoundEnabled(p.sound !== false);
}

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [page, ...rest] = hash.split('/');
  return { page: NAV.some((n) => n.id === page) ? page : 'learn', args: rest };
}

function renderNav() {
  const st = getState();
  const { page } = currentRoute();
  const make = (host, compact) => {
    host.replaceChildren();
    if (!compact) {
      host.append(el('div', { class: 'logo' },
        el('span', { class: 'logo-mark' }, '🌶️'),
        el('span', {}, 'SAUCE', el('small', {}, 'ACADEMY'))));
    }
    for (const n of NAV) {
      if (compact && ['coach', 'settings', 'team'].includes(n.id) && page !== n.id) {
        if (n.id !== 'team') continue; // keep tabbar to 6 items
      }
      const badge = n.badge?.(st);
      host.append(el('button', {
        class: `nav-item ${page === n.id ? 'active' : ''}`,
        onclick: () => { sfx.click(); location.hash = `#/${n.id}`; },
      },
        el('span', { class: 'nav-ico' }, n.icon),
        el('span', {}, n.label),
        badge ? el('span', { class: 'nav-badge' }, String(badge)) : null));
    }
    if (!compact) {
      host.append(el('div', { class: 'sidebar-foot' },
        `${st.profile.emoji} ${st.profile.name || 'anonymous coder'}`,
        el('br'), `v1 · built for ICPC teams`));
    }
  };
  make(document.getElementById('sidebar'), false);
  make(document.getElementById('tabbar'), true);
}

function route() {
  const { page, args } = currentRoute();
  const nav = NAV.find((n) => n.id === page) ?? NAV[0];
  renderNav();
  viewEl.replaceChildren();
  nav.render(viewEl, () => route(), args);
  window.scrollTo({ top: 0 });
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------
const EMOJIS = ['🌶️', '🦾', '🧙', '🐙', '🦊', '🐯', '🤖', '👾', '🦄', '🐲', '🥷', '🧠'];

function onboard() {
  let name = '';
  let emoji = EMOJIS[0];
  let goal = 50;

  const screen = el('div', { class: 'onboard' });
  const card = el('div', { class: 'ob-card' });
  screen.append(card);

  function step1() {
    const input = el('input', { type: 'text', placeholder: 'your handle (e.g. tourist_jr)', maxlength: 24, style: { width: '100%', textAlign: 'center', fontSize: '1.1rem' } });
    input.addEventListener('input', () => { next.disabled = input.value.trim().length === 0; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) next.click(); });
    const next = el('button', { class: 'btn primary lg block', disabled: true, onclick: () => { name = input.value.trim(); step2(); } }, 'Continue');
    card.replaceChildren(
      el('div', { class: 'ob-logo' }, '🌶️'),
      el('h1', {}, 'SAUCE Academy'),
      el('p', { class: 'muted' }, 'From “hello world” to ICPC regionals. Interactive lessons, spaced reviews, real problems, zero fluff.'),
      el('div', { class: 'ob-options' }, input),
      next);
    setTimeout(() => input.focus(), 80);
  }

  function step2() {
    const grid = el('div', { class: 'row wrap', style: { justifyContent: 'center' } });
    EMOJIS.forEach((e2) => {
      const b = el('button', { class: 'icon-btn', style: { fontSize: '1.5rem', width: '52px', height: '52px' }, onclick: () => { emoji = e2; [...grid.children].forEach((c) => (c.style.borderColor = 'var(--border)')); b.style.borderColor = 'var(--brand)'; } }, e2);
      if (e2 === emoji) b.style.borderColor = 'var(--brand)';
      grid.append(b);
    });
    card.replaceChildren(
      el('h2', {}, `Pick your avatar, ${name}`),
      el('div', { class: 'ob-options' }, grid),
      el('button', { class: 'btn primary lg block', onclick: step3 }, 'Continue'));
  }

  function step3() {
    const goals = [
      { xp: 30, label: 'Chill — 30 XP/day', desc: '~1 lesson. Habit first.' },
      { xp: 50, label: 'Serious — 50 XP/day', desc: '~2 lessons. The default.' },
      { xp: 100, label: 'Insane — 100 XP/day', desc: 'Regionals are coming.' },
    ];
    const opts = el('div', { class: 'ob-options' });
    goals.forEach((g) => {
      const b = el('button', { class: `opt ${g.xp === goal ? 'selected' : ''}`, onclick: () => { goal = g.xp; [...opts.children].forEach((c) => c.classList.remove('selected')); b.classList.add('selected'); } },
        el('span', { class: 'opt-key' }, '⚡'),
        el('span', {}, el('strong', {}, g.label), el('br'), el('small', { class: 'muted' }, g.desc)));
      opts.append(b);
    });
    card.replaceChildren(
      el('h2', {}, 'Daily XP goal'),
      el('p', { class: 'muted' }, 'Days you hit any XP extend your streak. Goals keep you honest.'),
      opts,
      el('button', { class: 'btn primary lg block', onclick: finish }, 'Let’s cook 🌶️'));
  }

  function finish() {
    update((st) => {
      st.profile.name = name;
      st.profile.emoji = emoji;
      st.profile.dailyGoal = goal;
      st.onboarded = true;
    });
    screen.remove();
    route();
  }

  step1();
  document.body.append(screen);
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
loadState();
applyProfile();
subscribe(() => { applyProfile(); renderNav(); });
window.addEventListener('hashchange', route);

if (!getState().onboarded) {
  renderNav();
  onboard();
} else {
  route();
}
