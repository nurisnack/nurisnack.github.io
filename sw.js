importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyAJoLNmtQz0HJiqCrdZW8iieB1qr9WN1Us",
  authDomain:        "nuri-snack.firebaseapp.com",
  projectId:         "nuri-snack",
  storageBucket:     "nuri-snack.firebasestorage.app",
  messagingSenderId: "594396605879",
  appId:             "1:594396605879:web:813307a124359949094c32"
});

const messaging = firebase.messaging();

// Terima notifikasi saat aplikasi DITUTUP / di background
messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || 'Nuri Snack';
  var body  = (payload.notification && payload.notification.body)  || '';
  var data  = payload.data || {};

  // Tutup semua notifikasi dengan tag yang sama dulu (replace, bukan tambah)
  self.registration.getNotifications({ tag: 'nuri-notif' }).then(function(existing) {
    existing.forEach(function(n) { n.close(); });
    self.registration.showNotification(title, {
      body:    body,
      icon:    './icon-192.png',
      badge:   './icon-192.png',
      vibrate: [100, 50, 100, 50, 300],
      data:    data,
      tag:     'nuri-notif',   // tag sama = replace notifikasi lama
      renotify: true           // tetap bunyi/getar meski replace
    });
  });
});

// Klik notifikasi → buka / fokus aplikasi
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('nurisnack.github.io') >= 0) return list[i].focus();
      }
      return clients.openWindow('https://nurisnack.github.io');
    })
  );
});

self.addEventListener('install',  function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(k) {
      return Promise.all(k.map(function(c) { return caches.delete(c); }));
    }).then(function() { return clients.claim(); })
  );
});
self.addEventListener('fetch', function(e) {});
