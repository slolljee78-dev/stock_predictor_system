declare module 'yfinance' {
  interface Quote {
    date: string;
    open: string | number;
    high: string | number;
    low: string | number;
    close: string | number;
    volume: string | number;
    adjclose?: string | number;
  }

  interface TickerData {
    symbol: string;
    quotes: Quote[];
  }

  interface YfinanceOptions {
    symbols: string[];
    period?: 'max' | '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd';
    interval?: '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1wk' | '1mo';
  }

  function yfinance(options: YfinanceOptions): Promise<TickerData[]>;

  export default yfinance;
}
