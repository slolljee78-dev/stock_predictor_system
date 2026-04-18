import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Bell, Filter, Trash2, Search, Clock, TrendingUp, TrendingDown } from 'lucide-react';

type FilterType = 'all' | 'buy' | 'sell';
type StatusFilter = 'all' | 'pending' | 'sent' | 'dismissed';

export function AlertNotificationCenter() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchStock, setSearchStock] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');

  const alertsQuery = trpc.alerts.getAlertHistory.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const dismissAlertMutation = trpc.alerts.dismissAlert.useMutation({
    onSuccess: () => {
      alertsQuery.refetch();
    },
  });

  const alerts = alertsQuery.data ?? [];

  // Filter alerts based on selected filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Filter by signal type
      if (filterType !== 'all' && alert.signalType !== filterType) {
        return false;
      }

      // Filter by stock search
      if (searchStock && !alert.ticker?.toLowerCase().includes(searchStock.toLowerCase())) {
        return false;
      }

      // Filter by date range
      if (dateRange !== 'all') {
        const alertDate = new Date(alert.createdAt).getTime();
        const now = Date.now();
        const daysInMs = {
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000,
        };

        if (dateRange in daysInMs && now - alertDate > daysInMs[dateRange as '7d' | '30d' | '90d']) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, filterType, searchStock, dateRange]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      buy: alerts.filter((a) => a.signalType === 'buy').length,
      sell: alerts.filter((a) => a.signalType === 'sell').length,
      pending: alerts.filter((a) => a.status === 'pending').length,
    };
  }, [alerts]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Alert Notification Center</h1>
          </div>
          <p className="text-muted-foreground">
            Review your signal alerts history, track notification delivery, and manage alert preferences.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-3xl font-semibold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Buy Signals</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold text-emerald-400">{stats.buy}</p>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Sell Signals</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold text-rose-400">{stats.sell}</p>
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold text-amber-400">{stats.pending}</p>
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Signal Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Signal Type</label>
                <div className="flex gap-2">
                  {(['all', 'buy', 'sell'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="flex-1"
                    >
                      {type === 'all' ? 'All' : type === 'buy' ? 'Buy' : 'Sell'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2">
                  {(['all', 'sent', 'pending'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="flex-1"
                    >
                      {status === 'all' ? 'All' : status === 'sent' ? 'Sent' : 'Pending'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full rounded-lg border border-border/70 bg-background/55 px-3 py-2 text-sm"
                >
                  <option value="all">All time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>

              {/* Stock Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchStock}
                    onChange={(e) => setSearchStock(e.target.value)}
                    placeholder="Search ticker..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Alerts ({filteredAlerts.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {alertsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/30 p-8 text-center">
                <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">No alerts found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or check back later for new signal alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 p-4 transition hover:border-primary/35"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-lg font-semibold text-foreground">{alert.ticker}</p>
                        <Badge
                          className={`rounded-full px-3 py-1 ${
                            alert.signalType === 'buy'
                              ? 'border border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                              : 'border border-rose-400/30 bg-rose-400/15 text-rose-300'
                          }`}
                        >
                          {alert.signalType === 'buy' ? 'Buy Signal' : 'Sell Signal'}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-3 py-1 ${
                            alert.status === 'sent'
                              ? 'bg-emerald-400/15 text-emerald-300'
                              : alert.status === 'pending'
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-muted'
                          }`}
                        >
                          {alert.status === 'sent' ? 'Sent' : alert.status === 'pending' ? 'Pending' : 'Dismissed'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Confidence: {Math.round((alert.confidence ?? 0) * 100)}%</span>
                        <span>
                          {new Date(alert.createdAt).toLocaleDateString()} {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {alert.status !== 'dismissed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlertMutation.mutate({ alertId: alert.id })}
                        disabled={dismissAlertMutation.isPending}
                        className="ml-4 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
