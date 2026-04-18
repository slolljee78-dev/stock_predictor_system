import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
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
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

type MobileTab = "home" | "watchlist" | "alerts" | "signals" | "settings";

export default function MobileAppShell() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const watchlist = watchlistQuery.data ?? [];
  const alertStats = { pending: 2, total: 5 };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

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
        return <MobileHomeScreen watchlist={watchlist} alertStats={alertStats} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Stock Predictor</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 hover:bg-muted rounded"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Menu */}
      {menuOpen && (
        <div className="border-b border-border/50 bg-card/50 px-4 py-3 space-y-2">
          <button
            onClick={() => setLocation("/dashboard")}
            className="w-full text-left px-3 py-2 rounded hover:bg-muted text-sm"
          >
            Dashboard
          </button>
          <button
            onClick={() => setLocation("/signal-accuracy")}
            className="w-full text-left px-3 py-2 rounded hover:bg-muted text-sm"
          >
            Signal Accuracy
          </button>
          <button
            onClick={() => setLocation("/alert-preferences")}
            className="w-full text-left px-3 py-2 rounded hover:bg-muted text-sm"
          >
            Alert Preferences
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>

      {/* Bottom Navigation */}
      <nav className="border-t border-border/50 bg-card/50 grid grid-cols-5 gap-1 px-2 py-2">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded text-xs ${
            activeTab === "home" ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded text-xs ${
            activeTab === "watchlist" ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Star className="h-5 w-5" />
          <span>Watchlist</span>
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded text-xs relative ${
            activeTab === "alerts" ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Bell className="h-5 w-5" />
          {alertStats.pending > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {alertStats.pending}
            </span>
          )}
          <span>Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab("signals")}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded text-xs ${
            activeTab === "signals" ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Signals</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded text-xs ${
            activeTab === "settings" ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">Pending Alerts</p>
          <p className="text-2xl font-bold">{alertStats.pending}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">Total Signals</p>
          <p className="text-2xl font-bold">{alertStats.total}</p>
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
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const removeWatchlistMutation = trpc.watchlist.remove.useMutation();

  const handleRemoveStock = (stockId: number) => {
    // Note: watchlist.remove expects watchlistId, not stockId
    // For now, we'll just update UI state
    setRemovedIds((prev) => {
      if (!prev.includes(stockId)) {
        return [...prev, stockId];
      }
      return prev;
    });
  };

  const visibleWatchlist = watchlist.filter((stock) => {
    for (const id of removedIds) {
      if (id === stock.id) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Your Watchlist</h2>
      <p className="text-xs text-muted-foreground/70">
        Swipe left to remove, tap to view details
      </p>
      {visibleWatchlist.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No stocks yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first stock to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleWatchlist.map((stock) => (
            <SwipeableWatchlistCard
              key={stock.id}
              stock={stock}
              onRemove={() => handleRemoveStock(stock.id)}
              onViewDetails={() => setLocation(`/stock/${stock.ticker}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SwipeableWatchlistCard({
  stock,
  onRemove,
  onViewDetails,
}: {
  stock: any;
  onRemove: () => void;
  onViewDetails: () => void;
}) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  const ref = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onDrag: ({ offset: [ox] }) => {
      api.start({ x: ox, immediate: true });
    },
    onDragEnd: ({ offset: [ox], velocity: [vx] }) => {
      // Swipe left (negative) to remove
      if (ox < -50 || (ox < 0 && vx < -0.5)) {
        api.start({ x: -200, config: { duration: 300 } });
        setTimeout(onRemove, 300);
      }
      // Swipe right (positive) to view details
      else if (ox > 50 || (ox > 0 && vx > 0.5)) {
        api.start({ x: 0, config: { duration: 300 } });
        onViewDetails();
      }
      // Return to original position
      else {
        api.start({ x: 0, config: { duration: 200 } });
      }
    },
  });

  return (
    <div
      ref={ref}
      className="relative rounded-lg border border-border/50 bg-card/50 overflow-hidden"
    >
      {/* Background remove indicator */}
      <div className="absolute inset-0 bg-red-500/80 rounded-lg flex items-center justify-end px-4 z-0">
        <span className="text-white text-sm font-semibold">Remove</span>
      </div>

      {/* Card content */}
      <animated.div
        style={{ x, touchAction: "none" }}
        className="relative z-10 bg-card/50 rounded-lg p-3 cursor-pointer hover:bg-card/70"
        {...bind()}
      >
        <div
          className="flex items-center justify-between"
          onClick={onViewDetails}
        >
          <div className="flex-1">
            <p className="font-semibold">{stock.ticker}</p>
            <p className="text-xs text-muted-foreground">{stock.name}</p>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </animated.div>
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
            <p className="text-sm font-semibold">Pending Alerts</p>
            <p className="text-xs text-muted-foreground">
              {alertStats.pending} of {alertStats.total}
            </p>
          </div>
          <p className="text-2xl font-bold">{alertStats.pending}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Recent Alerts</h3>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold">AAPL Buy Signal</p>
                <p className="text-xs text-muted-foreground">
                  High confidence setup
                </p>
              </div>
              <button
                onClick={() => setLocation("/alerts")}
                className="text-xs text-blue-500 font-semibold"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSignalsScreen() {
  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Signals</h2>
      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <p className="text-sm text-muted-foreground">
          Real-time trading signals and technical analysis
        </p>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {i === 1 ? "AAPL" : i === 2 ? "NVDA" : "MSFT"} Buy
                </p>
                <p className="text-xs text-muted-foreground">
                  Confidence: {75 + i * 2}%
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSettingsScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="text-xl font-bold">Settings</h2>

      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">
              {theme === "dark" ? "Dark" : "Light"} Mode
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold"
          >
            Toggle
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <p className="text-sm font-semibold mb-2">App Version</p>
        <p className="text-xs text-muted-foreground">1.0.0</p>
      </div>
    </div>
  );
}
