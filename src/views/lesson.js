// ============================================================================
// views/lesson.js — the full-screen session player.
//
// Implements the Duolingo-derived loop with the pedagogy guarantees:
//  • theory cards first (learn sessions), then exercises
//  • immediate elaborated feedback on EVERY answer (explain field is required)
//  • missed exercises re-queue until answered correctly (max 2 retries each)
//  • sessions end on a win; celebration screen with stats
//  • legendary mode: no hints, 3-mistake budget, timer
//  • interleaved review items are tagged "REVIEW" without naming the skill —
//    recognizing the technique is the exercise (tags hidden, see PEDAGOGY.md)
// ============================================================================
import { el, md, esc, clamp, fmtDuration } from '../util.js';
import { codeBlock } from '../highlight.js';
import { renderExercise, TYPE_LABELS } from '../exercises.js';
import { buildSession, gradeSession, rankFor } from '../engine.js';
import { getState } from '../store.js';
import { SKILL_INDEX } from '../../data/curriculum.js';
import { sfx } from '../audio.js';
import { confetti, celebrate, floatXP, toast } from '../fx.js';

const LEGENDARY_BUDGET = 3;

export async function startSession(kind, opts = {}, onDone = () => {}) {
  let session;
  try {
    session = await buildSession(kind, opts);
  } catch (e) {
    toast(`Could not start session: ${esc(e.message)}`, { kind: 'bad', icon: '⚠️' });
    return;
  }
  if (!session.items.length) {
    toast('Nothing to practice here yet — go learn something new! 🌱', { icon: '🌵' });
    return;
  }

  const overlay = document.getElementById('overlay');
  const screen = el('div', { class: 'lesson-screen' });
  overlay.replaceChildren(screen);

  const startedAt = Date.now();
  const queue = session.items.map((it, i) => ({ ...it, slot: i, attempts: 0 }));
  const results = new Map(); // slot → { skillId, exId, type, diff, correct, eventuallyCorrect }
  let totalSlots = queue.length;
  let doneSlots = 0;
  let combo = 0;
  let bestCombo = 0;
  let mistakes = 0;
  let quitConfirm = null;
  let current = null;     // { item, ctl }
  let footPrimary = null; // current primary button (Enter target)

  // ---------- chrome ----------
  const bar = el('div', { class: 'progress', style: { flex: 1 } }, el('div', { class: 'fill', style: { width: '0%' } }));
  const comboEl = el('span', { class: 'lt-combo' }, '');
  const quitBtn = el('button', { class: 'lt-quit', 'aria-label': 'quit', onclick: confirmQuit }, '✕');
  const top = el('div', { class: 'lesson-top' }, quitBtn, bar, comboEl);
  const body = el('div', { class: 'lesson-body' });
  const foot = el('div', { class: 'lesson-foot' });
  screen.append(top, body, foot);

  const keyHandler = (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      footPrimary?.click();
    } else if (/^[1-9]$/.test(e.key) && current?.ctl?.keypick && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      current.ctl.keypick(Number(e.key) - 1);
    }
  };
  document.addEventListener('keydown', keyHandler);

  function cleanup() {
    document.removeEventListener('keydown', keyHandler);
    overlay.replaceChildren();
  }

  function confirmQuit() {
    if (quitConfirm) return;
    quitConfirm = el('div', { class: 'modal-backdrop' },
      el('div', { class: 'modal center' },
        el('div', { style: { fontSize: '3rem' } }, '🫠'),
        el('h3', {}, 'Leave the session?'),
        el('p', { class: 'muted' }, 'Progress in this session won’t be saved. The streak gods are watching.'),
        el('div', { class: 'col', style: { marginTop: '14px' } },
          el('button', { class: 'btn primary block', onclick: () => { quitConfirm.remove(); quitConfirm = null; } }, 'Keep going'),
          el('button', { class: 'btn ghost block', onclick: () => { cleanup(); onDone(null); } }, 'Quit'))));
    screen.append(quitConfirm);
  }

  function setProgress() {
    bar.firstChild.style.width = `${(doneSlots / totalSlots) * 100}%`;
  }

  // ---------- theory cards (learn sessions) ----------
  if (session.kind === 'learn' && session.theory?.length) {
    await showTheory(session.theory, opts.skillId);
  }

  // ---------- legendary timer ----------
  let timerEl = null;
  if (kind === 'legendary') {
    timerEl = el('span', { class: 'pill gold', style: { fontVariantNumeric: 'tabular-nums' } }, '⏱ 0:00');
    top.insertBefore(timerEl, comboEl);
    setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      timerEl.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
  }

  // ---------- exercise loop ----------
  function showTheory(cards, skillId) {
    return new Promise((resolve) => {
      let idx = 0;
      const meta = SKILL_INDEX[skillId];
      function renderCard() {
        const c = cards[idx];
        const card = el('div', { class: 'theory-card card pad-lg' },
          el('div', { class: 'tc-step' }, `${meta?.icon ?? '📘'} ${meta?.title ?? 'Learn'} — concept ${idx + 1} of ${cards.length}`),
          el('h3', {}, c.h),
          el('div', { class: 'tc-body', html: md(c.md) }),
          c.code ? codeBlock(c.code) : null,
          c.note ? el('div', { class: `callout ${c.noteKind ?? 'tip'}` }, el('span', { class: 'co-ico' }, c.noteKind === 'warn' ? '⚠️' : c.noteKind === 'danger' ? '🚨' : '💡'), el('span', { html: md(c.note) })) : null,
        );
        body.replaceChildren(el('div', { class: 'ex-wrap' }, card));
        bar.firstChild.style.width = `${((idx + 1) / (cards.length + 1)) * 25}%`;

        const dots = el('div', { class: 'dots' }, cards.map((_, i) => el('span', { class: `dot ${i === idx ? 'on' : ''}` })));
        const back = el('button', { class: 'btn ghost', disabled: idx === 0, onclick: () => { idx--; renderCard(); } }, '← Back');
        const next = el('button', { class: 'btn primary lg' }, idx === cards.length - 1 ? 'Start practicing →' : 'Continue');
        next.addEventListener('click', () => {
          sfx.click();
          if (idx === cards.length - 1) resolve();
          else { idx++; renderCard(); }
        });
        footPrimary = next;
        foot.className = 'lesson-foot';
        foot.replaceChildren(el('div', { class: 'lf-inner' }, back, el('div', { class: 'spacer center' }, dots), next));
      }
      renderCard();
    });
  }

  function kicker(item) {
    const label = TYPE_LABELS[item.ex.type] ?? 'Exercise';
    const bits = [el('span', {}, label)];
    if (item.isReview) bits.push(el('span', { class: 'ek-review' }, '· 🔁 review — which technique is this?'));
    else if (item.attempts > 0) bits.push(el('span', { class: 'ek-new' }, '· second chance'));
    return el('div', { class: 'ex-kicker' }, bits);
  }

  function nextExercise() {
    const item = queue.shift();
    if (!item) return finish();

    const wrap = el('div', { class: 'ex-wrap' });
    const exRoot = el('div');
    wrap.append(kicker(item), exRoot);
    body.replaceChildren(wrap);
    body.scrollTop = 0;

    let ready = false;
    const checkBtn = el('button', { class: 'btn ok lg', disabled: true }, 'Check');
    const skipBtn = el('button', { class: 'btn ghost', onclick: () => submit(true) }, 'Skip');
    const hintBtn = (item.ex.hint && kind !== 'legendary')
      ? el('button', { class: 'btn ghost', onclick: () => {
          hintBtn.replaceWith(el('div', { class: 'lf-hint', html: '💡 ' + md(item.ex.hint) }));
        } }, '💡 Hint')
      : null;

    const ctl = renderExercise(exRoot, item.ex, {
      setReady(v) { ready = v; checkBtn.disabled = !v; },
    });
    current = { item, ctl };
    setTimeout(() => ctl.focus(), 60);

    foot.className = 'lesson-foot';
    foot.replaceChildren(el('div', { class: 'lf-inner' }, skipBtn, hintBtn, el('span', { class: 'spacer' }), checkBtn));
    footPrimary = checkBtn;

    checkBtn.addEventListener('click', () => { if (ready) submit(false); });

    function submit(skipped) {
      const verdict = skipped ? { correct: false, skipped: true } : ctl.check();
      ctl.lock();
      const r = results.get(item.slot) ?? {
        skillId: item.skillId, exId: item.ex.id, type: item.ex.type,
        diff: item.ex.diff ?? 2, correct: false, eventuallyCorrect: false,
      };

      if (verdict.correct) {
        if (item.attempts === 0) { r.correct = true; combo++; bestCombo = Math.max(bestCombo, combo); }
        else { r.eventuallyCorrect = true; combo = 0; }
        doneSlots++;
        sfx.correct();
        if (combo >= 3) sfx.combo(combo);
        floatXP(item.attempts === 0 ? 10 + ({ 1: 0, 2: 2, 3: 5 }[clamp(item.ex.diff ?? 2, 1, 3)]) : 5, checkBtn);
      } else {
        combo = 0;
        mistakes++;
        sfx.wrong();
        if (item.attempts < 2 && !skipped && kind !== 'legendary' && kind !== 'unittest') {
          // re-queue near the end — you must clear your mistakes to finish
          queue.push({ ...item, attempts: item.attempts + 1 });
          totalSlots++;
        } else {
          doneSlots++; // out of retries (or test mode): move on
        }
        if (skipped || item.attempts >= 2) ctl.reveal();
      }
      results.set(item.slot, r);
      comboEl.textContent = combo >= 2 ? `🔥 ${combo}` : '';
      setProgress();

      // legendary failure gate
      if (kind === 'legendary' && mistakes >= LEGENDARY_BUDGET && !verdict.correct) {
        return legendaryFailed();
      }
      showFeedback(item, verdict);
    }
  }

  function showFeedback(item, verdict) {
    const ok = !!verdict.correct;
    const meta = SKILL_INDEX[item.skillId];
    const title = ok
      ? ['Nice!', 'Correct!', 'Clean.', 'AC ✓', 'Exactly right.'][(Math.random() * 5) | 0]
      : verdict.skipped ? 'Skipped' : ['Not quite.', 'WA — read why:', 'Close, but no.'][(Math.random() * 3) | 0];

    const explain = item.ex.explain ? md(item.ex.explain) : '';
    const revealNote = item.isReview && meta ? `<br><em>That was <strong>${esc(meta.icon)} ${esc(meta.title)}</strong> making a comeback.</em>` : '';
    const detail = verdict.detail ? `<br><em>${esc(verdict.detail)}</em>` : '';

    const contBtn = el('button', { class: `btn ${ok ? 'ok' : 'bad'} lg` }, 'Continue');
    contBtn.addEventListener('click', () => { sfx.click(); nextExercise(); });
    footPrimary = contBtn;

    foot.className = `lesson-foot ${ok ? 'state-ok' : 'state-bad'}`;
    foot.replaceChildren(el('div', { class: 'lf-inner' },
      el('div', { class: 'lf-verdict' },
        el('div', { class: 'v-ico' }, ok ? '✅' : verdict.skipped ? '⏭️' : '❌'),
        el('div', {},
          el('div', { class: 'v-title' }, title),
          el('div', { class: 'v-expl', html: explain + detail + revealNote }))),
      contBtn));
    contBtn.focus();
  }

  function legendaryFailed() {
    body.replaceChildren(el('div', { class: 'lesson-done' },
      el('div', { class: 'ld-emoji' }, '💔'),
      el('h2', {}, 'Legendary run failed'),
      el('p', { class: 'muted' }, `${LEGENDARY_BUDGET} mistakes — the crown slips away. Review the skill and try again; legends are built on retries.`),
      el('div', { class: 'row' },
        el('button', { class: 'btn ghost', onclick: () => { cleanup(); onDone(null); } }, 'Back'),
        el('button', { class: 'btn gold', onclick: () => { cleanup(); startSession('legendary', opts, onDone); } }, 'Retry challenge'))));
    foot.replaceChildren();
  }

  function finish() {
    const durationMs = Date.now() - startedAt;
    const list = [...results.values()];
    const firstTry = list.filter((r) => r.correct).length;
    const acc = list.length ? firstTry / list.length : 0;
    const perfect = list.length > 0 && list.every((r) => r.correct);
    const passed = kind === 'legendary' ? mistakes < LEGENDARY_BUDGET
      : kind === 'unittest' ? acc >= 0.8 : undefined;

    const summary = gradeSession({
      kind, skillId: session.skillId, unitId: session.unitId,
      durationMs, comboBest: bestCombo, passed,
    }, list);

    // celebration
    if (perfect || passed) celebrate(); else confetti({ count: 50 });
    sfx.fanfare();

    const stats = [
      { label: 'XP earned', val: `⚡ ${summary.xp}`, color: 'var(--xp)' },
      { label: 'Accuracy', val: `${Math.round(acc * 100)}%`, color: acc >= 0.8 ? 'var(--ok)' : 'var(--warn)' },
      { label: 'Time', val: fmtDuration(durationMs), color: 'var(--info)' },
    ];
    if (bestCombo >= 3) stats.push({ label: 'Best combo', val: `🔥 ${bestCombo}`, color: 'var(--streak)' });

    const headline =
      kind === 'unittest' ? (passed ? '🎓 Unit test passed!' : '📚 Not yet — 80% needed') :
      kind === 'legendary' ? (passed ? '👑 LEGENDARY!' : 'Legendary failed') :
      perfect ? '💎 Perfect session!' :
      acc >= 0.8 ? 'Great session!' : 'Session complete — mistakes logged for review';

    const sub =
      summary.leveled.length ? `⬆️ ${summary.leveled.map((l) => `${SKILL_INDEX[l.skillId]?.title ?? l.skillId} → level ${l.level}`).join(' · ')}`
      : (kind === 'review' ? 'Reviews pay 1.2× XP — your future self thanks you.' : '');

    body.replaceChildren(el('div', { class: 'lesson-done' },
      el('div', { class: 'ld-emoji' }, kind === 'legendary' && passed ? '👑' : perfect ? '💎' : acc >= 0.8 ? '🎉' : '🌱'),
      el('h2', {}, headline),
      sub ? el('p', { class: 'muted' }, sub) : null,
      el('div', { class: 'ld-stats' }, stats.map((s) =>
        el('div', { class: 'ld-stat', style: { background: s.color } },
          el('div', { class: 'ld-stat-label' }, s.label),
          el('div', { class: 'ld-stat-val' }, s.val)))),
      summary.streak?.extended ? el('div', { class: 'pill streak', style: { fontSize: '1rem' } }, `🔥 streak: ${getState().streak.current} ${getState().streak.current === 1 ? 'day' : 'days'}`) : null,
      el('button', { class: 'btn primary lg', onclick: () => { cleanup(); onDone(summary); } }, 'Continue'),
    ));
    foot.replaceChildren();
    footPrimary = body.querySelector('.btn.primary');

    // toasts for badges & rank-ups
    for (const b of summary.badges) {
      toast(`Badge earned: <strong>${esc(b.icon)} ${esc(b.name)}</strong>`, { kind: 'gold', icon: '🏅', ms: 4200 });
    }
    if (summary.rankBefore !== summary.rankAfter) {
      sfx.levelup();
      toast(`Rank up! You are now <strong>${esc(summary.rankAfter)}</strong>`, { kind: 'gold', icon: '🏆', ms: 5000 });
    }
  }

  setProgress();
  nextExercise();
}
