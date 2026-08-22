import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[App] Service Worker registered:', reg);
          setIsRegistered(true);
          setRegistration(reg);

          // Check for updates periodically
          setInterval(() => {
            reg.update();
          }, 60000); // Check every minute
        })
        .catch(err => {
          console.error('[App] Service Worker registration failed:', err);
        });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service Worker updated');
        // Optionally notify user about app update
        window.location.reload();
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('[App] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const subscribeToPushNotifications = async () => {
    if (!registration || !isSupported) {
      console.warn('[App] Cannot subscribe to push notifications');
      return null;
    }

    try {
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create a new subscription
        // Note: This requires a valid VAPID public key
        // In production, you would get this from your backend
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
        });

        console.log('[App] Subscribed to push notifications:', subscription);

        // Send subscription to backend
        // await fetch('/api/trpc/notifications.subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subscription),
        // });
      }

      return subscription;
    } catch (error) {
      console.error('[App] Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!registration) {
      return;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[App] Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('[App] Failed to unsubscribe from push notifications:', error);
    }
  };

  return {
    isSupported,
    isRegistered,
    registration,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  };
}
