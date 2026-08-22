import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'stock-predictor-install-prompt-dismissed';
const PROMPT_DELAY_MS = 12_000;

export default function AppInstallPrompt() {
  const [location] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasEngaged, setHasEngaged] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setShowPrompt(false);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleEngagement = () => setHasEngaged(true);

    const handleAppInstalled = () => {
      console.log('[App] PWA installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      sessionStorage.setItem(DISMISS_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pointerdown', handleEngagement, { once: true, passive: true });
    window.addEventListener('keydown', handleEngagement, { once: true });
    window.addEventListener('scroll', handleEngagement, { once: true, passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pointerdown', handleEngagement);
      window.removeEventListener('keydown', handleEngagement);
      window.removeEventListener('scroll', handleEngagement);
    };
  }, []);

  useEffect(() => {
    if (!deferredPrompt || !hasEngaged || location !== '/' || sessionStorage.getItem(DISMISS_KEY) === '1') {
      return;
    }

    const timeout = window.setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [deferredPrompt, hasEngaged, location]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[App] User accepted install prompt');
        sessionStorage.setItem(DISMISS_KEY, '1');
      } else {
        console.log('[App] User dismissed install prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[App] Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setShowPrompt(false);
  };

  const shouldRenderOnThisRoute = location === '/';

  if (!showPrompt || isInstalled || !deferredPrompt || !shouldRenderOnThisRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4 sm:bottom-6 sm:right-6 sm:px-0" role="region" aria-label="Install Vortextrade">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Install App</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
              aria-label="Dismiss install app prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Get instant access to stock signals and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Install Vortextrade on your device for quick access and offline support.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
