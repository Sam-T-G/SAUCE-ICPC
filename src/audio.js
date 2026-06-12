// ============================================================================
// audio.js — tiny WebAudio synthesizer for feedback sounds (no audio files)
// Soft "pop" for correct, low buzz for wrong, arpeggio fanfares for wins.
// ============================================================================

let ctx = null;
let enabled = true;

export function setSoundEnabled(on) { enabled = !!on; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone({ freq = 440, t = 0, dur = 0.14, type = 'sine', gain = 0.16, slide = 0 }) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  const start = a.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(a.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}

export const sfx = {
  correct() {
    if (!enabled) return;
    tone({ freq: 660, dur: 0.09, type: 'sine', gain: 0.14 });
    tone({ freq: 990, t: 0.07, dur: 0.12, type: 'sine', gain: 0.12 });
  },
  wrong() {
    if (!enabled) return;
    tone({ freq: 196, dur: 0.22, type: 'square', gain: 0.06, slide: -60 });
  },
  click() {
    if (!enabled) return;
    tone({ freq: 520, dur: 0.04, type: 'triangle', gain: 0.05 });
  },
  combo(n) {
    if (!enabled) return;
    tone({ freq: 660 + Math.min(n, 8) * 60, dur: 0.08, type: 'sine', gain: 0.12 });
  },
  fanfare() {
    if (!enabled) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => tone({ freq: f, t: i * 0.1, dur: 0.18, type: 'triangle', gain: 0.13 }));
    tone({ freq: 1319, t: 0.42, dur: 0.3, type: 'sine', gain: 0.1 });
  },
  levelup() {
    if (!enabled) return;
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone({ freq: f, t: i * 0.07, dur: 0.14, type: 'triangle', gain: 0.12 }));
  },
  streak() {
    if (!enabled) return;
    tone({ freq: 440, dur: 0.1, type: 'sawtooth', gain: 0.05, slide: 220 });
    tone({ freq: 880, t: 0.1, dur: 0.16, type: 'sine', gain: 0.12 });
  },
};
