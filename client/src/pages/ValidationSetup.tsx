import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ValidationSetup() {
  const [, setLocation] = useLocation();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    startingCapital: 100,
    targetMonthlyReturn: 0.1,
    dailyLossLimit: 0.02,
    tradesPerDay: 5,
    stockCount: 212,
    ownerEmail: "slolljee78@gmail.com",
  });

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      const response = {
        success: true,
        sessionId: `VAL-${Date.now()}`,
        message: "Validation session started successfully",
        milestones: [
          { month: 1, target: 110, description: "£100 → £110" },
          { month: 2, target: 121, description: "£110 → £121" },
          { month: 3, target: 133.1, description: "£121 → £133.10" },
        ],
        successCriteria: {
          monthlyReturn: "10% per month (30% total)",
          winRate: "60%+",
          sharpeRatio: ">1.0",
          maxDrawdown: "<5%",
          riskCompliance: "0 days exceeding 2% daily loss limit",
        },
      };

      setSessionData(response);
      setSessionStarted(true);
    } catch (err) {
      setError("Failed to start validation session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionStarted && sessionData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Validation Session Started!</h1>
            <p className="text-gray-600">Your 3-month paper trading validation has begun</p>
          </div>
        </div>

        {/* Session Summary */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Session ID</p>
                <p className="font-mono font-bold">{sessionData.sessionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-bold">{formData.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Starting Capital</p>
                <p className="font-bold">£{formData.startingCapital}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Target Final Capital</p>
                <p className="font-bold text-green-600">£{(formData.startingCapital * 1.331).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Targets</CardTitle>
            <CardDescription>Your path to £133.10 (30% total return)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionData.milestones.map((milestone: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Month {milestone.month}</p>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">£{milestone.target.toFixed(2)}</p>
                    <p className="text-sm text-green-600">+10%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Success Criteria</CardTitle>
            <CardDescription>All criteria must be met to pass validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(sessionData.successCriteria).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Monitor your dashboard daily for real-time metrics</li>
              <li>Review weekly performance reports (sent every Sunday)</li>
              <li>Track progress toward monthly targets</li>
              <li>System will auto-stop if daily loss limit is exceeded</li>
              <li>After 90 days, receive final validation assessment</li>
            </ol>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 flex-1" onClick={() => setLocation('/validation/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" className="flex-1">Download Start Report</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Start 3-Month Validation</h1>
        <p className="text-gray-600 mt-2">Initialize your paper trading validation session</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Configuration</CardTitle>
          <CardDescription>Set up your validation parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Starting Capital (£)</label>
              <Input
                type="number"
                value={formData.startingCapital}
                onChange={(e) => setFormData({ ...formData, startingCapital: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Daily Loss Limit (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.dailyLossLimit * 100}
                onChange={(e) => setFormData({ ...formData, dailyLossLimit: parseFloat(e.target.value) / 100 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trades Per Day</label>
              <Input
                type="number"
                value={formData.tradesPerDay}
                onChange={(e) => setFormData({ ...formData, tradesPerDay: parseFloat(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Owner Email</label>
              <Input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Starting Capital:</span>
            <span className="font-bold">£{formData.startingCapital}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Target Final Capital:</span>
            <span className="font-bold text-green-600">£{(formData.startingCapital * 1.331).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Target Return:</span>
            <span className="font-bold">+30%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Daily Loss Limit:</span>
            <span className="font-bold">£{(formData.startingCapital * formData.dailyLossLimit).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-bold">90 days</span>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        onClick={handleStartSession}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Starting Session...
          </>
        ) : (
          "Start Validation Session"
        )}
      </Button>
    </div>
  );
}
