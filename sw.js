// NorthBamaWX service worker: network first, so weather is never stale.
// The cached copy of the page is only used when the phone is offline.
const CACHE = 'nbwx-v1';
const SHELL = ['./', './index.html', './safety.html', './icons/icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // Only handle this site's own pages; data and maps go straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin || req.mode !== 'navigate') return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./')))
  );
});
