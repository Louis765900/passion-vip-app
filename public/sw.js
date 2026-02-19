// Service Worker - PronoScope PWA
// Version 2.0 - Caching offline complet

const CACHE_NAME = 'pronoscope-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// Pages à mettre en cache dynamiquement
const CACHEABLE_ROUTES = [
  '/matchs',
  '/mes-paris',
  '/vip'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS.filter(asset =>
          !asset.includes('offline.html') // Skip if doesn't exist yet
        )).catch(err => {
          console.log('[SW] Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de fetch: Network First avec fallback cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requêtes API (sauf stats publiques)
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/api/stats')) {
    return;
  }

  // Ignorer les requêtes externes
  if (url.origin !== location.origin) return;

  // Stratégie: Stale While Revalidate pour les assets statiques
  if (request.destination === 'image' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Stratégie: Network First pour les pages
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Mettre en cache les pages principales
        if (networkResponse.ok &&
            (url.pathname === '/' || CACHEABLE_ROUTES.some(r => url.pathname.startsWith(r)))) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback: chercher dans le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback ultime: page offline
        if (request.destination === 'document') {
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;

          // Fallback basique si pas de page offline
          return new Response(
            `<!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Hors ligne - PronoScope</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                  color: white;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0;
                  padding: 20px;
                }
                .container {
                  text-align: center;
                  max-width: 400px;
                }
                .icon {
                  font-size: 64px;
                  margin-bottom: 20px;
                }
                h1 {
                  color: #39ff14;
                  margin-bottom: 16px;
                }
                p {
                  color: rgba(255,255,255,0.7);
                  line-height: 1.6;
                }
                button {
                  margin-top: 24px;
                  padding: 12px 32px;
                  background: linear-gradient(135deg, #39ff14, #32e010);
                  color: #0a0a0a;
                  border: none;
                  border-radius: 8px;
                  font-weight: 600;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">📡</div>
                <h1>Vous êtes hors ligne</h1>
                <p>Impossible de charger cette page. Vérifiez votre connexion internet et réessayez.</p>
                <button onclick="location.reload()">Réessayer</button>
              </div>
            </body>
            </html>`,
            {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }

        return new Response('Offline', { status: 503 });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'PronoScope';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: data.url || '/mes-paris',
      betId: data.betId
    },
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ],
    tag: data.betId || 'pronosport-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gestion du clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/mes-paris';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Synchronisation en arrière-plan (pour les paris en attente)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bets') {
    console.log('[SW] Syncing pending bets...');
    event.waitUntil(
      // Logique de synchronisation des paris
      Promise.resolve()
    );
  }
});

// Message pour communiquer avec l'app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return Promise.all(
          urls.map(url =>
            fetch(url).then(response => {
              if (response.ok) {
                cache.put(url, response);
              }
            }).catch(() => {})
          )
        );
      })
    );
  }
});
