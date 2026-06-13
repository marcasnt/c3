const CACHE_NAME = "c3-catalogo-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/C3 logo.png",
  "/Logo Blanco C3.png"
];

// Instalar Service Worker y guardar recursos esenciales en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar Service Worker y limpiar versiones antiguas de caché
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de red primero (Network-First) para asegurar frescura de datos con Supabase
self.addEventListener("fetch", (event) => {
  // Ignorar peticiones de API de Supabase o scripts externos de Deno para no bloquear base de datos
  if (
    event.request.url.includes("supabase.co") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar copia fresca en caché para recursos de nuestro origen
        if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // En caso de estar sin conexión, devolver desde la caché
        return caches.match(event.request);
      })
  );
});
