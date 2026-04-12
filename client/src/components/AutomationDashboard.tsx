import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface AutomationDashboardProps {
  sessionId: string;
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ sessionId }) => {
  const statusQuery = trpc.automation.getStatus.useQuery({ sessionId });
  const tradesQuery = trpc.automation.getExecutedTrades.useQuery({ sessionId });
  const statsQuery = trpc.automation.getStatistics.useQuery({ sessionId });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      statusQuery.refetch();
      tradesQuery.refetch();
      statsQuery.refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [statusQuery, tradesQuery, statsQuery]);

  const status = statusQuery.data;
  const trades = tradesQuery.data;
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-2xl font-bold">
            {status?.running ? '🟢 Running' : '🔴 Stopped'}
          </p>
        </div>

        <div className="card-premium p-4">
          <p className="text-sm text-muted-foreground">Open Trades</p>
          <p className="text-2xl font-bold">{status?.openTrades || 0}</p>
        </div>

        <div className="card-premium p-4">
          <p className="text-sm text-muted-foreground">Total Trades</p>
          <p className="text-2xl font-bold">{status?.totalTrades || 0}</p>
        </div>

        <div className="card-premium p-4">
          <p className="text-sm text-muted-foreground">Win Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {stats?.winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-premium p-4">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              £{stats.totalPnL.toFixed(2)}
            </p>
          </div>

          <div className="card-premium p-4">
            <p className="text-sm text-muted-foreground">Profit Factor</p>
            <p className="text-2xl font-bold">{stats.profitFactor.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Win / Avg Loss ratio
            </p>
          </div>

          <div className="card-premium p-4">
            <p className="text-sm text-muted-foreground">Avg Trade</p>
            <p className="text-2xl font-bold">
              £{((stats.totalPnL / (stats.closedTrades || 1)).toFixed(2))}
            </p>
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {trades && trades.trades.length > 0 && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="table-premium w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Signal</th>
                  <th className="text-right py-2">Entry Price</th>
                  <th className="text-right py-2">Current Price</th>
                  <th className="text-right py-2">Status</th>
                  <th className="text-right py-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.trades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 font-medium">{trade.symbol}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.signal === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.signal}
                      </span>
                    </td>
                    <td className="py-2 text-right">£{trade.entryPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">-</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs font-semibold ${
                        trade.status === 'OPEN' ? 'text-blue-600' :
                        trade.status === 'PROFIT_TAKEN' ? 'text-green-600' :
                        trade.status === 'STOPPED_OUT' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className={`py-2 text-right font-semibold ${
                      (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl ? `£${trade.pnl.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!trades || trades.trades.length === 0) && (
        <div className="card-premium p-8 text-center">
          <p className="text-muted-foreground">No trades executed yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Enable automation and configure your settings to start trading
          </p>
        </div>
      )}
    </div>
  );
};
