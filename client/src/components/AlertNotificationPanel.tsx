/**
 * Alert Notification Panel
 * Displays active alerts, triggered alerts, and alert history with management controls
 */

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bell, CheckCircle, Trash2, RotateCcw, Clock } from "lucide-react";

interface AlertWithStock {
  id: number;
  ticker: string;
  targetPrice: string | number;
  currentPrice?: number;
  alertType: "above" | "below";
  status: "active" | "triggered" | "dismissed" | "deleted";
  enableBrowserNotification: number | boolean;
  enableEmailNotification: number | boolean;
  createdAt: string | Date;
  lastTriggeredAt?: string | Date | null;
  priceAlertId?: number;
  triggerPrice?: string;
  notificationChannels?: string;
  notificationSent?: number;
}

export function AlertNotificationPanel() {
  const [activeTab, setActiveTab] = useState("active");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch active alerts
  const { data: activeAlerts, refetch: refetchActive, isLoading: loadingActive } = trpc.priceAlerts.getMyAlerts.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch alert history
  const { data: alertHistory, refetch: refetchHistory, isLoading: loadingHistory } = trpc.priceAlerts.getAlertHistory.useQuery(
    { limit: 50 },
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
    }
  );

  // Fetch alert statistics
  const { data: alertStats, refetch: refetchStats } = trpc.priceAlerts.getAlertStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch monitoring service status
  const { data: monitoringInfo } = trpc.alertMonitoring.getMonitoringInfo.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Delete alert mutation
  const deleteAlertMutation = trpc.priceAlerts.deleteAlert.useMutation({
    onSuccess: () => {
      refetchActive();
      refetchStats();
    },
  });

  // Update alert mutation
  const updateAlertMutation = trpc.priceAlerts.updateAlert.useMutation({
    onSuccess: () => {
      refetchActive();
      refetchHistory();
      refetchStats();
    },
  });

  const handleDeleteAlert = (alertId: number) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteAlertMutation.mutate({ alertId });
    }
  };

  const handleDismissAlert = (alertId: number) => {
    updateAlertMutation.mutate({
      alertId,
              // Update alert status after dismissal
    });
  };

  const handleReEnableAlert = (alertId: number) => {
    updateAlertMutation.mutate({
      alertId,
      status: "active",
    });
  };

  // Filter alerts by status
  const triggeredAlerts = activeAlerts?.filter((a) => a.status === "triggered") || [];
              // Filter by status

  return (
    <div className="w-full space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-bold">Alert Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchActive();
              refetchHistory();
              refetchStats();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Monitoring Service Status */}
      {monitoringInfo && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  monitoringInfo.health.isHealthy ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-semibold">Monitoring Service</span>
            </div>
            <div className="text-sm text-gray-600">
              {monitoringInfo.health.message}
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Summary */}
      {alertStats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active Alerts</div>
            <div className="text-2xl font-bold text-blue-600">
              {activeAlerts?.filter((a) => a.status === "active").length || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Triggered</div>
            <div className="text-2xl font-bold text-orange-600">
              {triggeredAlerts.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Created</div>
            <div className="text-2xl font-bold text-gray-600">
              {activeAlerts?.length || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">History Count</div>
            <div className="text-2xl font-bold text-green-600">
              {alertHistory?.length || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeAlerts?.filter((a) => a.status === "active").length || 0})
          </TabsTrigger>
          <TabsTrigger value="triggered">
            Triggered ({triggeredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({alertHistory?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-3">
          {loadingActive ? (
            <div className="text-center py-8 text-gray-500">Loading active alerts...</div>
          ) : activeAlerts?.filter((a) => a.status === "active").length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-sm text-gray-500">Create a new alert to get started</p>
            </Card>
          ) : (
            activeAlerts
              ?.filter((a) => a.status === "active")
              .map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDismiss={() => handleDismissAlert(alert.id)}
                  onDelete={() => handleDeleteAlert(alert.id)}
                  isLoading={deleteAlertMutation.isPending || updateAlertMutation.isPending}
                />
              ))
          )}
        </TabsContent>

        {/* Triggered Alerts Tab */}
        <TabsContent value="triggered" className="space-y-3">
          {triggeredAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">No triggered alerts</p>
              <p className="text-sm text-gray-500">Alerts will appear here when targets are reached</p>
            </Card>
          ) : (
            triggeredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                status="triggered"
                onReEnable={() => handleReEnableAlert(alert.id)}
                onDelete={() => handleDeleteAlert(alert.id)}
                isLoading={deleteAlertMutation.isPending || updateAlertMutation.isPending}
              />
            ))
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">Loading alert history...</div>
          ) : alertHistory?.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">No alert history</p>
              <p className="text-sm text-gray-500">Historical alerts will appear here</p>
            </Card>
          ) : (
            alertHistory?.map((alert: any) => {
              const alertWithStock: AlertWithStock = {
                id: alert.id,
                ticker: alert.ticker,
                targetPrice: alert.targetPrice,
                alertType: alert.alertType,
                status: alert.status || "dismissed",
                enableBrowserNotification: 0,
                enableEmailNotification: 0,
                createdAt: alert.createdAt,
                priceAlertId: alert.priceAlertId,
                triggerPrice: alert.triggerPrice,
                notificationChannels: alert.notificationChannels,
                notificationSent: alert.notificationSent,
              };
              return (
                <AlertCard
                  key={alert.id}
                  alert={alertWithStock}
                  onDelete={() => handleDeleteAlert(alert.priceAlertId)}
                  isLoading={deleteAlertMutation.isPending}
                />
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Individual Alert Card Component
 */
interface AlertCardProps {
  alert: AlertWithStock;
  status?: "active" | "triggered" | "dismissed";
  onDismiss?: () => void;
  onReEnable?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

function AlertCard({
  alert,
  status,
  onDismiss,
  onReEnable,
  onDelete,
  isLoading,
}: AlertCardProps) {
  const statusColor =
    alert.status === "active"
      ? "bg-blue-50 border-blue-200"
      : alert.status === "triggered"
        ? "bg-orange-50 border-orange-200"
        : "bg-gray-50 border-gray-200";

  const statusBadgeColor =
    alert.status === "active"
      ? "bg-blue-100 text-blue-800"
      : alert.status === "triggered"
        ? "bg-orange-100 text-orange-800"
        : "bg-gray-100 text-gray-800";

  const statusIcon =
    alert.status === "active" ? (
      <AlertCircle className="h-4 w-4 text-blue-600" />
    ) : alert.status === "triggered" ? (
      <CheckCircle className="h-4 w-4 text-orange-600" />
    ) : null;

  return (
    <Card className={`p-4 border ${statusColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {statusIcon}
            <span className="font-bold text-lg">{alert.ticker}</span>
            <Badge className={statusBadgeColor}>{alert.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Alert Type: </span>
              <span className="font-semibold">
                {alert.alertType === "above" ? "Price ≥" : "Price ≤"} ${parseFloat(String(alert.targetPrice))}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Created: </span>
              <span className="font-semibold">
                {new Date(alert.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {alert.lastTriggeredAt && (
            <div className="text-sm text-gray-600 mt-2">
              Last triggered: {new Date(alert.lastTriggeredAt).toLocaleString()}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {alert.enableBrowserNotification && (
              <Badge variant="outline" className="text-xs">
                Browser Notifications
              </Badge>
            )}
            {alert.enableEmailNotification && (
              <Badge variant="outline" className="text-xs">
                Email Notifications
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          {alert.status === "active" && onDismiss && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              disabled={isLoading}
            >
              Dismiss
            </Button>
          )}
          {alert.status === "triggered" && onReEnable && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReEnable}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Re-enable
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
