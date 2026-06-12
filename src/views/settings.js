// ============================================================================
// views/settings.js — profile, preferences, data management
// ============================================================================
import { el, todayStr, downloadText } from '../util.js';
import { getState, update, exportJSON, importJSON, resetAll } from '../store.js';
import { toast } from '../fx.js';

export function renderSettings(root, rerender) {
  const st = getState();

  root.replaceChildren(el('h1', {}, '⚙️ Settings'));

  // profile
  const name = el('input', { type: 'text', value: st.profile.name, maxlength: 24 });
  const emoji = el('input', { type: 'text', value: st.profile.emoji, maxlength: 4, style: { width: '70px', textAlign: 'center' } });
  const goal = el('select', {},
    ...[30, 50, 100, 150].map((g) => {
      const o = el('option', { value: g }, `${g} XP / day`);
      if (g === st.profile.dailyGoal) o.selected = true;
      return o;
    }));

  root.append(card('👤 Profile', [
    row('Handle', name),
    row('Avatar emoji', emoji),
    row('Daily goal', goal),
    el('button', { class: 'btn primary sm', onclick: () => {
      update((s) => {
        s.profile.name = name.value.trim() || s.profile.name;
        s.profile.emoji = emoji.value.trim() || s.profile.emoji;
        s.profile.dailyGoal = Number(goal.value);
      });
      toast('Saved ✓', { kind: 'ok' });
      rerender();
    } }, 'Save'),
  ]));

  // appearance & sound
  const themeBtn = el('button', { class: 'btn ghost sm', onclick: () => {
    update((s) => { s.profile.theme = s.profile.theme === 'dark' ? 'light' : 'dark'; });
    rerender();
  } }, st.profile.theme === 'dark' ? '🌙 Dark (tap for light)' : '☀️ Light (tap for dark)');

  const soundBtn = el('button', { class: 'btn ghost sm', onclick: () => {
    update((s) => { s.profile.sound = !(s.profile.sound !== false); });
    rerender();
  } }, st.profile.sound !== false ? '🔊 Sounds on' : '🔇 Sounds off');

  root.append(card('🎨 Appearance', [el('div', { class: 'row wrap' }, themeBtn, soundBtn)]));

  // runner
  const piston = el('input', { type: 'url', value: st.profile.pistonUrl, style: { width: '100%', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)' } });
  root.append(card('🧪 Code runner', [
    el('p', { class: 'muted', style: { fontSize: 'var(--fs-sm)' } },
      'Endpoint for compiling C++ in code exercises & the playground. Default is the free public Piston API (rate-limited). Self-host Piston and point this at it for team use.'),
    piston,
    el('button', { class: 'btn primary sm mt-1', onclick: () => {
      update((s) => { s.profile.pistonUrl = piston.value.trim(); });
      toast('Runner endpoint saved ✓', { kind: 'ok' });
    } }, 'Save endpoint'),
  ]));

  // data
  const importInput = el('input', { type: 'file', accept: '.json', class: 'hidden' });
  importInput.addEventListener('change', async () => {
    const f = importInput.files?.[0];
    if (!f) return;
    const err = importJSON(await f.text());
    if (err) toast(err, { kind: 'bad', icon: '⚠️' });
    else { toast('Progress imported 💾', { kind: 'ok' }); rerender(); }
  });

  root.append(card('💾 Data', [
    el('p', { class: 'muted', style: { fontSize: 'var(--fs-sm)' } },
      'Everything lives in this browser’s localStorage. Export regularly — clearing site data clears your streak.'),
    el('div', { class: 'row wrap' },
      el('button', { class: 'btn info sm', onclick: () => {
        downloadText(`sauce-backup-${todayStr()}.json`, exportJSON());
        toast('Backup downloaded 📤', { kind: 'ok' });
      } }, '📤 Export backup'),
      el('button', { class: 'btn ghost sm', onclick: () => importInput.click() }, '📥 Restore backup'),
      importInput,
      el('button', { class: 'btn bad sm', onclick: () => {
        if (confirm('Reset ALL progress? XP, streak, mastery — everything. This cannot be undone.')
          && confirm('Seriously: this deletes your streak. Export a backup first?') === true) {
          resetAll();
          location.hash = '#/learn';
          location.reload();
        }
      } }, '☢️ Reset everything')),
  ]));

  root.append(el('p', { class: 'faint center mt-3' },
    'SAUCE Academy · built on the SAUCE handbook · Apache-2.0'));
}

function card(title, children) {
  return el('div', { class: 'card mb-2' },
    el('div', { class: 'card-title' }, title),
    ...children);
}

function row(label, control) {
  return el('div', { class: 'row', style: { marginBottom: '10px' } },
    el('span', { style: { width: '130px', fontWeight: 700, fontSize: 'var(--fs-sm)' } }, label),
    control);
}
