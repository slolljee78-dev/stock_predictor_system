import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { PriceChart } from './PriceChart';
import { IndicatorChart } from './IndicatorChart';

interface SignalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: {
    ticker: string;
    signalType: 'buy' | 'sell' | 'hold';
    confidence: number;
    price: number;
    change: number;
    changePercent: number;
    rsi: number | null;
    macd: number | null;
    timestamp: number;
    reasoning?: string;
    indicators?: string[];
    technicalData?: {
      smaPosition?: string;
      bbPosition?: string;
    };
  };
}

export function SignalDetailsModal({ isOpen, onClose, signal }: SignalDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyTicker = () => {
    navigator.clipboard.writeText(signal.ticker);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPositive = signal.changePercent >= 0;
  const isGreen = signal.signalType === 'buy';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-foreground">{signal.ticker}</h2>
            <Badge
              variant={isGreen ? 'default' : 'destructive'}
              className={isGreen ? 'bg-green-600' : 'bg-red-600'}
            >
              {signal.signalType.toUpperCase()}
            </Badge>
          </div>
          <DialogDescription>
            Real-time trading signal analysis and technical indicators
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-2xl font-bold text-foreground">${signal.price.toFixed(2)}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Price Change</p>
                <div className={`text-2xl font-bold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {isPositive ? '+' : ''}
                  {signal.change.toFixed(2)} ({signal.changePercent.toFixed(2)}%)
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Signal Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-foreground">{signal.confidence}%</div>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        signal.confidence >= 70 ? 'bg-green-500' : signal.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Signal Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(signal.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyTicker}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Ticker
                  </>
                )}
              </Button>
              <Button className="flex-1">
                {signal.signalType === 'buy' ? 'Buy Now' : 'Sell Now'}
              </Button>
              <Button variant="outline" className="flex-1">
                Add to Watchlist
              </Button>
            </div>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">RSI (14)</p>
                <p className="text-3xl font-bold text-foreground">
                  {signal.rsi !== null ? signal.rsi.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {signal.rsi !== null ? (
                    signal.rsi < 30 ? 'Oversold - Potential Buy' : signal.rsi > 70 ? 'Overbought - Potential Sell' : 'Neutral'
                  ) : 'No data'}
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">MACD</p>
                <p className="text-3xl font-bold text-foreground">
                  {signal.macd !== null ? signal.macd.toFixed(4) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {signal.macd !== null ? (signal.macd > 0 ? 'Bullish Signal' : 'Bearish Signal') : 'No data'}
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">SMA Position</p>
                <p className="text-lg font-semibold text-foreground">
                  {signal.technicalData?.smaPosition ? signal.technicalData.smaPosition.charAt(0).toUpperCase() + signal.technicalData.smaPosition.slice(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Price relative to moving averages
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Bollinger Bands</p>
                <p className="text-lg font-semibold text-foreground">
                  {signal.technicalData?.bbPosition ? signal.technicalData.bbPosition.charAt(0).toUpperCase() + signal.technicalData.bbPosition.slice(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Price position within bands
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="border border-border rounded-lg p-4">
              <PriceChart
                data={[
                  { time: '9:30', price: signal.price * 0.98, sma20: signal.price * 0.97, sma50: signal.price * 0.96 },
                  { time: '10:00', price: signal.price * 0.99, sma20: signal.price * 0.975, sma50: signal.price * 0.965 },
                  { time: '10:30', price: signal.price, sma20: signal.price * 0.98, sma50: signal.price * 0.97 },
                  { time: '11:00', price: signal.price * 1.01, sma20: signal.price * 0.985, sma50: signal.price * 0.975 },
                  { time: '11:30', price: signal.price * 1.02, sma20: signal.price * 0.99, sma50: signal.price * 0.98 },
                ]}
                height={300}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <IndicatorChart
                  type="rsi"
                  data={[
                    { time: '9:30', rsi: 35 },
                    { time: '10:00', rsi: 42 },
                    { time: '10:30', rsi: 50 },
                    { time: '11:00', rsi: 58 },
                    { time: '11:30', rsi: 65 },
                  ]}
                  height={250}
                />
              </div>

              <div className="border border-border rounded-lg p-4">
                <IndicatorChart
                  type="macd"
                  data={[
                    { time: '9:30', macd: -0.0012, signal: -0.0010, histogram: -0.0002 },
                    { time: '10:00', macd: -0.0008, signal: -0.0009, histogram: 0.0001 },
                    { time: '10:30', macd: -0.0003, signal: -0.0008, histogram: 0.0005 },
                    { time: '11:00', macd: 0.0002, signal: -0.0006, histogram: 0.0008 },
                    { time: '11:30', macd: 0.0008, signal: -0.0004, histogram: 0.0012 },
                  ]}
                  height={250}
                />
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Signal Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {signal.reasoning || 'This signal was generated based on multiple technical indicators showing convergence. The confidence level reflects the strength of the signal based on RSI, MACD, moving averages, and Bollinger Bands analysis.'}
              </p>
            </div>

            {signal.indicators && signal.indicators.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Triggered Indicators</h3>
                <div className="flex flex-wrap gap-2">
                  {signal.indicators.map((indicator, idx) => (
                    <Badge key={idx} variant="secondary">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-2">Disclaimer</h3>
              <p className="text-xs text-muted-foreground">
                This signal is generated by automated technical analysis and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making trading decisions.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
