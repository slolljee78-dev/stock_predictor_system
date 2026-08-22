import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketOverview() {
  // Mock data for top movers
  const topGainers = [
    { ticker: "NVDA", change: 5.2, price: 875.50 },
    { ticker: "TSLA", change: 3.8, price: 245.30 },
    { ticker: "META", change: 2.9, price: 485.20 },
  ];

  const topLosers = [
    { ticker: "BP", change: -2.1, price: 42.15 },
    { ticker: "XOM", change: -1.8, price: 105.40 },
    { ticker: "KO", change: -1.2, price: 58.90 },
  ];

  const marketSentiment = {
    bullish: 65,
    neutral: 25,
    bearish: 10,
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Gainers
            </CardTitle>
            <CardDescription>Best performing stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGainers.map(stock => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                  <div>
                    <p className="font-semibold">{stock.ticker}</p>
                    <p className="text-sm text-muted-foreground">${stock.price.toFixed(2)}</p>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{stock.change.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top Losers
            </CardTitle>
            <CardDescription>Worst performing stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLosers.map(stock => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                  <div>
                    <p className="font-semibold">{stock.ticker}</p>
                    <p className="text-sm text-muted-foreground">${stock.price.toFixed(2)}</p>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {stock.change.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Market Sentiment</CardTitle>
          <CardDescription>Overall trading signal distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Bullish Signals</span>
                <span className="text-sm font-semibold">{marketSentiment.bullish}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${marketSentiment.bullish}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Neutral Signals</span>
                <span className="text-sm font-semibold">{marketSentiment.neutral}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${marketSentiment.neutral}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Bearish Signals</span>
                <span className="text-sm font-semibold">{marketSentiment.bearish}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${marketSentiment.bearish}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
