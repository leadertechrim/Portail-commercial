const CACHE_NAME = "aplofr-v1.0.0";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "https://applesoffres-production.up.railway.app/api/sources",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache ouvert");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Suppression de l'ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si disponible
        if (response) {
          return response;
        }

        // Sinon, faire la requête réseau
        return fetch(event.request).then((response) => {
          // Vérifier si la réponse est valide
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Cloner la réponse pour le cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // En cas d'erreur réseau, retourner une page offline
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});

// Gestion des notifications push (pour futures fonctionnalités)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nouvelle notification",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Voir les détails",
        icon: "/logo192.png",
      },
      {
        action: "close",
        title: "Fermer",
        icon: "/logo192.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("APLOFR", options));
});
