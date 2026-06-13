const CACHE_NAME = 'cyberdeck-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/tools.html',
  '/wiki.html',
  '/blueteam.html',
  '/css/style.css',
  '/js/main.js',
  '/js/tools-engine.js',
  '/js/components.js'
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
      .then(response => response || fetch(event.request))
  );
});