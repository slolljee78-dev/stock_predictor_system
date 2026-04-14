import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertCircle, Bell, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PriceDisplay } from "./PriceDisplay";

interface StockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;
  ticker: string;
  name: string;
}

export function StockDetailsModal({
  isOpen,
  onClose,
  stockId,
  ticker,
  name,
}: StockDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch stock details
  const stockDetailsQuery = trpc.stocks.getByTicker.useQuery(ticker, {
    enabled: isOpen && !!ticker,
  });

  // Fetch signals for this stock
  const signalsQuery = trpc.legacySignals.getForStock.useQuery(stockId, {
    enabled: isOpen && !!stockId,
  });

  const stockDetails = stockDetailsQuery.data;
  const signals = signalsQuery.data || [];

  const isLoading = stockDetailsQuery.isLoading || signalsQuery.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{ticker}</DialogTitle>
              <DialogDescription>{name}</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading stock details...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {stockDetails && (
                <div className="space-y-4">
                  {/* Live Price Display */}
                  <PriceDisplay ticker={ticker} autoRefresh={true} refreshInterval={10000} />

                  {/* Stock Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Sector</p>
                          <p className="font-medium">{stockDetails.sector || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Industry</p>
                          <p className="font-medium">{stockDetails.industry || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Market Cap</p>
                          <p className="font-medium">
                            {stockDetails.marketCap
                              ? `£${(stockDetails.marketCap / 1e9).toFixed(2)}B`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{stockDetails.type || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="space-y-4">
              {signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.slice(0, 10).map((signal: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {signal.signalType === "buy" ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-semibold capitalize">{signal.signalType} Signal</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {signal.confidence}%
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={signal.signalType === "buy" ? "default" : "destructive"}
                          >
                            {signal.confidence}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No signals available for this stock</p>
                </div>
              )}
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price Alerts</CardTitle>
                  <CardDescription>Set alerts for price movements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-green-500" />
                        <span>Alert on Buy Signal</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-red-500" />
                        <span>Alert on Sell Signal</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Enable
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Information</CardTitle>
                  <CardDescription>Trading details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-sm text-muted-foreground">Exchange</p>
                      <p className="text-lg font-semibold">
                        {stockDetails?.exchange || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="text-lg font-semibold">
                        {stockDetails?.currency || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-sm text-muted-foreground">ISIN</p>
                      <p className="text-lg font-semibold">
                        {stockDetails?.isin || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-sm text-muted-foreground">CUSIP</p>
                      <p className="text-lg font-semibold">
                        {stockDetails?.cusip || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
