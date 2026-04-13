import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, TrendingUp, Clock, Zap } from 'lucide-react';

export default function SignalsDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch active signals
  const { data: signalsData, refetch: refetchSignals, isLoading: signalsLoading } = trpc.signals.getActiveSignals.useQuery({
    limit: 50,
    offset: 0,
  }, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch signal statistics
  const { data: statsData, refetch: refetchStats } = trpc.signals.getSignalStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch notifications
  const { data: notifications } = trpc.signals.getNotifications.useQuery({
    limit: 10,
  }, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Manual refresh
  const handleRefresh = async () => {
    await refetchSignals();
    await refetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400" />
              Trading Signals
            </h1>
            <p className="text-slate-400">Real-time AI-powered buy and sell signals</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}
            >
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>
          </div>
        </div>

        {/* Statistics Grid */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Total Signals</div>
              <div className="text-3xl font-bold text-white">{statsData.totalSignals}</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-green-400" />
                Buy Signals
              </div>
              <div className="text-3xl font-bold text-green-400">{statsData.buySignals}</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-red-400" />
                Sell Signals
              </div>
              <div className="text-3xl font-bold text-red-400">{statsData.sellSignals}</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Active</div>
              <div className="text-3xl font-bold text-cyan-400">{statsData.activeSignals}</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Avg Confidence</div>
              <div className="text-3xl font-bold text-yellow-400">{statsData.avgConfidence}%</div>
            </Card>
          </div>
        )}

        {/* Signals Table */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Active Signals
            </h2>
          </div>

          {signalsLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="text-slate-400 mt-4">Loading signals...</p>
            </div>
          ) : signalsData?.signals && signalsData.signals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Ticker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Signal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Confidence</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Analysis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {signalsData.signals.map((signal: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                            <span className="text-sm font-bold text-cyan-400">{signal.stock.ticker.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">{signal.stock.ticker}</div>
                            <div className="text-xs text-slate-400">{signal.stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={signal.type === 'buy'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                          }
                        >
                          {signal.type === 'buy' ? (
                            <ArrowUp className="w-3 h-3 mr-1 inline" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1 inline" />
                          )}
                          {signal.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        £{(signal.priceAtSignal / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-2 max-w-xs">
                            <div
                              className={`h-full rounded-full transition-all ${
                                signal.confidenceScore >= 80
                                  ? 'bg-green-500'
                                  : signal.confidenceScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${signal.confidenceScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-white min-w-fit">
                            {signal.confidenceScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                        {signal.analysis || 'No analysis available'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(signal.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400">No active signals at the moment</p>
            </div>
          )}
        </Card>

        {/* Recent Notifications */}
        {notifications && notifications.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mt-8 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Notifications</h2>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{notif.title}</p>
                      <p className="text-sm text-slate-300 mt-1">{notif.message}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
