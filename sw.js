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

  // Tag berbeda untuk admin (pesanan baru) vs pelanggan (update status)
  var tag = data.type === 'new_order' ? 'nuri-admin-order' : 'nuri-notif';

  self.registration.getNotifications({ tag: tag }).then(function(existing) {
    existing.forEach(function(n) { n.close(); });
    self.registration.showNotification(title, {
      body:     body,
      icon:     './icon-192.png',
      badge:    './icon-192.png',
      vibrate:  data.type === 'new_order'
                  ? [100, 50, 100, 50, 100, 50, 300]  // pola lebih panjang untuk admin
                  : [100, 50, 100, 50, 300],
      data:     data,
      tag:      tag,
      renotify: true
    });
  });
});

// Klik notifikasi → buka / fokus aplikasi
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var data    = e.notification.data || {};
  var orderId = data.orderId || '';
  var type    = data.type   || '';
  // Bangun URL dengan parameter agar app bisa highlight pesanan
  var targetUrl = 'https://nurisnack.github.io' +
    (orderId ? '?notif_order=' + orderId + '&notif_type=' + type : '');

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('nurisnack.github.io') >= 0) {
          list[i].focus();
          list[i].postMessage({ type: 'NOTIF_CLICK', orderId: orderId, notifType: type });
          return;
        }
      }
      return clients.openWindow(targetUrl);
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
