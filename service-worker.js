
const CACHE = 'noem-multipage-pro-v1';
const ASSETS = [
  './',
  './index.html','./tasks.html','./expenses.html','./notes.html','./settings.html',
  './style.css','./js/main.js','./js/tasks.js','./js/expenses.js','./js/notes.js',
  './assets/logo-noem.png','./assets/favicon.png',
  './assets/icons/icon-192.png','./assets/icons/icon-256.png','./assets/icons/icon-384.png','./assets/icons/icon-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(r=>{
      const copy = r.clone();
      caches.open(CACHE).then(c=> c.put(e.request, copy));
      return r;
    }).catch(()=> caches.match('./index.html')))
  );
});
