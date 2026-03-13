const CACHE_NAME = 'nuri-snack-v1';
const STATIC_ASSETS = ['./'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // Hanya cache request GET
  if (e.request.method !== 'GET') return;
  // Jangan cache Firebase / CDN eksternal
  var url = e.request.url;
  if (url.includes('firestore') || url.includes('firebase') ||
      url.includes('googleapis') || url.includes('gstatic')) return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Simpan versi terbaru ke cache
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Offline: coba dari cache
        return caches.match(e.request);
      })
  );
});
