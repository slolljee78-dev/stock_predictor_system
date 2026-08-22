/**
 * Alert History Component
 * Displays a list of recent alerts for a stock or user
 */

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface AlertHistoryProps {
  stockId?: number;
  limit?: number;
  showActions?: boolean;
}

export function AlertHistory({ stockId, limit = 10, showActions = true }: AlertHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'dismissed'>('all');

  // Fetch alert history
  const { data: alerts, isLoading } = trpc.alerts.getAlertHistory.useQuery({
    limit,
    offset: 0,
    status: filter === 'all' ? undefined : filter,
  });

  // Dismiss alert mutation
  const dismissMutation = trpc.alerts.dismissAlert.useMutation({
    onSuccess: () => {
      // Refetch alerts
    },
  });

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getSignalColor = (signalType: string) => {
    return signalType === 'buy'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>Recent trading signal alerts</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'sent', 'dismissed'] as const).map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                {/* Status Icon */}
                <div className="pt-1">{getStatusIcon(alert.status)}</div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{alert.ticker}</span>
                    <Badge className={getSignalColor(alert.signalType)}>
                      {alert.signalType.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Price: ${(alert.price / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(alert.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                {showActions && alert.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissMutation.mutate({ alertId: alert.id })}
                    disabled={dismissMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No alerts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
