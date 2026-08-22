import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { scrollRouteToTop } from "@/lib/navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AppInstallPrompt from "./components/AppInstallPrompt";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const StockDetail = lazy(() => import("./pages/StockDetail"));
const TradingSimulator = lazy(() => import("./pages/TradingSimulator"));
const ValidationSetup = lazy(() => import("./pages/ValidationSetup"));
const ValidationDashboard = lazy(() => import("./pages/ValidationDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const WatchlistSettings = lazy(() => import("./pages/WatchlistSettings"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Backtesting = lazy(async () => ({ default: (await import("./pages/Backtesting")).Backtesting }));
const SignalsDashboard = lazy(() => import("./pages/SignalsDashboard"));
const AlertNotificationCenter = lazy(async () => ({ default: (await import("./pages/AlertNotificationCenter")).AlertNotificationCenter }));
const MobileAppShell = lazy(() => import("./pages/MobileAppShell"));
const SignalAccuracyDashboard = lazy(() => import("./pages/SignalAccuracyDashboard"));
const AlertPreferencesPage = lazy(() => import("./pages/AlertPreferencesPage"));
const Analysis = lazy(() => import("./pages/Analysis"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Community = lazy(() => import("./pages/Community"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const StockScreener = lazy(() => import("./pages/StockScreener"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ReferralDashboard = lazy(() => import("./pages/ReferralDashboard"));
const TodaysSignals = lazy(() => import("./pages/TodaysSignals"));
const PublicStockPage = lazy(() => import("./pages/PublicStockPage"));
const SignalCalculator = lazy(() => import("./pages/SignalCalculator"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget"));
const EmbedPage = lazy(() => import("./pages/EmbedPage"));
const DataAndAccessPolicy = lazy(() => import("./pages/DataAndAccessPolicy"));
const Methodology = lazy(() => import("./pages/Methodology"));

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
      <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground" role="status">Loading page…</div>}>
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
      <Route path="/alerts-center" component={AlertNotificationCenter} />
      <Route path="/signal-accuracy" component={SignalAccuracyDashboard} />
      <Route path="/alert-preferences" component={AlertPreferencesPage} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/community" component={Community} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/affiliate" component={AffiliateDashboard} />
      <Route path="/screener" component={StockScreener} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/referral" component={ReferralDashboard} />
      <Route path="/signals/today" component={TodaysSignals} />
      <Route path="/stocks/:ticker" component={PublicStockPage} />
      <Route path="/tools/signal-calculator" component={SignalCalculator} />
      <Route path="/embed/signals" component={EmbedWidget} />
      <Route path="/embed" component={EmbedPage} />
      <Route path="/data-and-access" component={DataAndAccessPolicy} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/mobile" component={MobileAppShell} />
      <Route path="/watchlist/:watchlistId/settings" component={WatchlistSettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
      </Switch>
      </Suspense>
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
