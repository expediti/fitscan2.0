const CACHE_NAME = 'fitscan-v1';
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/css/responsive.css',
  '/assets/js/main.js',
  '/images/logo.png',
  '/images/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
