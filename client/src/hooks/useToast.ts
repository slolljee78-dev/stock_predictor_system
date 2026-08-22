import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

// Simple in-memory toast store for now
let toastId = 0;
const toasts: Map<string, ToastMessage> = new Map();
const listeners: Set<() => void> = new Set();

export function useToast() {
  const notify = useCallback((
    title: string,
    type: ToastType = 'info',
    description?: string
  ) => {
    const id = `toast-${++toastId}`;
    const message: ToastMessage = { id, type, title, description };
    
    toasts.set(id, message);
    listeners.forEach(listener => listener());
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toasts.delete(id);
      listeners.forEach(listener => listener());
    }, 5000);
    
    return id;
  }, []);

  const success = useCallback((title: string, description?: string) => {
    return notify(title, 'success', description);
  }, [notify]);

  const error = useCallback((title: string, description?: string) => {
    return notify(title, 'error', description);
  }, [notify]);

  const info = useCallback((title: string, description?: string) => {
    return notify(title, 'info', description);
  }, [notify]);

  const warning = useCallback((title: string, description?: string) => {
    return notify(title, 'warning', description);
  }, [notify]);

  return { notify, success, error, info, warning };
}

// Export for external use
export { toasts, listeners };
