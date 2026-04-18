import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3,
  Bell,
  Home,
  Settings,
  Star,
  TrendingDown,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";


type MobileTab = "home" | "watchlist" | "alerts" | "signals" | "settings";

export default function MobileAppShell() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const watchlist = watchlistQuery.data ?? [];
  const alertStats = { pending: 2, total: 5 };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <MobileHomeScreen watchlist={watchlist} alertStats={alertStats} />;
      case "watchlist":
        return <MobileWatchlistScreen watchlist={watchlist} />;
      case "alerts":
        return <MobileAlertsScreen alertStats={alertStats} />;
      case "signals":
        return <MobileSignalsScreen />;
      case "settings":
        return <MobileSettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold">Stock Predictor</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-border/50 bg-background/50 px-4 py-3">
            <div className="space-y-2">
              {installPrompt && (
                <Button
                  onClick={handleInstallApp}
                  className="w-full justify-start text-sm"
                  variant="outline"
                >
                  Install App
                </Button>
              )}
              <Button
                onClick={() => setLocation("/dashboard/accuracy")}
                className="w-full justify-start text-sm"
                variant="ghost"
              >
                Signal Accuracy
              </Button>
              <Button
                onClick={() => setLocation("/dashboard/alerts-preferences")}
                className="w-full justify-start text-sm"
                variant="ghost"
              >
                Alert Settings
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {[
            { tab: "home" as MobileTab, icon: Home, label: "Home" },
            { tab: "watchlist" as MobileTab, icon: Star, label: "Watchlist" },
            { tab: "alerts" as MobileTab, icon: Bell, label: "Alerts", badge: alertStats.pending },
            { tab: "signals" as MobileTab, icon: TrendingUp, label: "Signals" },
            { tab: "settings" as MobileTab, icon: Settings, label: "Settings" },
          ].map(({ tab, icon: Icon, label, badge }) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMenuOpen(false);
              }}
              className={`relative flex flex-col items-center gap-1 rounded-lg py-2 px-1 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {badge ? (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
              <span className="line-clamp-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileHomeScreen({
  watchlist,
  alertStats,
}: {
  watchlist: any[];
  alertStats: any;
}) {
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          {watchlist.length} stocks tracked
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">Active Alerts</p>
          <p className="mt-2 text-2xl font-bold text-destructive">
            {alertStats.pending}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">Watchlist</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {watchlist.length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Recent Stocks</h2>
        {watchlist.slice(0, 3).map((stock) => (
          <div
            key={stock.id}
            className="rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{stock.ticker}</p>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileWatchlistScreen({ watchlist }: { watchlist: any[] }) {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Your Watchlist</h2>
      {watchlist.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No stocks yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first stock to get started
          </p>
        </div>
      ) : (
        watchlist.map((stock) => (
          <button
            key={stock.id}
            onClick={() => setLocation(`/stock/${stock.ticker}`)}
            className="w-full rounded-lg border border-border/50 bg-card/50 p-4 text-left transition-colors hover:bg-card/70"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">{stock.ticker}</p>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </button>
        ))
      )}
    </div>
  );
}

function MobileAlertsScreen({ alertStats }: { alertStats: any }) {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Alerts</h2>
      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending Alerts</p>
            <p className="mt-1 text-2xl font-bold">{alertStats.pending}</p>
          </div>
          <Bell className="h-8 w-8 text-primary" />
        </div>
      </div>

      <button
        onClick={() => setLocation("/dashboard/notifications")}
        className="w-full rounded-lg border border-border/50 bg-primary/20 p-4 text-center font-semibold text-primary transition-colors hover:bg-primary/30"
      >
        View All Alerts
      </button>
    </div>
  );
}

function MobileSignalsScreen() {
  const { data: signals = [] } = trpc.signals.getForUser.useQuery(undefined, {
    enabled: true,
  });

  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Latest Signals</h2>
      {signals && signals.slice(0, 5).map((signal: any) => (
        <div
          key={signal.id || Math.random()}
          className="rounded-lg border border-border/50 bg-card/50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold">{signal.ticker}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {signal.type} Signal
              </p>
            </div>
            {signal.type === "buy" ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileSettingsScreen() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-4 px-4 py-4">
      <h2 className="text-xl font-bold">Settings</h2>

      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <p className="text-xs text-muted-foreground">Account</p>
        <p className="mt-2 font-semibold">{user?.email}</p>
      </div>

      <button
        onClick={() => setLocation("/dashboard/alerts-preferences")}
        className="w-full rounded-lg border border-border/50 bg-card/50 p-4 text-left transition-colors hover:bg-card/70"
      >
        <p className="font-semibold">Alert Preferences</p>
        <p className="text-xs text-muted-foreground">
          Configure notification settings
        </p>
      </button>

      <button
        onClick={() => setLocation("/dashboard/accuracy")}
        className="w-full rounded-lg border border-border/50 bg-card/50 p-4 text-left transition-colors hover:bg-card/70"
      >
        <p className="font-semibold">Signal Accuracy</p>
        <p className="text-xs text-muted-foreground">
          View performance metrics
        </p>
      </button>
    </div>
  );
}
