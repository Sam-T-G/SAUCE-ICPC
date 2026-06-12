// ============================================================================
// sw.js — offline support: network-first with cache fallback.
// Everything in the app is static, so any successfully fetched response is
// cached; when the network is gone (subway training), the cache serves.
// Bump VERSION to invalidate old caches on deploy.
// ============================================================================
const VERSION = 'sauce-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== VERSION) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // never intercept cross-origin (Piston API runs etc.)
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request);
      if (fresh.ok) {
        const cache = await caches.open(VERSION);
        cache.put(e.request, fresh.clone());
      }
      return fresh;
    } catch {
      const cached = await caches.match(e.request, { ignoreSearch: true });
      if (cached) return cached;
      if (e.request.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return new Response('offline', { status: 503 });
    }
  })());
});
