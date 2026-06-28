const CACHE_NAME = 'partners-academy-v8';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './icon_192.png',
  './icon_512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Network-First 정책: 최신 js/css 리소스를 항상 먼저 네트워크에서 로딩하여 캐시 지연 문제를 예방하고,
// 네트워크 오프라인 상태일 때만 캐싱된 로컬 자원을 활용하도록 조치해 PWA 앱 설치 요구사항을 통과합니다.
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
