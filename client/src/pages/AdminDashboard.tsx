/**
 * Admin Dashboard
 * System monitoring, user management, and analytics
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, AlertCircle, Activity,
  Clock, UserCheck, UserX, Zap, Eye, Download
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Check if user is admin
  const isAdminQuery = trpc.admin.isAdmin.useQuery();

  // System statistics
  const systemStatsQuery = trpc.admin.getSystemStats.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // Subscription stats
  const subscriptionStatsQuery = trpc.admin.getSubscriptionStats.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // User list
  const userListQuery = trpc.admin.getUserList.useQuery(
    { page: currentPage, pageSize: 20 },
    { enabled: isAdminQuery.data === true }
  );

  // Payment analytics
  const paymentAnalyticsQuery = trpc.admin.getPaymentAnalytics.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // Signal metrics
  const signalMetricsQuery = trpc.admin.getSignalMetrics.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // User activity
  const userActivityQuery = trpc.admin.getUserActivityMetrics.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // Churn analysis
  const churnAnalysisQuery = trpc.admin.getChurnAnalysis.useQuery(undefined, {
    enabled: isAdminQuery.data === true,
  });

  // Audit log
  const auditLogQuery = trpc.admin.getAuditLog.useQuery({ limit: 50 }, {
    enabled: isAdminQuery.data === true,
  });

  // User details
  const userDetailsQuery = trpc.admin.getUserDetails.useQuery(
    { userId: selectedUserId as number },
    { enabled: selectedUserId !== null && isAdminQuery.data === true }
  );

  if (!isAdminQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You don't have permission to access the admin dashboard. Only administrators can view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = systemStatsQuery.data;
  const subscriptionStats = subscriptionStatsQuery.data || [];
  const userList = userListQuery.data;
  const paymentAnalytics = paymentAnalyticsQuery.data;
  const signalMetrics = signalMetricsQuery.data;
  const userActivity = userActivityQuery.data;
  const churnData = churnAnalysisQuery.data;
  const auditLog = auditLogQuery.data || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">System monitoring and management</p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeSubscriptions} active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{(stats.monthlyRecurringRevenue / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: £{(stats.totalRevenue / 100).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userActivity?.activeToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userActivity?.activeMonth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Signals Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{signalMetrics?.totalSignals || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg confidence: {Math.round(signalMetrics?.avgConfidence || 0)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscriptionStats.map((tier: any) => (
                      <div key={tier.tier} className="flex justify-between items-center">
                        <span className="text-sm">{tier.tier}</span>
                        <Badge variant="outline">{tier.count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Churn Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Churn Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cancelled (30 days)</span>
                      <Badge variant="destructive">{churnData?.cancelledLastMonth || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Expired Trials</span>
                      <Badge variant="secondary">{churnData?.expiredTrials || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Activity Chart */}
            {userActivity && (
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Today', users: userActivity.activeToday },
                      { name: 'This Week', users: userActivity.activeWeek },
                      { name: 'This Month', users: userActivity.activeMonth },
                      { name: 'New Users', users: userActivity.newUsers },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Name</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Tier</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Joined</th>
                          <th className="text-left py-2 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList?.users.map((u: any) => (
                          <tr key={u.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{u.name || 'N/A'}</td>
                            <td className="py-2 px-2 text-xs">{u.email}</td>
                            <td className="py-2 px-2">
                              <Badge variant="outline">{u.subscriptionTier}</Badge>
                            </td>
                            <td className="py-2 px-2">
                              <Badge variant={u.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                                {u.subscriptionStatus}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-xs">
                              {new Date(u.createdAt as any).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserId(u.id as number)}
                            >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {userList?.page} of {userList?.totalPages}
                    </p>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= (userList?.totalPages || 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Details */}
            {selectedUserId && userDetailsQuery.data && (
              <Card>
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserId(null)}
                    className="ml-auto"
                  >
                    Close
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{userDetailsQuery.data.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{userDetailsQuery.data.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subscription Tier</p>
                      <Badge>{userDetailsQuery.data.user.subscriptionTier}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant="outline">{userDetailsQuery.data.user.subscriptionStatus}</Badge>
                    </div>
                  </div>

                  {/* Payment History */}
                  {userDetailsQuery.data.payments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Payment History</h4>
                      <div className="space-y-2">
                        {userDetailsQuery.data.payments.map((p: any) => (
                          <div key={p.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                            <span>{new Date(p.createdAt as any).toLocaleDateString()}</span>
                            <span>£{(((p.amount as number) || 0) / 100).toFixed(2)}</span>
                            <Badge variant="outline">{p.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentAnalytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                      <p className="text-2xl font-bold">{(paymentAnalytics.totalPayments as any)?.count || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        £{((((paymentAnalytics.totalPayments as any)?.total as any) || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last 30 Days</p>
                      <p className="text-2xl font-bold">{(paymentAnalytics.last30Days as any)?.count || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        £{((((paymentAnalytics.last30Days as any)?.total as any) || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last 60 Days</p>
                      <p className="text-2xl font-bold">{(paymentAnalytics.last60Days as any)?.count || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        £{((((paymentAnalytics.last60Days as any)?.total as any) || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-500">{paymentAnalytics.failedPayments}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Signal Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {signalMetrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Signals</p>
                        <p className="text-3xl font-bold">{signalMetrics.totalSignals}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Confidence</p>
                        <p className="text-3xl font-bold">{Math.round(signalMetrics.avgConfidence)}%</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Signals by Status</h4>
                      <div className="space-y-2">
                        {(signalMetrics.byStatus as any[]).map((s: any) => (
                          <div key={s.status} className="flex justify-between text-sm">
                            <span className="capitalize">{s.status}</span>
                            <Badge variant="outline">{s.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Recent admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLog.map((entry: any) => (
                    <div key={entry.id} className="flex justify-between items-start p-2 bg-muted rounded text-sm">
                      <div>
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">Admin {entry.adminId}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
