// ============================================================================
// runner.js — remote C++ execution via the Piston API (emkc.org), used by
// `code` exercises and the Handbook playground. Endpoint is configurable in
// Settings (self-host Piston if the public instance is rate-limited).
// Public Piston is rate-limited (~5 req/s shared) — we queue politely.
// ============================================================================
import { getState } from './store.js';

let runtimeVersion = null;
let queue = Promise.resolve();

async function detectVersion(base) {
  if (runtimeVersion) return runtimeVersion;
  try {
    const url = base.replace(/\/execute\/?$/, '/runtimes');
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const list = await res.json();
    const gcc = list.find((r) => r.language === 'c++' || (r.aliases ?? []).includes('c++'));
    runtimeVersion = gcc?.version ?? '10.2.0';
  } catch {
    runtimeVersion = '10.2.0';
  }
  return runtimeVersion;
}

/**
 * Run C++ source with given stdin. Returns { output, exitCode } or { error }.
 */
export async function runCpp(source, stdin = '') {
  const base = getState().profile.pistonUrl || 'https://emkc.org/api/v2/piston/execute';
  // serialize calls to respect public rate limits
  const task = queue.then(async () => {
    const version = await detectVersion(base);
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        language: 'c++',
        version,
        files: [{ name: 'main.cpp', content: source }],
        stdin,
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.compile && data.compile.code !== 0) {
      return { error: 'Compile error:\n' + (data.compile.stderr || data.compile.output || '').slice(0, 1200) };
    }
    const run = data.run ?? {};
    if (run.signal) return { error: `Crashed (${run.signal}) — runtime error or time limit.` };
    return { output: run.output ?? run.stdout ?? '', exitCode: run.code ?? 0 };
  });
  // keep the chain alive even on failure, with a spacing delay for rate limits
  queue = task.then(() => new Promise((r) => setTimeout(r, 350)), () => new Promise((r) => setTimeout(r, 350)));
  try {
    return await task;
  } catch (e) {
    return { error: e.name === 'TimeoutError' ? 'Request timed out — check your connection.' : e.message };
  }
}
