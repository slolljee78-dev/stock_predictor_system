import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface PriceChartProps {
  ticker: string;
  timeframe?: "1h" | "4h" | "1d" | "1w";
  height?: number;
}

const TIMEFRAMES = [
  { label: "1h", value: "1h" as const },
  { label: "4h", value: "4h" as const },
  { label: "1d", value: "1d" as const },
  { label: "1w", value: "1w" as const },
];

export function PriceChart({
  ticker,
  timeframe = "1d",
  height = 400,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1h" | "4h" | "1d" | "1w">(timeframe);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch historical data
  const priceHistoryQuery = trpc.liveMarket.getPriceHistory.useQuery(
    { ticker, timeframe: selectedTimeframe },
    { enabled: !!ticker }
  );

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#d1d5db",
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create candlestick series
    const series = (chart as any).addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = { chart, series };

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current?.chart) {
        chartRef.current.chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height]);

  // Update chart data
  useEffect(() => {
    if (!chartRef.current) return;

    if (priceHistoryQuery.isLoading) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (priceHistoryQuery.data && Array.isArray(priceHistoryQuery.data)) {
      const candleData = priceHistoryQuery.data
        .filter((item: any) => item.time && item.open && item.high && item.low && item.close)
        .map((item: any) => {
          const date = new Date(item.timestamp || item.time);
          const timeStr = Math.floor(date.getTime() / 1000).toString();
          return {
            time: timeStr,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          };
        })
        .sort((a: any, b: any) => parseInt(a.time) - parseInt(b.time));

      if (candleData.length > 0) {
        chartRef.current.series.setData(candleData);
        chartRef.current.chart.timeScale().fitContent();
      }
    }
  }, [priceHistoryQuery.data, priceHistoryQuery.isLoading]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart - {ticker}</CardTitle>
          <div className="flex gap-2">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
                disabled={isLoading}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: `${height}px`,
            position: "relative",
          }}
          className="rounded-lg border border-border bg-background/50"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
