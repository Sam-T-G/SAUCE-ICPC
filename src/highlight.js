// ============================================================================
// highlight.js — tiny C++ syntax highlighter (no dependencies)
// Tokenizes comments, strings, chars, preprocessor, numbers, keywords, types,
// and function calls. Output is escaped HTML with .tok-* spans.
// ============================================================================
import { esc, el, copyText } from './util.js';

const KEYWORDS = new Set([
  'alignas','alignof','and','asm','auto','break','case','catch','class','const',
  'constexpr','const_cast','continue','decltype','default','delete','do','dynamic_cast',
  'else','enum','explicit','export','extern','false','final','for','friend','goto','if',
  'inline','mutable','namespace','new','noexcept','not','nullptr','operator','or',
  'override','private','protected','public','register','reinterpret_cast','return',
  'sizeof','static','static_assert','static_cast','struct','switch','template','this',
  'throw','true','try','typedef','typeid','typename','union','using','virtual',
  'volatile','while','xor',
]);

const TYPES = new Set([
  'bool','char','double','float','int','long','short','signed','unsigned','void','wchar_t',
  'size_t','int8_t','int16_t','int32_t','int64_t','uint8_t','uint16_t','uint32_t','uint64_t',
  'll','ull','ld','pii','pll','vi','vll',
  'string','vector','pair','tuple','array','deque','list','queue','stack','set','map',
  'multiset','multimap','unordered_set','unordered_map','priority_queue','bitset',
  'iterator','istream','ostream','stringstream','istringstream','ostringstream',
]);

const TOKEN_RE = new RegExp(
  [
    String.raw`(?<com>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<str>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')`,
    String.raw`(?<pre>^[ \t]*#[^\n]*)`,
    String.raw`(?<num>\b(?:0[xX][0-9a-fA-F']+|\d[\d']*(?:\.\d+)?(?:[eE][+-]?\d+)?)(?:[uUlLfF]*)\b)`,
    String.raw`(?<word>[A-Za-z_]\w*)`,
  ].join('|'),
  'gm'
);

/** Highlight C++ source → HTML string (escaped). */
export function highlightCpp(code) {
  let out = '';
  let last = 0;
  const src = String(code ?? '');
  for (const m of src.matchAll(TOKEN_RE)) {
    out += esc(src.slice(last, m.index));
    const g = m.groups;
    if (g.com != null) out += `<span class="tok-com">${esc(g.com)}</span>`;
    else if (g.str != null) out += `<span class="tok-str">${esc(g.str)}</span>`;
    else if (g.pre != null) out += `<span class="tok-pre">${esc(g.pre)}</span>`;
    else if (g.num != null) out += `<span class="tok-num">${esc(g.num)}</span>`;
    else if (g.word != null) {
      const w = g.word;
      const after = src.slice(m.index + w.length).match(/^\s*\(/);
      if (KEYWORDS.has(w)) out += `<span class="tok-kw">${esc(w)}</span>`;
      else if (TYPES.has(w)) out += `<span class="tok-type">${esc(w)}</span>`;
      else if (after) out += `<span class="tok-fn">${esc(w)}</span>`;
      else out += esc(w);
    }
    last = m.index + m[0].length;
  }
  out += esc(src.slice(last));
  return out;
}

/**
 * Build a styled code block element.
 * opts: { lineNumbers, copy, lang }
 */
export function codeBlock(code, { lineNumbers = false, copy = true } = {}) {
  const wrap = el('div', { class: 'codeblock' });
  const pre = el('pre');
  if (lineNumbers) {
    const lines = String(code).replace(/\n$/, '').split('\n');
    pre.innerHTML = `<span class="code-lines">${lines
      .map((l) => `<span class="cl">${highlightCpp(l) || ' '}</span>`)
      .join('')}</span>`;
  } else {
    pre.innerHTML = highlightCpp(code);
  }
  wrap.append(pre);
  if (copy) {
    const btn = el('button', {
      class: 'copy-btn',
      type: 'button',
      onclick: async () => {
        const ok = await copyText(code);
        btn.textContent = ok ? '✓ copied' : '✗ failed';
        setTimeout(() => (btn.textContent = 'copy'), 1200);
      },
    }, 'copy');
    wrap.append(btn);
  }
  return wrap;
}
