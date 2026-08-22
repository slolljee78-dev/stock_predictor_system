import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IndicatorData {
  time: string;
  rsi?: number;
  macd?: number;
  histogram?: number;
  signal?: number;
}

interface IndicatorChartProps {
  data: IndicatorData[];
  type: 'rsi' | 'macd';
  title?: string;
  height?: number;
}

export function IndicatorChart({
  data,
  type,
  title,
  height = 250,
}: IndicatorChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">No indicator data available</p>
      </div>
    );
  }

  const defaultTitle = type === 'rsi' ? 'RSI (14)' : 'MACD';

  return (
    <div className="w-full">
      {(title || defaultTitle) && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title || defaultTitle}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'rsi' ? (
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#888"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#888' }}
            />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} tick={{ fill: '#888' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="RSI"
            />
            {/* Overbought line at 70 */}
            <Line
              type="linear"
              dataKey={() => 70}
              stroke="#ef4444"
              dot={false}
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Overbought (70)"
              isAnimationActive={false}
            />
            {/* Oversold line at 30 */}
            <Line
              type="linear"
              dataKey={() => 30}
              stroke="#10b981"
              dot={false}
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Oversold (30)"
              isAnimationActive={false}
            />
          </ComposedChart>
        ) : (
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#888"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#888' }}
            />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} tick={{ fill: '#888' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toFixed(4);
                }
                return value;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="histogram" fill="#e5e7eb" name="Histogram" />
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="MACD"
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="Signal"
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
