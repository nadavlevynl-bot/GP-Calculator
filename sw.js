const CACHE = 'gp-calc-v1';
const FILES = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For currency API calls — network first, fall back to cache or nothing
  if (e.request.url.includes('currency-api') || e.request.url.includes('fawazahmed')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}}))
    );
    return;
  }
  // For app files — cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
