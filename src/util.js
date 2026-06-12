// ============================================================================
// util.js — DOM helpers, formatting, tiny markdown, misc
// ============================================================================

/** Escape a string for safe insertion into HTML. */
export function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Hyperscript-style element builder. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

/** Replace the children of a container. */
export function mount(container, ...nodes) {
  container.replaceChildren(...nodes.flat(Infinity).filter(Boolean));
  return container;
}

/**
 * Markdown-lite → HTML. Escapes first (safe for untrusted-ish content),
 * then supports: **bold**, *italic*, `code`, [text](url), newlines.
 */
export function md(s) {
  let out = esc(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/\n/g, '<br>');
  return out;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n random elements (no repeats). */
export function sample(arr, n, rng = Math.random) {
  return shuffle(arr, rng).slice(0, Math.max(0, n));
}

export function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

/** Local calendar date as 'YYYY-MM-DD'. */
export function todayStr(d = new Date()) {
  return d.toLocaleDateString('en-CA');
}

/** Days between two YYYY-MM-DD strings (b - a). */
export function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);
}

/** Add days to a YYYY-MM-DD string. */
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00');
  d.setDate(d.getDate() + n);
  return todayStr(d);
}

/** Humanize a count: "3 days", "1 day". */
export function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }

/** "in 3 days" / "today" / "2 days overdue" relative to today. */
export function dueLabel(dueStr) {
  const diff = daysBetween(todayStr(), dueStr);
  if (diff === 0) return 'due today';
  if (diff === 1) return 'due tomorrow';
  if (diff > 1) return `due in ${plural(diff, 'day')}`;
  return `${plural(-diff, 'day')} overdue`;
}

export function fmtInt(n) { return new Intl.NumberFormat().format(Math.round(n)); }

export function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Normalize free-typed answers for forgiving comparison. */
export function normalizeAnswer(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),;<>[\]{}=+\-*/%!&|^])\s*/g, '$1');
}

/** Compare typed answer against accepted answer(s). */
export function answerMatches(given, accepted) {
  const g = normalizeAnswer(given);
  const list = Array.isArray(accepted) ? accepted : [accepted];
  return list.some((a) => normalizeAnswer(a) === g);
}

/** Normalize program output: trim trailing whitespace per line + trailing newlines. */
export function normalizeOutput(s) {
  return String(s ?? '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
}

let uidCounter = 0;
export function uid(prefix = 'id') { return `${prefix}-${Date.now().toString(36)}-${(uidCounter++).toString(36)}`; }

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** SVG progress ring as an element. pct in [0,1]. */
export function ring(pct, { size = 64, stroke = 7, color = 'var(--ok)', label = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - clamp(pct, 0, 1));
  const wrap = el('span', { class: 'ring-wrap' });
  wrap.innerHTML = `
    <svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"></circle>
      <circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}"
        stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"></circle>
    </svg>
    <span class="ring-center" style="font-size:${size / 4.4}px">${label}</span>`;
  return wrap;
}

/** Copy text to clipboard with fallback. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

/** Download a string as a file. */
export function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
