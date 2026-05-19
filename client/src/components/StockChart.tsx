import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  ticker: string;
  data: ChartData[];
  indicators?: {
    sma20?: number[];
    sma50?: number[];
    rsi?: number[];
    macd?: number[];
  };
  signals?: Array<{
    date: string;
    type: 'buy' | 'sell';
    price: number;
  }>;
  height?: number;
}

export function StockChart({
  ticker,
  data,
  indicators,
  signals,
  height = 400,
}: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width || 800;
    canvas.height = height;

    drawChart(ctx, data, indicators, signals, canvas.width, canvas.height);
  }, [data, indicators, signals, height]);

  return (
    <Card className="w-full p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">{ticker} - Price Chart</h3>
        <canvas
          ref={canvasRef}
          className="w-full border border-border rounded"
          style={{ height: `${height}px` }}
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>📊 Candlestick chart with technical indicators</p>
          <p>🟢 Green = Up day | 🔴 Red = Down day</p>
          {indicators?.sma20 && <p>📈 Blue line = 20-day SMA | Orange line = 50-day SMA</p>}
          {signals && signals.length > 0 && (
            <p>
              🔔 Signals: {signals.filter((s) => s.type === 'buy').length} buys,{' '}
              {signals.filter((s) => s.type === 'sell').length} sells
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  data: ChartData[],
  indicators: any,
  signals: any,
  width: number,
  height: number
) {
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (!data.length) return;

  // Calculate dimensions
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find price range
  const prices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    // Price labels
    const price = maxPrice - (priceRange / 5) * i;
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(price.toFixed(2), padding - 10, y + 4);
  }

  // Vertical grid lines
  const gridLines = Math.min(10, data.length);
  for (let i = 0; i < gridLines; i++) {
    const x = padding + (chartWidth / (gridLines - 1)) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }

  // Draw candlesticks
  const candleWidth = Math.max(2, chartWidth / data.length - 1);
  data.forEach((candle, idx) => {
    const x = padding + (chartWidth / data.length) * idx + candleWidth / 2;
    const openY = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
    const closeY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
    const highY = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
    const lowY = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

    const isUp = candle.close >= candle.open;

    // Wick
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    // Body
    ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY) || 1;
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
  });

  // Draw 20-day SMA
  if (indicators?.sma20) {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    indicators.sma20.forEach((sma: number, idx: number) => {
      if (sma === null || sma === undefined) return;

      const x = padding + (chartWidth / data.length) * idx;
      const y = padding + chartHeight - ((sma - minPrice) / priceRange) * chartHeight;

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  // Draw 50-day SMA
  if (indicators?.sma50) {
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();

    indicators.sma50.forEach((sma: number, idx: number) => {
      if (sma === null || sma === undefined) return;

      const x = padding + (chartWidth / data.length) * idx;
      const y = padding + chartHeight - ((sma - minPrice) / priceRange) * chartHeight;

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  // Draw signals
  if (signals) {
    signals.forEach((signal: any) => {
      const idx = data.findIndex((d) => d.date === signal.date);
      if (idx === -1) return;

      const x = padding + (chartWidth / data.length) * idx;
      const y = padding + chartHeight - ((signal.price - minPrice) / priceRange) * chartHeight;

      // Draw marker
      ctx.fillStyle = signal.type === 'buy' ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y - 15, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(signal.type === 'buy' ? '↑' : '↓', x, y - 12);
    });
  }

  // Draw axes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw legend
  ctx.fillStyle = '#666';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  let legendY = padding + 15;

  if (indicators?.sma20) {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(width - padding - 120, legendY, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillText('20-day SMA', width - padding - 105, legendY + 10);
    legendY += 15;
  }

  if (indicators?.sma50) {
    ctx.fillStyle = '#f97316';
    ctx.fillRect(width - padding - 120, legendY, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillText('50-day SMA', width - padding - 105, legendY + 10);
  }
}
