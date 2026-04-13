import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';


type RiskStrategy = 'cautious' | 'balanced' | 'high_risk';

interface StrategyOption {
  id: RiskStrategy;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    id: 'cautious',
    name: 'Cautious',
    description: 'Conservative approach with high confidence requirements and tight stop losses. Best for risk-averse traders.',
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate approach balancing profit potential with risk management. Suitable for most traders.',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'high_risk',
    name: 'High Risk',
    description: 'Aggressive approach maximizing profit opportunities with wider stops and higher risk limits. For experienced traders.',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
];

interface RiskStrategySelectorProps {
  onStrategyChange?: (strategy: RiskStrategy) => void;
  showDescription?: boolean;
}

export function RiskStrategySelector({
  onStrategyChange,
  showDescription = true,
}: RiskStrategySelectorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<RiskStrategy>('balanced');
  const [isLoading, setIsLoading] = useState(false);


  const { data: currentStrategy } = trpc.riskStrategy.getCurrent.useQuery();
  const updateStrategyMutation = trpc.riskStrategy.update.useMutation();

  useEffect(() => {
    if (currentStrategy) {
      setSelectedStrategy(currentStrategy.strategy);
    }
  }, [currentStrategy]);

  const handleStrategyChange = async (strategy: RiskStrategy) => {
    setIsLoading(true);
    try {
      await updateStrategyMutation.mutateAsync({ strategy });
      setSelectedStrategy(strategy);
      onStrategyChange?.(strategy);
      console.log('Risk strategy updated to', strategy);
    } catch (error) {
      console.error('Failed to update risk strategy', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STRATEGY_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all ${
              selectedStrategy === option.id
                ? `${option.color} border-2 ${option.borderColor}`
                : 'hover:border-border'
            }`}
            onClick={() => !isLoading && handleStrategyChange(option.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="text-foreground">{option.icon}</div>
                <CardTitle className="text-lg">{option.name}</CardTitle>
              </div>
              {showDescription && (
                <CardDescription className="text-xs">
                  {option.description}
                </CardDescription>
              )}
            </CardHeader>
            {selectedStrategy === option.id && (
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-foreground" />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {currentStrategy && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Strategy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Min Confidence</p>
                <p className="font-semibold">{currentStrategy.config.minConfidence}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Position Size</p>
                <p className="font-semibold">{currentStrategy.config.maxPositionSize}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Stop Loss</p>
                <p className="font-semibold">{currentStrategy.config.stopLossPercent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Take Profit</p>
                <p className="font-semibold">{currentStrategy.config.takeProfitPercent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Daily Loss</p>
                <p className="font-semibold">{currentStrategy.config.maxDailyLossPercent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trend Strength</p>
                <p className="font-semibold">{currentStrategy.config.minTrendStrength}%+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Compact version for dashboard
 */
export function RiskStrategyBadge() {
  const { data: currentStrategy } = trpc.riskStrategy.getCurrent.useQuery();

  if (!currentStrategy) return null;

  const option = STRATEGY_OPTIONS.find((s) => s.id === currentStrategy.strategy);
  if (!option) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${option.color} border ${option.borderColor}`}>
      {option.icon}
      <span className="text-sm font-medium">{option.name}</span>
    </div>
  );
}
