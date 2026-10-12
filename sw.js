// Garde la page en memoire pour qu'elle marche sans reseau pendant la manif.
// (Le plan des rues, lui, est enregistre a part par la page, dans IndexedDB.)
const CACHE = "radar-v10";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "./fonts/barlow-latin-400-normal.woff2", "./fonts/barlow-latin-600-normal.woff2",
  "./fonts/barlow-condensed-latin-600-normal.woff2", "./fonts/barlow-condensed-latin-700-normal.woff2"];

self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); });
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

// La copie du telephone d'abord (ouverture instantanee, meme si le reseau est sature),
// et mise a jour discrete en arriere-plan quand le reseau repond : la nouvelle version
// sera utilisee a l'ouverture suivante.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(copie => {
    const reseau = fetch(e.request).then(r => {
      if (r && r.ok) { const c2 = r.clone(); caches.open(CACHE).then(c => c.put(e.request, c2)); }
      return r;
    });
    if (copie) { reseau.catch(() => {}); e.waitUntil(reseau.catch(() => {})); return copie; }
    return reseau;
  }));
});
