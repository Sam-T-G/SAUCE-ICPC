// ============================================================================
// views/handbook.js — the SAUCE reference: searchable algorithm handbook
// (descended from SAUCE.cpp), the "Which tool?" wizard, and a C++ playground.
// ============================================================================
import { el, md, esc } from '../util.js';
import { codeBlock, highlightCpp } from '../highlight.js';
import { HANDBOOK, WIZARD } from '../../data/handbook.js';
import { runCpp } from '../runner.js';
import { sfx } from '../audio.js';

export function renderHandbook(root, rerender, args = []) {
  root.replaceChildren(
    el('h1', {}, '📕 The SAUCE'),
    el('p', { class: 'muted' }, 'Your team reference: copy-paste-ready C++ with the “when and why” attached. ',
      el('a', { href: 'SAUCE.cpp', target: '_blank' }, 'raw SAUCE.cpp ↗')));

  const tabs = el('div', { class: 'tabs' });
  const body = el('div');
  root.append(tabs, body);

  const TABS = [
    { id: 'browse', label: '📚 Browse' },
    { id: 'wizard', label: '🧭 Which tool?' },
    { id: 'playground', label: '🧪 Playground' },
  ];
  let active = args[0] === 'wizard' ? 'wizard' : args[0] === 'playground' ? 'playground' : 'browse';

  for (const t of TABS) {
    tabs.append(el('button', {
      class: `tab ${t.id === active ? 'active' : ''}`,
      onclick: (e) => {
        active = t.id;
        [...tabs.children].forEach((x) => x.classList.remove('active'));
        e.currentTarget.classList.add('active');
        render();
      },
    }, t.label));
  }

  function render() {
    body.replaceChildren();
    if (active === 'browse') renderBrowse(body);
    if (active === 'wizard') renderWizard(body);
    if (active === 'playground') renderPlayground(body);
  }
  render();
}

