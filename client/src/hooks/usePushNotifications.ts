/**
 * usePushNotifications Hook
 * Manages push notification subscription and registration
 */

import { useEffect, useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  const subscriptionQuery = trpc.pushNotifications.getSubscriptionCount.useQuery();
  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const isSupported =
          'serviceWorker' in navigator &&
          'PushManager' in window &&
          'Notification' in window;

        setState(prev => ({
          ...prev,
          isSupported,
          isLoading: false,
        }));

        if (isSupported && subscriptionQuery.data) {
          setState(prev => ({
            ...prev,
            isSubscribed: subscriptionQuery.data?.isSubscribed || false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        }));
      }
    };

    checkSupport();
  }, [subscriptionQuery.data]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[Push Notifications] Service worker registered:', registration);
        return registration;
      }
    } catch (error) {
      console.error('[Push Notifications] Service worker registration failed:', error);
      throw error;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
      }

      throw new Error('Notification permission denied');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request permission',
      }));
      throw error;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      // Request permission
      const permission = await requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Generate VAPID key (in production, use server-generated key)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BCEllJZWN5UKvwPHX4XMDvbAVQqLvvLcuCvnFXL0bHKGjJGhRBRVEYVKcKQVwVVqQsqCvLvWJvYvvUvQvvv'
        ) as any,
      });

      if (!subscription) {
        throw new Error('Failed to create push subscription');
      }

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      await subscribeMutation.mutateAsync({
        endpoint: subscriptionJson.endpoint || '',
        keys: {
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
        },
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return subscription;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [registerServiceWorker, requestPermission, subscribeMutation]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        throw new Error('Service worker not ready');
      }
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subscriptionJson = subscription.toJSON();
        await unsubscribeMutation.mutateAsync({
          endpoint: subscriptionJson.endpoint || '',
        });

        await subscription.unsubscribe();
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [unsubscribeMutation]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    registerServiceWorker,
  };
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): any {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
