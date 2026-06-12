// ============================================================================
// fx.js — visual juice: confetti bursts, floating XP, toasts
// ============================================================================
import { el } from './util.js';

const COLORS = ['#ff5a3c', '#ffc800', '#3ddc6e', '#38b6ff', '#a06bff', '#ff6286', '#21c0e8'];

let canvas, ctx, parts = [], raf = null;

function ensureCanvas() {
  if (!canvas) {
    canvas = document.getElementById('fx-canvas');
    ctx = canvas.getContext('2d');
  }
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function loop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0);
  if (!parts.length) { raf = null; return; }
  for (const p of parts) {
    p.vy += 0.18;                      // gravity
    p.x += p.vx; p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.min(1, p.life / 30);
    ctx.fillStyle = p.color;
    if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  raf = requestAnimationFrame(loop);
}

/** Confetti burst. origin in viewport coords; defaults to center-top. */
export function confetti({ x = innerWidth / 2, y = innerHeight * 0.32, count = 90, spread = 1 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const v = 2 + Math.random() * 7 * spread;
    parts.push({
      x, y,
      vx: Math.cos(ang) * v,
      vy: Math.sin(ang) * v - 4,
      vr: (Math.random() - 0.5) * 0.3,
      rot: Math.random() * Math.PI,
      size: 5 + Math.random() * 7,
      life: 60 + Math.random() * 50,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.random() < 0.5 ? 0 : 1,
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Big celebration: several bursts across the screen. */
export function celebrate() {
  confetti({ x: innerWidth * 0.3, y: innerHeight * 0.35, count: 70 });
  setTimeout(() => confetti({ x: innerWidth * 0.7, y: innerHeight * 0.3, count: 70 }), 180);
  setTimeout(() => confetti({ x: innerWidth * 0.5, y: innerHeight * 0.25, count: 90, spread: 1.3 }), 380);
}

/** Floating "+12 XP" near an element or point. */
export function floatXP(amount, anchor) {
  let x = innerWidth / 2, y = innerHeight * 0.4;
  if (anchor?.getBoundingClientRect) {
    const r = anchor.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top;
  } else if (anchor && 'x' in anchor) ({ x, y } = anchor);
  const n = el('div', { class: 'xp-float', style: { left: `${x - 20}px`, top: `${y - 10}px` } }, `+${amount} XP`);
  document.body.append(n);
  setTimeout(() => n.remove(), 950);
}

/** Toast notification. kind: '', 'ok', 'gold', 'bad' */
export function toast(msg, { kind = '', icon = '', ms = 3200 } = {}) {
  const host = document.getElementById('toasts');
  const t = el('div', { class: `toast ${kind}` }, icon ? el('span', {}, icon) : null, el('span', { html: msg }));
  host.append(t);
  setTimeout(() => {
    t.classList.add('leaving');
    setTimeout(() => t.remove(), 260);
  }, ms);
}
