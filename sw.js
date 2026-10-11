// Garde la page en cache pour qu'elle marche sans reseau pendant la manif.
const CACHE = "radar-v1";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request).then(r => {
    const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
