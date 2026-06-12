// ============================================================================
// exercises.js — interactive exercise widgets.
//
// Types implement the evidence-backed practice ladder (docs/PEDAGOGY.md):
//   tracing (output, mcq over code)  →  Parsons / token-bank completion
//   →  typed recall (fill)           →  free code writing (code)
//
// Each renderer returns a controller:
//   { check(): {correct, detail?}, lock(), reveal(), focus() }
// and calls ctx.setReady(bool) when the answer becomes checkable.
// ============================================================================
import { el, esc, md, shuffle, answerMatches, normalizeOutput, codeMatches } from './util.js';
import { codeBlock, highlightCpp } from './highlight.js';
import { sfx } from './audio.js';
import { runCpp } from './runner.js';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function promptBlock(ex) {
  const wrap = el('div');
  wrap.append(el('div', { class: 'ex-prompt', html: md(ex.prompt) }));
  if (ex.code) wrap.append(codeBlock(ex.code, { copy: false, lineNumbers: !!ex.lineNumbers }));
  return wrap;
}

function optionRow(label, idx, onpick) {
  const keyHint = idx < 9 ? String(idx + 1) : '';
  const btn = el('button', { class: 'opt', type: 'button', onclick: () => onpick(btn) },
    el('span', { class: 'opt-key' }, keyHint),
  );
  const body = el('span', { style: { flex: '1', minWidth: '0' } });
  if (/\n/.test(label) || /^`{3}/.test(label)) {
    const code = label.replace(/^```(cpp)?\n?/, '').replace(/```$/, '');
    body.append(codeBlock(code, { copy: false }));
  } else {
    body.innerHTML = md(label);
  }
  btn.append(body);
  return btn;
}

// ---------------------------------------------------------------------------
// MCQ (also used for tf) — single choice
// ---------------------------------------------------------------------------
function renderMCQ(root, ex, ctx) {
  let selected = -1;
  let locked = false;
  const options = ex._shuffled ?? ex.options.map((o, i) => ({ o, i }));
  const list = el('div', { class: 'opt-list' });
  const buttons = options.map(({ o }, vi) =>
    optionRow(o, vi, (btn) => {
      if (locked) return;
      sfx.click();
      selected = vi;
      buttons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      ctx.setReady(true);
    })
  );
  buttons.forEach((b) => list.append(b));
  root.append(promptBlock(ex), list);

  const correctVi = options.findIndex(({ i }) => i === ex.answer);

  return {
    keypick(n) { if (!locked && buttons[n]) buttons[n].click(); },
    check() {
      locked = true;
      const correct = selected === correctVi;
      buttons[selected]?.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) buttons[correctVi]?.classList.add('correct');
      buttons.forEach((b, i) => { if (i !== selected && i !== correctVi) b.classList.add('dim'); });
      return { correct };
    },
    lock() { locked = true; },
    reveal() { buttons[correctVi]?.classList.add('correct'); },
    focus() {},
  };
}

/** Pre-shuffle options once per exercise instance (stable across re-render). */
function withShuffledOptions(ex) {
  if (ex.noShuffle) return { ...ex, _shuffled: ex.options.map((o, i) => ({ o, i })) };
  return { ...ex, _shuffled: shuffle(ex.options.map((o, i) => ({ o, i }))) };
}

// ---------------------------------------------------------------------------
// Multi-select
// ---------------------------------------------------------------------------
function renderMulti(root, ex, ctx) {
  let locked = false;
  const picked = new Set();
  const options = ex._shuffled;
  const list = el('div', { class: 'opt-list' });
  const buttons = options.map(({ o }, vi) =>
    optionRow(o, vi, (btn) => {
      if (locked) return;
      sfx.click();
      if (picked.has(vi)) { picked.delete(vi); btn.classList.remove('selected'); }
      else { picked.add(vi); btn.classList.add('selected'); }
      ctx.setReady(picked.size > 0);
    })
  );
  buttons.forEach((b) => list.append(b));
  root.append(promptBlock(ex), el('div', { class: 'muted', style: { marginBottom: '8px' } }, 'Select all that apply.'), list);

  const answerSet = new Set(ex.answers);
  return {
    keypick(n) { if (!locked && buttons[n]) buttons[n].click(); },
    check() {
      locked = true;
      let correct = picked.size === answerSet.size;
      options.forEach(({ i }, vi) => {
        const isAns = answerSet.has(i);
        const isPicked = picked.has(vi);
        if (isAns) buttons[vi].classList.add(isPicked ? 'correct' : 'wrong');
        else if (isPicked) { buttons[vi].classList.add('wrong'); correct = false; }
        if (isAns !== isPicked) correct = false;
      });
      return { correct };
    },
    lock() { locked = true; },
    reveal() { options.forEach(({ i }, vi) => { if (answerSet.has(i)) buttons[vi].classList.add('correct'); }); },
    focus() {},
  };
}

// ---------------------------------------------------------------------------
// Fill — typed answer
// ---------------------------------------------------------------------------
function renderFill(root, ex, ctx) {
  const input = el('input', {
    class: 'fill-input',
    type: 'text',
    placeholder: ex.placeholder ?? 'type your answer…',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    oninput: () => ctx.setReady(input.value.trim().length > 0),
  });
  root.append(promptBlock(ex), input);

  return {
    check() {
      const correct = answerMatches(input.value, ex.answer);
      input.classList.add(correct ? 'correct' : 'wrong');
      input.disabled = true;
      return { correct, given: input.value };
    },
    lock() { input.disabled = true; },
    reveal() {
      const ans = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      root.append(el('div', { class: 'callout info', style: { marginTop: '10px' } },
        el('span', { class: 'co-ico' }, '✔️'),
        el('span', { html: `Answer: <code>${esc(ans)}</code>` })));
    },
    focus() { input.focus(); },
  };
}

// ---------------------------------------------------------------------------
// Output — predict program output (tracing). Mono-aware comparison.
// ---------------------------------------------------------------------------
function renderOutput(root, ex, ctx) {
  const multi = (ex.answer ?? '').includes('\n');
  const input = multi
    ? el('textarea', { class: 'fill-input', rows: 3, placeholder: 'exact program output…', spellcheck: 'false' })
    : el('input', { class: 'fill-input', type: 'text', placeholder: 'exact program output…', autocomplete: 'off', spellcheck: 'false' });
  input.addEventListener('input', () => ctx.setReady(input.value.trim().length > 0));
  root.append(promptBlock(ex), input);

  return {
    check() {
      const correct = normalizeOutput(input.value) === normalizeOutput(ex.answer);
      input.classList.add(correct ? 'correct' : 'wrong');
      input.disabled = true;
      return { correct, given: input.value };
    },
    lock() { input.disabled = true; },
    reveal() {
      root.append(el('div', { class: 'callout info', style: { marginTop: '10px' } },
        el('span', { class: 'co-ico' }, '🖨️'),
        el('span', { html: `Output: <code style="white-space:pre">${esc(ex.answer)}</code>` })));
    },
    focus() { input.focus(); },
  };
}

// ---------------------------------------------------------------------------
// Parsons / order — arrange lines (click ▲▼ or drag)
// ---------------------------------------------------------------------------
function renderParsons(root, ex, ctx) {
  const isCode = ex.type === 'parsons';
  const correctLines = ex.lines ?? ex.items;
  const pool = shuffle([
    ...correctLines.map((t, i) => ({ t, key: i })),
    ...(ex.distractors ?? []).map((t, i) => ({ t, key: 1000 + i })),
  ]);

  const bank = el('div', { class: 'parsons-bank' });
  const answer = el('div', { class: 'parsons-answer' });
  let locked = false;

  function lineEl(item) {
    const li = el('div', { class: 'p-line', draggable: 'true' },
      el('span', { class: 'pl-grip' }, '⋮⋮'));
    const body = el('span', { style: { flex: '1', whiteSpace: 'pre-wrap' } });
    if (isCode) body.innerHTML = highlightCpp(item.t);
    else body.textContent = item.t;
    li.append(body);
    const tools = el('span', { class: 'pl-tools' });
    const up = el('button', { type: 'button', 'aria-label': 'move up', onclick: (e) => { e.stopPropagation(); move(li, -1); } }, '▲');
    const down = el('button', { type: 'button', 'aria-label': 'move down', onclick: (e) => { e.stopPropagation(); move(li, +1); } }, '▼');
    tools.append(up, down);
    li.append(tools);
    li.dataset.key = item.key;

    li.addEventListener('click', () => {
      if (locked) return;
      sfx.click();
      (li.parentElement === bank ? answer : bank).append(li);
      sync();
    });
    li.addEventListener('dragstart', (e) => {
      if (locked) { e.preventDefault(); return; }
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    return li;
  }

  function move(li, dir) {
    if (locked || li.parentElement !== answer) return;
    const sib = dir < 0 ? li.previousElementSibling : li.nextElementSibling;
    if (sib) {
      if (dir < 0) answer.insertBefore(li, sib);
      else answer.insertBefore(sib, li);
      sync();
    }
  }

  for (const zone of [bank, answer]) {
    zone.addEventListener('dragover', (e) => {
      if (locked) return;
      e.preventDefault();
      const dragging = root.querySelector('.p-line.dragging');
      if (!dragging) return;
      const after = [...zone.querySelectorAll('.p-line:not(.dragging)')]
        .find((n) => e.clientY < n.getBoundingClientRect().top + n.offsetHeight / 2);
      if (after) zone.insertBefore(dragging, after);
      else zone.append(dragging);
    });
    zone.addEventListener('drop', (e) => { e.preventDefault(); sync(); });
  }

  function sync() { ctx.setReady(answer.querySelectorAll('.p-line').length === correctLines.length); }

  pool.forEach((item) => bank.append(lineEl(item)));
  root.append(
    promptBlock(ex),
    el('div', { class: 'parsons-area' },
      el('div', {},
        el('div', { class: 'parsons-label' }, isCode ? 'Your program (tap or drag lines here, top to bottom)' : 'Your answer (in order)'),
        answer),
      el('div', {},
        el('div', { class: 'parsons-label' }, (ex.distractors?.length ? 'Blocks — beware, some are traps' : 'Blocks')),
        bank)),
  );

  return {
    check() {
      locked = true;
      const placed = [...answer.querySelectorAll('.p-line')];
      let correct = placed.length === correctLines.length;
      placed.forEach((li, i) => {
        const ok = Number(li.dataset.key) === i;
        li.classList.add(ok ? 'good' : 'misplaced');
        if (!ok) correct = false;
      });
      return { correct };
    },
    lock() { locked = true; },
    reveal() {
      const sol = correctLines.join('\n');
      const block = isCode
        ? codeBlock(sol, { copy: false })
        : el('div', { class: 'callout info' }, el('span', { class: 'co-ico' }, '📋'), el('span', {}, sol));
      root.append(el('div', { class: 'mt-2' }, el('div', { class: 'parsons-label' }, 'Correct order'), block));
    },
    focus() {},
  };
}

// ---------------------------------------------------------------------------
// Bank — fill blanks in code by tapping tokens (Duolingo word-bank style)
// ---------------------------------------------------------------------------
function renderBank(root, ex, ctx) {
  let locked = false;
  const slotsCount = (ex.code.match(/___/g) ?? []).length;
  const tokens = shuffle([...ex.answer.map((t, i) => ({ t, key: i })), ...(ex.distractors ?? []).map((t, i) => ({ t, key: 1000 + i }))]);
  const filled = Array(slotsCount).fill(null); // {t, key, btn}

  const codeWrap = el('div', { class: 'codeblock' });
  const pre = el('pre');
  codeWrap.append(pre);

  const bankEl = el('div', { class: 'row wrap', style: { marginTop: '12px' } });
  const tokenBtns = tokens.map((tok) => {
    const b = el('button', {
      class: 'btn ghost sm',
      type: 'button',
      style: { fontFamily: 'var(--font-mono)', textTransform: 'none', letterSpacing: '0' },
      onclick: () => {
        if (locked || b.disabled) return;
        const slot = filled.indexOf(null);
        if (slot === -1) return;
        sfx.click();
        filled[slot] = { ...tok, btn: b };
        b.disabled = true;
        renderCode();
      },
    }, tok.t);
    return b;
  });
  tokenBtns.forEach((b) => bankEl.append(b));

  function renderCode() {
    let idx = 0;
    const html = ex.code.split('___').map((part, i, arr) => {
      let out = highlightCpp(part);
      if (i < arr.length - 1) {
        const f = filled[idx];
        out += f
          ? `<button class="bank-slot filled" data-slot="${idx}" style="font-family:var(--font-mono);background:var(--info-soft);border:1.5px solid var(--info);border-radius:6px;padding:0 6px;color:var(--text);cursor:pointer">${esc(f.t)}</button>`
          : `<span class="bank-slot" data-slot="${idx}" style="display:inline-block;min-width:54px;border-bottom:2px dashed var(--border-strong);color:transparent">__</span>`;
        idx++;
      }
      return out;
    }).join('');
    pre.innerHTML = html;
    pre.querySelectorAll('button.bank-slot').forEach((sl) => {
      sl.addEventListener('click', () => {
        if (locked) return;
        const i = Number(sl.dataset.slot);
        const f = filled[i];
        if (f) { f.btn.disabled = false; filled[i] = null; renderCode(); }
      });
    });
    ctx.setReady(filled.every((f) => f !== null));
  }
  renderCode();

  root.append(promptBlock({ ...ex, code: null }), codeWrap,
    el('div', { class: 'parsons-label', style: { marginTop: '10px' } }, 'Token bank — tap to place, tap a placed token to remove'),
    bankEl);

  return {
    check() {
      locked = true;
      let correct = true;
      filled.forEach((f, i) => { if (!f || f.key !== i) correct = false; });
      pre.querySelectorAll('button.bank-slot').forEach((sl) => {
        const i = Number(sl.dataset.slot);
        const ok = filled[i] && filled[i].key === i;
        sl.style.borderColor = ok ? 'var(--ok-strong)' : 'var(--bad-strong)';
        sl.style.background = ok ? 'var(--ok-soft)' : 'var(--bad-soft)';
      });
      return { correct };
    },
    lock() { locked = true; },
    reveal() {
      const sol = ex.code.split('___').map((p, i, arr) => p + (i < arr.length - 1 ? ex.answer[i] : '')).join('');
      root.append(el('div', { class: 'mt-2' }, el('div', { class: 'parsons-label' }, 'Completed code'), codeBlock(sol, { copy: false })));
    },
    focus() {},
  };
}

// ---------------------------------------------------------------------------
// Typein — type code directly into blanks inside a code block.
// The typed-recall rung of the ladder: harder than bank (no token menu),
// gentler than a blank editor. Comparison is whitespace-forgiving but
// CASE-SENSITIVE (it's C++).
// ---------------------------------------------------------------------------
function renderTypein(root, ex, ctx) {
  let locked = false;
  const slots = (ex.code.match(/___/g) ?? []).length;
  const inputs = [];

  const wrap = el('div', { class: 'codeblock typein' });
  const pre = el('pre');
  ex.code.split('___').forEach((part, i, arr) => {
    const span = el('span');
    span.innerHTML = highlightCpp(part);
    pre.append(span);
    if (i < arr.length - 1) {
      const accepted = ex.answer[i];
      const canonical = Array.isArray(accepted) ? accepted[0] : accepted;
      const input = el('input', {
        class: 'typein-input',
        type: 'text',
        autocomplete: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        'aria-label': `code blank ${i + 1}`,
        style: { width: `${Math.max(4, Math.min(28, canonical.length + 2))}ch` },
      });
      input.addEventListener('input', () => {
        // grow with content, keep code layout readable
        input.style.width = `${Math.max(4, Math.min(34, Math.max(canonical.length, input.value.length) + 2))}ch`;
        ctx.setReady(inputs.every((inp) => inp.value.trim().length > 0));
      });
      input.addEventListener('keydown', (e) => {
        // Enter moves to next empty blank instead of submitting mid-way
        if (e.key === 'Enter') {
          const next = inputs.find((inp) => inp !== input && inp.value.trim() === '');
          if (next) { e.preventDefault(); e.stopPropagation(); next.focus(); }
        }
      });
      inputs.push(input);
      pre.append(input);
    }
  });
  wrap.append(pre);
  root.append(promptBlock({ ...ex, code: null }), wrap,
    el('div', { class: 'parsons-label', style: { marginTop: '8px' } },
      `type the missing code — ${slots} blank${slots > 1 ? 's' : ''}, whitespace-forgiving, case matters`));

  return {
    check() {
      locked = true;
      let correct = true;
      inputs.forEach((input, i) => {
        const ok = codeMatches(input.value, ex.answer[i]);
        input.classList.add(ok ? 'correct' : 'wrong');
        input.disabled = true;
        if (!ok) correct = false;
      });
      return { correct };
    },
    lock() { locked = true; inputs.forEach((i) => (i.disabled = true)); },
    reveal() {
      const sol = ex.code.split('___').map((p, i, arr) => {
        if (i === arr.length - 1) return p;
        const a = ex.answer[i];
        return p + (Array.isArray(a) ? a[0] : a);
      }).join('');
      root.append(el('div', { class: 'mt-2' }, el('div', { class: 'parsons-label' }, 'Completed code'), codeBlock(sol, { copy: false })));
    },
    focus() { inputs[0]?.focus(); },
  };
}

// ---------------------------------------------------------------------------
// Match — tap matching pairs
// ---------------------------------------------------------------------------
function renderMatch(root, ex, ctx) {
  let locked = false;
  let wrongTaps = 0;
  let matched = 0;
  const left = ex.pairs.map((p, i) => ({ t: p[0], pair: i, side: 0 }));
  const right = ex.pairs.map((p, i) => ({ t: p[1], pair: i, side: 1 }));
  const items = [...shuffle(left), ...shuffle(right)];
  let sel = null;

  const grid = el('div', { class: 'match-grid' });
  const btns = items.map((it) => {
    const b = el('button', { class: 'opt', type: 'button' }, it.t);
    b.addEventListener('click', () => {
      if (locked || b.classList.contains('matched')) return;
      sfx.click();
      if (!sel) { sel = { it, b }; b.classList.add('selected'); return; }
      if (sel.b === b) { b.classList.remove('selected'); sel = null; return; }
      if (sel.it.pair === it.pair && sel.it.side !== it.side) {
        sel.b.classList.remove('selected');
        sel.b.classList.add('matched');
        b.classList.add('matched');
        matched++;
        sfx.correct();
        sel = null;
        if (matched === ex.pairs.length) ctx.setReady(true);
      } else {
        b.classList.add('wrong');
        sel.b.classList.add('wrong');
        wrongTaps++;
        sfx.wrong();
        const a = sel.b;
        setTimeout(() => { a.classList.remove('wrong', 'selected'); b.classList.remove('wrong'); }, 420);
        sel = null;
      }
    });
    return b;
  });
  btns.forEach((b) => grid.append(b));
  root.append(promptBlock(ex), grid);

  return {
    check() { locked = true; return { correct: wrongTaps === 0, detail: wrongTaps ? `${wrongTaps} mismatch${wrongTaps > 1 ? 'es' : ''} along the way` : '' }; },
    lock() { locked = true; },
    reveal() {},
    focus() {},
  };
}

// ---------------------------------------------------------------------------
// Code — write code, run against tests (Piston) or self-check
// ---------------------------------------------------------------------------
function renderCode(root, ex, ctx) {
  const ta = el('textarea', { spellcheck: 'false' });
  ta.value = ex.starter ?? '';
  const underlay = el('pre', { class: 'hl-underlay' });
  const wrap = el('div', { class: 'code-editor-wrap' });
  wrap.append(underlay, ta);

  function paint() {
    underlay.innerHTML = highlightCpp(ta.value) + '\n';
    underlay.scrollTop = ta.scrollTop;
    underlay.scrollLeft = ta.scrollLeft;
  }
  ta.addEventListener('input', () => { paint(); ctx.setReady(ta.value.trim().length > 20); });
  ta.addEventListener('scroll', paint);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: epos } = ta;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(epos);
      ta.selectionStart = ta.selectionEnd = s + 4;
      paint();
    }
    e.stopPropagation(); // keep Enter for newlines, not "check"
  });
  paint();

  const out = el('div', { class: 'runner-out hidden' });
  const runBtn = el('button', { class: 'btn info sm', type: 'button' }, '▶ Run tests');
  let lastRun = null; // null | {passed, total}

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running…';
    out.classList.remove('hidden');
    out.textContent = 'Compiling and running via Piston…';
    const results = [];
    try {
      for (const t of ex.tests) {
        const res = await runCpp(ta.value, t.input ?? '');
        if (res.error) throw new Error(res.error);
        const got = normalizeOutput(res.output);
        const want = normalizeOutput(t.expected);
        results.push({ ok: got === want, got, want, input: t.input });
      }
      lastRun = { passed: results.filter((r) => r.ok).length, total: results.length };
      out.innerHTML = results.map((r, i) =>
        r.ok
          ? `<div class="ro-ok">✓ test ${i + 1} passed</div>`
          : `<div class="ro-bad">✗ test ${i + 1} failed</div><div>  input: ${esc(JSON.stringify(r.input))}\n  expected: ${esc(JSON.stringify(r.want))}\n  got: ${esc(JSON.stringify(r.got))}</div>`
      ).join('');
      ctx.setReady(true);
    } catch (err) {
      lastRun = null;
      out.innerHTML = `<div class="ro-bad">Runner unavailable (${esc(err.message)}).</div><div>No internet judge? Use "Compare with solution" below and self-check honestly — it still counts.</div>`;
      ctx.setReady(true);
    }
    runBtn.textContent = '▶ Run tests';
    runBtn.disabled = false;
  });

  let selfVerdict = null;
  const compareBtn = el('button', { class: 'btn ghost sm', type: 'button' }, 'Compare with solution');
  const selfRow = el('div', { class: 'row hidden', style: { marginTop: '8px' } },
    el('span', { class: 'muted' }, 'Does yours behave the same?'),
    el('button', { class: 'btn ok sm', type: 'button', onclick: () => { selfVerdict = true; ctx.setReady(true); } }, 'Yes'),
    el('button', { class: 'btn bad sm', type: 'button', onclick: () => { selfVerdict = false; ctx.setReady(true); } }, 'Not quite'),
  );
  compareBtn.addEventListener('click', () => {
    root.querySelector('.code-solution')?.remove();
    root.append(el('div', { class: 'code-solution mt-2' },
      el('div', { class: 'parsons-label' }, 'Reference solution'),
      codeBlock(ex.solution, { copy: false })));
    selfRow.classList.remove('hidden');
  });

  root.append(
    promptBlock(ex),
    wrap,
    el('div', { class: 'row', style: { marginTop: '10px' } }, runBtn, compareBtn),
    selfRow,
    out,
  );

  return {
    check() {
      if (lastRun) return { correct: lastRun.passed === lastRun.total, detail: `${lastRun.passed}/${lastRun.total} tests passed` };
      if (selfVerdict !== null) return { correct: selfVerdict, detail: 'self-checked' };
      return { correct: false, detail: 'no test run' };
    },
    lock() { ta.disabled = true; },
    reveal() {
      if (!root.querySelector('.code-solution')) {
        root.append(el('div', { class: 'code-solution mt-2' },
          el('div', { class: 'parsons-label' }, 'Reference solution'),
          codeBlock(ex.solution, { copy: false })));
      }
    },
    focus() { ta.focus(); },
  };
}

// ---------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------
export function renderExercise(root, ex, ctx) {
  root.replaceChildren();
  switch (ex.type) {
    case 'mcq': return renderMCQ(root, withShuffledOptions(ex), ctx);
    case 'tf': {
      const tfEx = { ...ex, prompt: ex.prompt ?? ex.statement, options: ['True', 'False'], answer: ex.answer ? 0 : 1, noShuffle: true };
      return renderMCQ(root, withShuffledOptions(tfEx), ctx);
    }
    case 'multi': return renderMulti(root, withShuffledOptions(ex), ctx);
    case 'fill': return renderFill(root, ex, ctx);
    case 'output': return renderOutput(root, ex, ctx);
    case 'parsons':
    case 'order': return renderParsons(root, ex, ctx);
    case 'bank': return renderBank(root, ex, ctx);
    case 'typein': return renderTypein(root, ex, ctx);
    case 'match': return renderMatch(root, ex, ctx);
    case 'code': return renderCode(root, ex, ctx);
    default:
      root.append(el('div', { class: 'callout danger' }, `Unknown exercise type: ${ex.type}`));
      return { check: () => ({ correct: false }), lock() {}, reveal() {}, focus() {} };
  }
}

/** Human label per type (for the kicker line). */
export const TYPE_LABELS = {
  mcq: 'Pick one',
  tf: 'True or false?',
  multi: 'Select all',
  fill: 'Type the answer',
  output: 'Predict the output',
  parsons: 'Assemble the code',
  order: 'Put in order',
  bank: 'Complete the code',
  typein: 'Type the code',
  match: 'Match the pairs',
  code: 'Write the code',
};
