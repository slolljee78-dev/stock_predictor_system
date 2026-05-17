import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type OrderType = 'market' | 'limit' | 'stop-loss';

interface OrderTypeSelectorProps {
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  currentPrice: number | null;
  limitPrice: string;
  onLimitPriceChange: (price: string) => void;
  stopPrice: string;
  onStopPriceChange: (price: string) => void;
  tradeType: 'buy' | 'sell';
  isLoading?: boolean;
}

export function OrderTypeSelector({
  orderType,
  onOrderTypeChange,
  currentPrice,
  limitPrice,
  onLimitPriceChange,
  stopPrice,
  onStopPriceChange,
  tradeType,
  isLoading = false,
}: OrderTypeSelectorProps) {
  const [showInfo, setShowInfo] = useState(false);

  const orderTypeInfo = {
    market: {
      label: 'Market Order',
      description: 'Execute immediately at current market price',
      icon: '⚡',
      color: 'bg-blue-500/15 border-blue-500/20',
    },
    limit: {
      label: 'Limit Order',
      description: tradeType === 'buy'
        ? 'Buy at or below your specified price'
        : 'Sell at or above your specified price',
      icon: '📍',
      color: 'bg-amber-500/15 border-amber-500/20',
    },
    'stop-loss': {
      label: 'Stop-Loss Order',
      description: 'Sell if price drops below your specified level (risk management)',
      icon: '🛑',
      color: 'bg-red-500/15 border-red-500/20',
    },
  };

  const currentInfo = orderTypeInfo[orderType];

  return (
    <div className="space-y-4">
      {/* Order Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['market', 'limit', 'stop-loss'] as const).map((type) => (
          <Button
            key={type}
            variant={orderType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onOrderTypeChange(type)}
            disabled={isLoading || (type === 'stop-loss' && tradeType === 'buy')}
            className="gap-2"
          >
            {orderTypeInfo[type].icon}
            {orderTypeInfo[type].label}
          </Button>
        ))}
      </div>

      {/* Order Type Description */}
      <Card className={`border ${currentInfo.color}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm">{currentInfo.label}</CardTitle>
              <CardDescription className="mt-1">{currentInfo.description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Info */}
      {showInfo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            {orderType === 'market' && (
              <div>
                <p className="font-medium">Market Order Details:</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
                  <li>Executes immediately at best available price</li>
                  <li>Subject to 0.05% slippage and 0.1% commission</li>
                  <li>Guaranteed execution but price may differ from current price</li>
                </ul>
              </div>
            )}
            {orderType === 'limit' && (
              <div>
                <p className="font-medium">Limit Order Details:</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
                  <li>Remains pending until price reaches your limit</li>
                  <li>Buy: executes at or below your price</li>
                  <li>Sell: executes at or above your price</li>
                  <li>May not execute if price never reaches your limit</li>
                  <li>Commission applies when order fills</li>
                </ul>
              </div>
            )}
            {orderType === 'stop-loss' && (
              <div>
                <p className="font-medium">Stop-Loss Order Details:</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
                  <li>Automatically sells if price drops to your stop level</li>
                  <li>Helps limit losses on existing positions</li>
                  <li>Converts to market order when triggered</li>
                  <li>May execute below stop price due to slippage</li>
                  <li>Commission applies when order executes</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Limit Price Input */}
      {orderType === 'limit' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {tradeType === 'buy' ? 'Maximum Buy Price' : 'Minimum Sell Price'}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={currentPrice ? currentPrice.toFixed(2) : 'Enter price'}
              value={limitPrice}
              onChange={(e) => onLimitPriceChange(e.target.value)}
              disabled={isLoading}
              step="0.01"
              min="0"
              className="flex-1"
            />
            {currentPrice && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground">
                Current: £{currentPrice.toFixed(2)}
              </div>
            )}
          </div>
          {limitPrice && currentPrice && (
            <div className="text-xs text-muted-foreground">
              {tradeType === 'buy' ? (
                parseFloat(limitPrice) > currentPrice ? (
                  <span className="text-amber-600">⚠️ Limit price is above current price - order may execute immediately</span>
                ) : (
                  <span className="text-green-600">✓ Will buy at or below £{parseFloat(limitPrice).toFixed(2)}</span>
                )
              ) : (
                parseFloat(limitPrice) < currentPrice ? (
                  <span className="text-amber-600">⚠️ Limit price is below current price - order may execute immediately</span>
                ) : (
                  <span className="text-green-600">✓ Will sell at or above £{parseFloat(limitPrice).toFixed(2)}</span>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Stop Price Input */}
      {orderType === 'stop-loss' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Stop-Loss Price (Sell if price drops below)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={currentPrice ? currentPrice.toFixed(2) : 'Enter stop price'}
              value={stopPrice}
              onChange={(e) => onStopPriceChange(e.target.value)}
              disabled={isLoading}
              step="0.01"
              min="0"
              className="flex-1"
            />
            {currentPrice && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground">
                Current: £{currentPrice.toFixed(2)}
              </div>
            )}
          </div>
          {stopPrice && currentPrice && (
            <div className="text-xs text-muted-foreground">
              {parseFloat(stopPrice) >= currentPrice ? (
                <span className="text-red-600">⚠️ Stop price is at or above current price - order may trigger immediately</span>
              ) : (
                <span className="text-green-600">✓ Will sell if price drops to £{parseFloat(stopPrice).toFixed(2)}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Restrictions Notice */}
      {tradeType === 'buy' && orderType === 'stop-loss' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Stop-loss orders are only available for sell orders (to protect existing positions). Use limit orders to buy at a specific price.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
