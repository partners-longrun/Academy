const CACHE_NAME = 'partners-academy-v9';
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
  const url = new URL(e.request.url);
  
  // 외부 API(구글 Apps Script 등) 또는 외부 도메인 리소스는 서비스 워커 캐싱에서 제외하고 바이패스(bypass)합니다.
  if (url.origin !== self.location.origin) {
    return; // respondWith를 호출하지 않으면 브라우저가 기본 네트워크 요청으로 직접 처리합니다.
  }

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(response) {
        if (!response) {
          // 캐시에도 없다면 브라우저 본래의 네트워크 에러를 정상적으로 발생시켜 TypeError를 방지합니다.
          return Promise.reject(new Error('Network request failed and no cache available'));
        }
        return response;
      });
    })
  );
});
