// Garde la page en memoire pour qu'elle marche sans reseau pendant la manif.
// (Le plan des rues, lui, est enregistre a part par la page, dans IndexedDB.)
const CACHE = "radar-v8";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "./fonts/barlow-latin-400-normal.woff2", "./fonts/barlow-latin-600-normal.woff2",
  "./fonts/barlow-condensed-latin-600-normal.woff2", "./fonts/barlow-condensed-latin-700-normal.woff2"];

self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); });
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
