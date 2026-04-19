/**
 * Alerts Center Page
 * Dedicated page for managing and monitoring price alerts
 */

import React from "react";
import { AlertNotificationPanel } from "@/components/AlertNotificationPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";

export function AlertsCenter() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Alerts Center</h1>
              <p className="text-slate-400">
                Monitor and manage your price alerts in real-time
              </p>
            </div>
            <Button
              onClick={() => navigate("/simulator")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <AlertNotificationPanel />
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Set Alerts</h3>
                <p className="text-sm text-slate-400">
                  Create price alerts for your favorite stocks
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Get Notified</h3>
                <p className="text-sm text-slate-400">
                  Receive instant notifications when prices hit targets
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Track History</h3>
                <p className="text-sm text-slate-400">
                  Review all triggered alerts and performance metrics
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
