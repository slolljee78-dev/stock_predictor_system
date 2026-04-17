import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PriceData {
  time: string;
  price: number;
  sma20?: number;
  sma50?: number;
}

interface PriceChartProps {
  data: PriceData[];
  title?: string;
  height?: number;
}

export function PriceChart({ data, title = 'Price History', height = 300 }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">No price data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                return `$${value.toFixed(2)}`;
              }
              return value;
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            name="Price"
          />
          {data[0]?.sma20 !== undefined && (
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={1}
              strokeDasharray="5 5"
              name="SMA 20"
            />
          )}
          {data[0]?.sma50 !== undefined && (
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#ef4444"
              dot={false}
              strokeWidth={1}
              strokeDasharray="5 5"
              name="SMA 50"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
