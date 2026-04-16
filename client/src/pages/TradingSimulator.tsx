import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  DollarSign,
  History,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Portfolio {
  id: number;
  name: string;
  initialCapital: number;
  currentValue: number;
  cash: number;
  totalReturn: number;
  totalReturnPercent: number;
}

interface Position {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

interface Trade {
  id: number;
  ticker: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

export default function TradingSimulator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: 1,
      name: "Core Strategy",
      initialCapital: 10000,
      currentValue: 11247,
      cash: 5000,
      totalReturn: 1247,
      totalReturnPercent: 12.47,
    },
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(portfolios[0]);
  const [positions, setPositions] = useState<Position[]>([
    {
      ticker: "AAPL",
      quantity: 10,
      entryPrice: 180.5,
      currentPrice: 185.2,
      unrealizedPnL: 47,
      unrealizedPnLPercent: 2.6,
    },
    {
      ticker: "NVDA",
      quantity: 5,
      entryPrice: 890,
      currentPrice: 892.5,
      unrealizedPnL: 12.5,
      unrealizedPnLPercent: 0.28,
    },
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: 1,
      ticker: "AAPL",
      type: "buy",
      quantity: 10,
      price: 180.5,
      date: "2026-04-11 09:30",
    },
    {
      id: 2,
      ticker: "NVDA",
      type: "buy",
      quantity: 5,
      price: 890,
      date: "2026-04-11 10:15",
    },
  ]);

  const [tradeForm, setTradeForm] = useState({
    ticker: "",
    quantity: "",
    price: "",
  });

  const exposure = useMemo(() => {
    return selectedPortfolio.currentValue - selectedPortfolio.cash;
  }, [selectedPortfolio]);

  const handleTrade = (type: "buy" | "sell") => {
    if (!tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) {
      alert("Please fill in all fields");
      return;
    }

    const newTrade: Trade = {
      id: trades.length + 1,
      ticker: tradeForm.ticker.toUpperCase(),
      type,
      quantity: parseInt(tradeForm.quantity, 10),
      price: parseFloat(tradeForm.price),
      date: new Date().toLocaleString(),
    };

    setTrades((current) => [newTrade, ...current]);
    setTradeForm({ ticker: "", quantity: "", price: "" });
  };

  const createPortfolio = () => {
    const newPortfolio: Portfolio = {
      id: portfolios.length + 1,
      name: `Portfolio ${portfolios.length + 1}`,
      initialCapital: 10000,
      currentValue: 10000,
      cash: 10000,
      totalReturn: 0,
      totalReturnPercent: 0,
    };
    setPortfolios((current) => [...current, newPortfolio]);
    setSelectedPortfolio(newPortfolio);
  };

  const resetPortfolio = () => {
    if (window.confirm("Reset this simulator portfolio? This cannot be undone.")) {
      setPositions([]);
      setTrades([]);
      setSelectedPortfolio((current) => ({
        ...current,
        currentValue: current.initialCapital,
        cash: current.initialCapital,
        totalReturn: 0,
        totalReturnPercent: 0,
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 lg:space-y-10">
        <section className="dashboard-frame px-6 py-7 md:px-8 md:py-9">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="space-y-4">
              <div className="eyebrow">
                <Target className="h-4 w-4 text-primary" />
                Trading simulator
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                Pressure-test your ideas before you commit real capital.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                Use the simulator to practise position sizing, compare trade outcomes, and develop a cleaner routine before moving ideas into your real trading workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Portfolio value" value={`£${selectedPortfolio.currentValue.toFixed(0)}`} />
              <Metric label="Return" value={`${selectedPortfolio.totalReturnPercent.toFixed(2)}%`} positive={selectedPortfolio.totalReturnPercent >= 0} />
              <Metric label="Open positions" value={String(positions.length)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardHeader className="pb-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-3xl font-semibold tracking-tight">Portfolios</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Separate strategies, compare approaches, and keep your simulated decision-making organised.
                  </CardDescription>
                </div>
                <Button onClick={createPortfolio} className="pill-button pill-button-primary h-12 px-5">
                  <Plus className="h-4 w-4" />
                  New portfolio
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                {portfolios.map((portfolio) => {
                  const active = selectedPortfolio.id === portfolio.id;
                  return (
                    <Button
                      key={portfolio.id}
                      onClick={() => setSelectedPortfolio(portfolio)}
                      variant={active ? "default" : "outline"}
                      className={active ? "pill-button pill-button-primary h-11 px-5" : "pill-button pill-button-secondary h-11 px-5"}
                    >
                      {portfolio.name}
                    </Button>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Starting capital" value={`£${selectedPortfolio.initialCapital.toFixed(2)}`} helper="Initial allocation" />
                <InfoCard label="Cash on hand" value={`£${selectedPortfolio.cash.toFixed(2)}`} helper={`${((selectedPortfolio.cash / selectedPortfolio.currentValue) * 100).toFixed(1)}% in cash`} />
                <InfoCard label="Market exposure" value={`£${exposure.toFixed(2)}`} helper="Capital currently deployed" />
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardHeader className="pb-5">
              <CardTitle className="text-3xl font-semibold tracking-tight">Execute a test trade</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter a ticker, quantity, and fill price to simulate a buy or sell. This is a lightweight training workspace for process validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-foreground">Ticker</label>
                  <Input
                    placeholder="e.g. AAPL"
                    value={tradeForm.ticker}
                    onChange={(event) => setTradeForm((current) => ({ ...current, ticker: event.target.value }))}
                    className="mt-2 h-12 rounded-2xl bg-background/45"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Quantity</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={tradeForm.quantity}
                    onChange={(event) => setTradeForm((current) => ({ ...current, quantity: event.target.value }))}
                    className="mt-2 h-12 rounded-2xl bg-background/45"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Price per share</label>
                  <Input
                    type="number"
                    placeholder="180.50"
                    value={tradeForm.price}
                    onChange={(event) => setTradeForm((current) => ({ ...current, price: event.target.value }))}
                    className="mt-2 h-12 rounded-2xl bg-background/45"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => handleTrade("buy")} className="pill-button h-12 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  Simulate buy
                </Button>
                <Button onClick={() => handleTrade("sell")} className="pill-button h-12 bg-rose-500 text-white hover:bg-rose-400">
                  <TrendingDown className="h-4 w-4" />
                  Simulate sell
                </Button>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/35 p-5 text-sm text-muted-foreground">
                Tip: use the simulator after reviewing a signal on the dashboard so you can pressure-test sizing and entry assumptions before placing a real trade.
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="rounded-full bg-card/70 p-1">
            <TabsTrigger value="positions" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="mr-2 h-4 w-4" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-semibold tracking-tight">Open positions</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Review active exposure and unrealised profit or loss in one place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-10 text-center">
                    <p className="text-lg font-medium text-foreground">No open positions</p>
                    <p className="mt-2 text-sm text-muted-foreground">Simulate a trade to create your first test position.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {positions.map((position) => (
                      <div key={position.ticker} className="rounded-3xl border border-border/70 bg-background/35 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-semibold tracking-tight text-foreground">{position.ticker}</p>
                              <Badge variant="secondary" className="rounded-full px-3 py-1">{position.quantity} shares</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Entry £{position.entryPrice.toFixed(2)} • Current £{position.currentPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xl font-semibold text-foreground">£{position.unrealizedPnL.toFixed(2)}</p>
                            <p className={`text-sm font-semibold ${position.unrealizedPnL >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                              {position.unrealizedPnLPercent >= 0 ? "+" : ""}{position.unrealizedPnLPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-semibold tracking-tight">Trade history</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  A running log of your practice trades so you can learn from execution patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trades.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-10 text-center">
                    <p className="text-lg font-medium text-foreground">No simulated trades yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">Your practice trade history will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/35">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th>Ticker</th>
                          <th>Side</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((trade) => (
                          <tr key={trade.id}>
                            <td className="font-semibold text-foreground">{trade.ticker}</td>
                            <td>
                              <Badge className={trade.type === "buy" ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/25" : "bg-rose-400/15 text-rose-300 border border-rose-400/25"}>
                                {trade.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td>{trade.quantity}</td>
                            <td>£{trade.price.toFixed(2)}</td>
                            <td>{trade.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" className="pill-button pill-button-secondary h-11 px-5" onClick={resetPortfolio}>
            <DollarSign className="h-4 w-4" />
            Reset portfolio
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-3">{value}</p>
      {positive !== undefined && (
        <p className={`mt-3 text-sm font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
          {positive ? "Positive performance" : "Needs review"}
        </p>
      )}
    </div>
  );
}

function InfoCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/35 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}
