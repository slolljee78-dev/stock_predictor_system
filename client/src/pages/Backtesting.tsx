/**
 * Backtesting Page
 * Allows users to run backtests on historical data with customizable parameters
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Settings, Play, Download, Trash2, CheckCircle2, AlertCircle, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useLocation } from 'wouter';
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from '@/lib/navigation';

interface BacktestConfig {
  name: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  stockIds: number[];
  filterSettings: {
    minConfidence: number;
    maxVIX: number;
    maxCorrelation: number;
    maxDailyLoss: number;
  };
}

export function Backtesting() {
  const [, navigate] = useLocation();
  const [exportingId, setExportingId] = useState<number | null>(null);

  const [config, setConfig] = useState<BacktestConfig>({
    name: 'Backtest Run',
    startDate: new Date(new Date().getFullYear() - 1, 0, 1),
    endDate: new Date(),
    initialCapital: 10000,
    stockIds: [],
    filterSettings: {
      minConfidence: 60,
      maxVIX: 30,
      maxCorrelation: 0.8,
      maxDailyLoss: 2,
    },
  });

  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'results'>('config');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch available stocks
  const { data: stocks } = trpc.stocks.getAll.useQuery();

  // Start backtest mutation
  const startBacktestMutation = trpc.backtest.startBacktest.useMutation();

  // List backtests query
  const { data: backtests, refetch: refetchBacktests } = trpc.backtest.listBacktests.useQuery({
    limit: 10,
    offset: 0,
  });

  // Delete backtest mutation
  const deleteBacktestMutation = trpc.backtest.deleteBacktest.useMutation({
    onSuccess: () => {
      refetchBacktests();
    },
  });



  const handleStartBacktest = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!config.name.trim()) {
      newErrors.name = 'Backtest name is required';
    }

    if (selectedStocks.length === 0) {
      newErrors.stocks = 'Please select at least one stock';
    }
    
    if (config.startDate >= config.endDate) {
      newErrors.dates = 'Start date must be before end date';
    }
    
    if (config.initialCapital < 1000) {
      newErrors.capital = 'Initial capital must be at least $1,000';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    const stockIds = selectedStocks
      .map(ticker => stocks?.find((s: any) => s.ticker === ticker)?.id)
      .filter(Boolean) as number[];

    try {
      await startBacktestMutation.mutateAsync({
        name: config.name,
        startDate: config.startDate,
        endDate: config.endDate,
        initialCapital: config.initialCapital,
        stockIds,
        filterSettings: config.filterSettings,
      });

      refetchBacktests();
      setSuccessMessage('✓ Backtest started! Results will be available shortly.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setConfig({ ...config, name: 'Backtest Run' });
      setSelectedStocks([]);
    } catch (error) {
      setErrors({ submit: `Failed to start backtest: ${(error as Error).message}` });
    }
  };

  const handleDeleteBacktest = async (backtestId: number) => {
    if (confirm('Are you sure you want to delete this backtest?')) {
      try {
        await deleteBacktestMutation.mutateAsync({ backtestId });
      } catch (error) {
        alert(`Failed to delete backtest: ${(error as Error).message}`);
      }
    }
  };

  const handleExportBacktest = async (backtestId: number) => {
    try {
      setExportingId(backtestId);
      // Simulate export for now - in production, this would call the actual API
      const result = {
        csv: 'Ticker,Type,Entry Date,Entry Price,Exit Date,Exit Price,Quantity,Profit/Loss,Return %,Exit Reason,Confidence\n',
        filename: `backtest-${backtestId}-${new Date().toISOString().split('T')[0]}.csv`
      };
      
      // Create CSV download
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert(`Failed to export backtest: ${(error as Error).message}`);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <button
            onClick={() => navigateToDashboardMenu(navigate)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </button>

          <button
            onClick={() => navigate(DASHBOARD_HOME_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <House className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Backtesting Tool</h1>
          <p className="text-muted-foreground">
            Validate your trading strategies against historical data and optimize parameters
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'config'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Configure Backtest
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'results'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Results ({backtests?.length || 0})
          </button>
        </div>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Config Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="backtest-name">Backtest Name</Label>
                    <Input
                      id="backtest-name"
                      value={config.name}
                      onChange={e => {
                        setConfig({ ...config, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="e.g., Q1 2024 Strategy Test"
                      className="mt-1"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={config.startDate.toISOString().split('T')[0]}
                        onChange={e => {
                          setConfig({ ...config, startDate: new Date(e.target.value) });
                          if (errors.dates) setErrors({ ...errors, dates: '' });
                        }}
                        className="mt-1"
                        aria-invalid={!!errors.dates}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={config.endDate.toISOString().split('T')[0]}
                        onChange={e => {
                          setConfig({ ...config, endDate: new Date(e.target.value) });
                          if (errors.dates) setErrors({ ...errors, dates: '' });
                        }}
                        className="mt-1"
                        aria-invalid={!!errors.dates}
                      />
                    </div>
                  </div>
                  {errors.dates && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.dates}</span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="initial-capital">Initial Capital ($)</Label>
                    <Input
                      id="initial-capital"
                      type="number"
                      value={config.initialCapital}
                      onChange={e => {
                        setConfig({ ...config, initialCapital: parseInt(e.target.value) });
                        if (errors.capital) setErrors({ ...errors, capital: '' });
                      }}
                      min="1000"
                      step="1000"
                      className="mt-1"
                      aria-invalid={!!errors.capital}
                    />
                    {errors.capital && (
                      <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.capital}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Stocks</CardTitle>
                  <CardDescription>
                    Choose which stocks to include in the backtest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {stocks?.map((stock: any) => (
                      <label key={stock.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStocks.includes(stock.ticker)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedStocks([...selectedStocks, stock.ticker]);
                            } else {
                              setSelectedStocks(selectedStocks.filter(t => t !== stock.ticker));
                            }
                            if (errors.stocks) setErrors({ ...errors, stocks: '' });
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{stock.ticker}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedStocks.length} stock(s) selected
                  </p>
                  {errors.stocks && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.stocks}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-600">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              
              {/* Error Message */}
              {errors.submit && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Filter Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Settings</CardTitle>
                  <CardDescription>
                    Configure signal quality and risk parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Minimum Confidence: {config.filterSettings.minConfidence}%</Label>
                    </div>
                    <Slider
                      value={[config.filterSettings.minConfidence]}
                      onValueChange={value => 
                        setConfig({
                          ...config,
                          filterSettings: { ...config.filterSettings, minConfidence: value[0] }
                        })
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Max VIX: {config.filterSettings.maxVIX.toFixed(1)}</Label>
                    </div>
                    <Slider
                      value={[config.filterSettings.maxVIX]}
                      onValueChange={value => 
                        setConfig({
                          ...config,
                          filterSettings: { ...config.filterSettings, maxVIX: value[0] }
                        })
                      }
                      min={5}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Max Correlation: {config.filterSettings.maxCorrelation.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[config.filterSettings.maxCorrelation]}
                      onValueChange={value => 
                        setConfig({
                          ...config,
                          filterSettings: { ...config.filterSettings, maxCorrelation: value[0] }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Max Daily Loss: {config.filterSettings.maxDailyLoss.toFixed(1)}%</Label>
                    </div>
                    <Slider
                      value={[config.filterSettings.maxDailyLoss]}
                      onValueChange={value => 
                        setConfig({
                          ...config,
                          filterSettings: { ...config.filterSettings, maxDailyLoss: value[0] }
                        })
                      }
                      min={0.5}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Card */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium">
                      {config.startDate.toLocaleDateString()} - {config.endDate.toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Initial Capital</p>
                    <p className="font-medium">${config.initialCapital.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Stocks</p>
                    <p className="font-medium">{selectedStocks.length} selected</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground mb-2">Filters</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Min Confidence: {config.filterSettings.minConfidence}%</li>
                      <li>• Max VIX: {config.filterSettings.maxVIX}</li>
                      <li>• Max Correlation: {config.filterSettings.maxCorrelation}</li>
                      <li>• Max Daily Loss: {config.filterSettings.maxDailyLoss}%</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleStartBacktest}
                    disabled={startBacktestMutation.isPending || selectedStocks.length === 0}
                    className="w-full mt-4 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {startBacktestMutation.isPending ? 'Running...' : 'Start Backtest'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {backtests && backtests.length > 0 ? (
              backtests.map(backtest => (
                <Card key={backtest.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{backtest.name}</CardTitle>
                        <CardDescription>
                          {new Date(backtest.createdAt).toLocaleDateString()} • Status: {backtest.status}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {backtest.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportBacktest(backtest.id)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBacktest(backtest.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Return</p>
                        <p className={`text-lg font-semibold ${parseFloat(backtest.totalReturn ?? '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(backtest.totalReturn ?? '0') / 100).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-lg font-semibold">{backtest.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                        <p className="text-lg font-semibold">{(parseFloat(backtest.sharpeRatio ?? '0') / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max Drawdown</p>
                        <p className="text-lg font-semibold text-red-600">{backtest.maxDrawdown}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No backtests yet. Create one to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
