const CACHE_NAME = "kasireddi-deals-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/admin.html",
  "/redirect.html",
  "/styles.css",
  "/admin.css",
  "/script.js",
  "/firebase-config.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/ads.txt"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
