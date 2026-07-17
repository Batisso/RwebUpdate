const CACHE_NAME = 'rendo-cache-v2';

// Core assets to precache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './RendoLogoTransparent.png',
  './RendoNewLogo.png',
  './69abbb96278770785e4b2dc1/css/conicorn.shared.2434630ba.css',
  './js/jquery-3.5.1.min.dc5e7f18c8.js',
  './69abbb96278770785e4b2dc1/js/conicorn.schunk.36b8fb49256177c8.js',
  './69abbb96278770785e4b2dc1/js/conicorn.schunk.cd5d09aec3da06a5.js',
  './69abbb96278770785e4b2dc1/js/conicorn.e9b7f01e.8d4990d70625f6ca.js',
  './gsap/3.14.2/gsap.min.js',
  './gsap/3.14.2/SplitText.min.js',
  './gsap/3.14.2/ScrollTrigger.min.js',
  './logo1.png',
  './logo2.png',
  './logo3.png',
  './logo4.png',
  './logo5.png',
  './logo6.png',
  './logo7.png',
  './work1.PNG',
  './work2.PNG',
  './work3.PNG',
  './work4.PNG',
  './nati.jpg',
  './imageRendo.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  // Skip range requests (video streaming)
  if (event.request.headers.has('range')) return;

  const url = new URL(event.request.url);

  // For JS/CSS: cache-first (they rarely change)
  const isStaticAsset = /\.(js|css|woff2?|ttf|otf|eot)(\?.*)?$/.test(url.pathname);
  // For images/video: cache-first with network fallback
  const isMedia = /\.(png|jpg|jpeg|gif|webp|svg|mp4|webm|ico)(\?.*)?$/.test(url.pathname);

  if (isStaticAsset || isMedia) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // For HTML: network-first, fall back to cache
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cache.match(event.request));
    })
  );
});
