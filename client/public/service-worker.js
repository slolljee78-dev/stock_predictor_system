/**
 * Service Worker for Push Notifications
 * Handles push notification events and background sync
 */

// Cache version
const CACHE_VERSION = 'stock-predictor-v1';

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received:', event);

  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
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

  const {
    title = 'Stock Predictor',
    body = 'New alert received',
    icon = '/logo.png',
    badge = '/badge.png',
    tag = 'stock-predictor-notification',
    data = {},
    actions = [],
  } = notificationData;

  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    actions,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/dashboard';
  const action = event.action;

  // Handle specific actions
  if (action === 'view' || action === 'trade' || !action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (action === 'dismiss') {
    // Just close the notification (already done above)
  }
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
  // Could log analytics here
});

// Background sync for offline notifications
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-alerts') {
    event.waitUntil(
      fetch('/api/trpc/alerts.getPendingAlerts')
        .then(response => response.json())
        .then(data => {
          console.log('[Service Worker] Synced alerts:', data);
        })
        .catch(err => {
          console.error('[Service Worker] Sync failed:', err);
          throw err; // Retry sync
        })
    );
  }
});

// Message event - handle messages from clients
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    console.log('[Service Worker] Periodic sync:', event.tag);

    if (event.tag === 'update-alerts') {
      event.waitUntil(
        fetch('/api/trpc/alerts.getAlertStats')
          .then(response => response.json())
          .then(data => {
            console.log('[Service Worker] Alert stats updated:', data);
          })
          .catch(err => {
            console.error('[Service Worker] Periodic sync failed:', err);
          })
      );
    }
  });
}