// ---------------------------------------------------------------------------
function renderBrowse(body) {
  const search = el('input', { type: 'search', placeholder: '🔎 search: dijkstra, segment tree, nCr…', style: { width: '100%', marginBottom: '14px' } });
  const toc = el('div', { class: 'hb-toc' });
  const detail = el('div');

  function showSection(sec) {
    detail.replaceChildren(
      el('button', { class: 'btn ghost sm', onclick: () => { detail.replaceChildren(); window.scrollTo({ top: 0 }); } }, '← all sections'),
      el('h2', { class: 'mt-2' }, `${sec.icon} ${sec.title}`),
      el('p', { class: 'muted' }, sec.sub));
    for (const item of sec.items) {
      detail.append(el('div', { class: 'card flat', style: { marginBottom: '12px' } },
        el('h4', {}, item.h),
        item.md ? el('div', { class: 'muted', html: md(item.md) }) : null,
        item.code ? codeBlock(item.code) : null,
        item.note ? el('div', { class: 'callout tip' }, el('span', { class: 'co-ico' }, '💡'), el('span', { html: md(item.note) })) : null));
    }
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderToc(filter = '') {
    toc.replaceChildren();
    const f = filter.trim().toLowerCase();
    for (const sec of HANDBOOK) {
      const text = (sec.title + ' ' + sec.sub + ' ' + sec.items.map((i) => i.h + ' ' + (i.md ?? '')).join(' ')).toLowerCase();
      if (f && !text.includes(f)) continue;
      toc.append(el('button', { class: 'hb-card', onclick: () => { sfx.click(); showSection(sec); } },
        el('span', { class: 'hb-ico' }, sec.icon),
        el('span', {},
          el('div', { class: 'hb-name' }, sec.title),
          el('div', { class: 'hb-sub' }, sec.sub))));
    }
    if (!toc.children.length) toc.append(el('p', { class: 'muted' }, 'No sections match.'));
  }

  search.addEventListener('input', () => renderToc(search.value));
  renderToc();
  body.append(search, toc, detail);
}

// ---------------------------------------------------------------------------
function renderWizard(body) {
  const crumbs = [];

  function step(node) {
    const wrap = el('div', { class: 'wizard-step' });
    if (crumbs.length) {
      wrap.append(el('div', { class: 'wizard-crumbs' },
        crumbs.map((c) => el('span', { class: 'pill' }, c)),
        el('button', { class: 'pill clickable', onclick: () => { crumbs.length = 0; body.replaceChildren(intro, step(WIZARD)); } }, '↺ restart')));
    }

    if (node.result) {
      const r = node.result;
      wrap.append(el('div', { class: 'card pad-lg', style: { borderColor: 'var(--ok-strong)' } },
        el('div', { style: { fontSize: '2.2rem' } }, r.icon ?? '🎯'),
        el('h3', {}, r.title),
        el('div', { class: 'muted', html: md(r.md) }),
        r.code ? codeBlock(r.code) : null,
        el('div', { class: 'row wrap mt-2' },
          r.sectionId ? el('button', { class: 'btn info sm', onclick: () => { location.hash = '#/handbook'; location.reload(); } }, '📕 open in handbook') : null,
          el('button', { class: 'btn ghost sm', onclick: () => { crumbs.length = 0; body.replaceChildren(intro, step(WIZARD)); } }, '↺ ask again'))));
      body.replaceChildren(intro, wrap);
      return wrap;
    }

    wrap.append(el('h3', {}, node.q));
    const list = el('div', { class: 'opt-list' });
    for (const opt of node.options) {
      list.append(el('button', { class: 'opt', onclick: () => {
        sfx.click();
        crumbs.push(opt.label.replace(/<[^>]+>/g, '').slice(0, 40));
        body.replaceChildren(intro, step(opt.next ?? { result: opt.result }));
      } },
        el('span', { class: 'opt-key' }, '→'),
        el('span', { html: md(opt.label) })));
    }
    wrap.append(list);
    body.replaceChildren(intro, wrap);
    return wrap;
  }

  const intro = el('p', { class: 'muted' },
    'The contest flowchart from SAUCE.cpp, now interactive. Answer what the problem is asking and get pointed at the right tool.');
  step(WIZARD);
}

// ---------------------------------------------------------------------------
const PLAYGROUND_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;
    vector<ll> a(n);
    for (auto &x : a) cin >> x;
    cout << accumulate(a.begin(), a.end(), 0LL) << "\\n";
    return 0;
}
`;

function renderPlayground(body) {
  const ta = el('textarea', { spellcheck: 'false' });
  ta.value = sessionStorage.getItem('playground-code') ?? PLAYGROUND_TEMPLATE;
  const underlay = el('pre', { class: 'hl-underlay' });
  const wrap = el('div', { class: 'code-editor-wrap' });
  wrap.append(underlay, ta);
  function paint() {
    underlay.innerHTML = highlightCpp(ta.value) + '\n';
    underlay.scrollTop = ta.scrollTop;
    underlay.scrollLeft = ta.scrollLeft;
  }
  ta.addEventListener('input', () => { paint(); sessionStorage.setItem('playground-code', ta.value); });
  ta.addEventListener('scroll', paint);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: ep } = ta;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ep);
      ta.selectionStart = ta.selectionEnd = s + 4;
      paint();
    }
  });
  paint();

  const stdin = el('textarea', { rows: 3, placeholder: 'stdin (program input)…', style: { width: '100%', fontFamily: 'var(--font-mono)' } });
  stdin.value = '3\n1 2 3';
  const out = el('div', { class: 'runner-out' }, 'output appears here');
  const run = el('button', { class: 'btn ok' }, '▶ Run (remote)');
  run.addEventListener('click', async () => {
    run.disabled = true;
    run.textContent = '⏳ compiling…';
    out.textContent = '';
    const res = await runCpp(ta.value, stdin.value);
    out.innerHTML = res.error
      ? `<span class="ro-bad">${esc(res.error)}</span>`
      : `<span class="ro-ok">exit ${res.exitCode}</span>\n${esc(res.output) || '<em>(no output)</em>'}`;
    run.disabled = false;
    run.textContent = '▶ Run (remote)';
  });

  body.append(
    el('p', { class: 'muted' }, 'Quick experiments without leaving the app. Runs remotely via the Piston API (configurable in Settings); for real contests use your local toolchain.'),
    wrap,
    el('div', { class: 'row mt-2', style: { alignItems: 'flex-start' } },
      el('div', { style: { flex: 1 } }, el('div', { class: 'parsons-label' }, 'stdin'), stdin),
      run),
    el('div', { class: 'mt-2' }, el('div', { class: 'parsons-label' }, 'output'), out));
}
