// Service Worker Nuri Snack - minimal, no caching
// Hanya untuk memenuhi syarat PWA agar bisa diinstall

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Hapus semua cache lama yang mungkin menyebabkan layar putih
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return clients.claim();
    })
  );
});

// Tidak intercept fetch - biarkan browser load normal dari server
// Ini mencegah layar putih akibat cache rusak
self.addEventListener('fetch', function(e) {
  // passthrough - tidak ada caching
});
