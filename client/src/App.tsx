import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { scrollRouteToTop } from "@/lib/navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AppInstallPrompt from "./components/AppInstallPrompt";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import TradingSimulator from "./pages/TradingSimulator";
import ValidationSetup from "./pages/ValidationSetup";
import ValidationDashboard from "./pages/ValidationDashboard";
import Pricing from "./pages/Pricing";
import WatchlistSettings from "./pages/WatchlistSettings";
import FAQ from "./pages/FAQ";
import { Backtesting } from "./pages/Backtesting";
import SignalsDashboard from "./pages/SignalsDashboard";
import { AlertNotificationCenter } from "./pages/AlertNotificationCenter";
import MobileAppShell from "./pages/MobileAppShell";
import SignalAccuracyDashboard from "./pages/SignalAccuracyDashboard";
import AlertPreferencesPage from "./pages/AlertPreferencesPage";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    scrollRouteToTop();
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/stock/:ticker" component={StockDetail} />
      <Route path="/simulator" component={TradingSimulator} />
      <Route path="/validation/setup" component={ValidationSetup} />
      <Route path="/validation/dashboard" component={ValidationDashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/backtesting" component={Backtesting} />
      <Route path="/signals" component={SignalsDashboard} />
      <Route path="/alerts" component={AlertNotificationCenter} />
      <Route path="/signal-accuracy" component={SignalAccuracyDashboard} />
      <Route path="/alert-preferences" component={AlertPreferencesPage} />
      <Route path="/mobile" component={MobileAppShell} />
      <Route path="/watchlist/:watchlistId/settings" component={WatchlistSettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable={true}
      >
        <TooltipProvider>
          <Router />
          <AppInstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
