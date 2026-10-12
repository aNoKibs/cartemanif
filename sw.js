// Garde la page en memoire pour qu'elle marche sans reseau pendant la manif.
const CACHE = "radar-v7";
const TUILES = "tuiles-carte";          // rues deja affichees (garde entre les mises a jour)
const MAX_TUILES = 4000;                // ~60-100 Mo max
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "./vendor/leaflet.js", "./vendor/leaflet.css",
  "./fonts/barlow-latin-400-normal.woff2", "./fonts/barlow-latin-600-normal.woff2",
  "./fonts/barlow-condensed-latin-600-normal.woff2", "./fonts/barlow-condensed-latin-700-normal.woff2"];

self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); });
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== TUILES).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

async function tuile(req) {
  const c = await caches.open(TUILES);
  const deja = await c.match(req);
  if (deja) return deja;                // deja en memoire : pas besoin du reseau
  const r = await fetch(req);
  if (r.ok || r.type === "opaque") {
    await c.put(req, r.clone());
    c.keys().then(ks => { if (ks.length > MAX_TUILES) ks.slice(0, ks.length - MAX_TUILES).forEach(k => c.delete(k)); });
  }
  return r;
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.hostname === "tile.openstreetmap.org") { e.respondWith(tuile(e.request)); return; }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
