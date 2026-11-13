const CACHE_NAME = "focuslog-live";

// 1. Activate immediately without waiting for tabs to close
self.addEventListener("install", () => {
  self.skipWaiting();
});

// 2. Delete all old stuck caches (focuslog-v1, v2, v3, v4, v5)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Network-First: Always grab the latest files from VS Code / server first
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});