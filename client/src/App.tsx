import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/stock/:ticker" component={StockDetail} />
      <Route path="/simulator" component={TradingSimulator} />
      <Route path="/validation/setup" component={ValidationSetup} />
      <Route path="/validation/dashboard" component={ValidationDashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
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
// Production deployment fix - 1776101174
