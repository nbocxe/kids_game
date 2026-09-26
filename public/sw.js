// Offline spelen: eerst uit het netwerk (voor updates), anders uit de cache.
const CACHE = "kattenkwaad-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((antwoord) => {
        const kopie = antwoord.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return antwoord;
      })
      .catch(() => caches.match(e.request).then((a) => a || caches.match("./"))),
  );
});
