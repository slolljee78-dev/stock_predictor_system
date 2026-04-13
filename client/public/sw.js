/**
 * Service Worker for Stock Predictor PWA
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_NAME = 'stock-predictor-v6-network-first-html';
const URLS_TO_CACHE = [
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - API unavailable' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Network-first strategy for HTML navigation requests
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received');

  if (!event.data) {
    console.log('[Service Worker] Push notification has no data');
    return;
  }

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Stock Predictor Alert',
      body: event.data.text(),
    };
  }

  const options = {
    body: notificationData.body || '',
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/icon-192x192.png',
    tag: notificationData.tag || 'stock-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
    data: notificationData.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Stock Predictor', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app window
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(clientList => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline trades
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-trades') {
    event.waitUntil(
      // Sync pending trades when connection is restored
      fetch('/api/trpc/trades.sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => {
        console.error('[Service Worker] Sync failed:', err);
      })
    );
  }
});

// Periodic background sync for price updates
self.addEventListener('periodicsync', event => {
  console.log('[Service Worker] Periodic sync:', event.tag);

  if (event.tag === 'update-prices') {
    event.waitUntil(
      fetch('/api/trpc/stocks.updatePrices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => {
        console.error('[Service Worker] Price update failed:', err);
      })
    );
  }
});

console.log('[Service Worker] Loaded and ready - Network-first for HTML');
