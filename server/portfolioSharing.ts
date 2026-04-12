/**
 * Portfolio Export, Import & Sharing
 * Allows users to export portfolios, share them, and import from others
 */

import { v4 as uuidv4 } from 'uuid';

export interface PortfolioExport {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  stocks: Array<{
    ticker: string;
    quantity: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
  }>;
  settings: {
    maxDrawdown: number;
    riskPerTrade: number;
    rebalanceFrequency: string;
  };
  performance?: {
    totalReturn: number;
    sharpeRatio: number;
    winRate: number;
    maxDrawdown: number;
  };
}

export interface ShareLink {
  id: string;
  portfolioId: string;
  shareToken: string;
  createdBy: number;
  createdAt: Date;
  expiresAt?: Date;
  viewCount: number;
  isPublic: boolean;
  allowCopy: boolean;
}

export interface ImportedPortfolio {
  id: string;
  originalId: string;
  sourceUserId: number;
  importedBy: number;
  importedAt: Date;
  name: string;
  status: 'draft' | 'active' | 'archived';
}

/**
 * Export portfolio to JSON format
 */
export function exportPortfolioToJSON(portfolio: PortfolioExport): string {
  return JSON.stringify(portfolio, null, 2);
}

/**
 * Export portfolio to CSV format
 */
export function exportPortfolioToCSV(portfolio: PortfolioExport): string {
  let csv = `Portfolio: ${portfolio.name}\n`;
  csv += `Description: ${portfolio.description}\n`;
  csv += `Exported: ${new Date().toISOString()}\n\n`;

  csv += 'Ticker,Quantity,Entry Price,Stop Loss,Take Profit\n';

  portfolio.stocks.forEach((stock) => {
    csv += `${stock.ticker},${stock.quantity},${stock.entryPrice},${stock.stopLoss || 'N/A'},${stock.takeProfit || 'N/A'}\n`;
  });

  csv += '\n\nSettings\n';
  csv += `Max Drawdown,${portfolio.settings.maxDrawdown}%\n`;
  csv += `Risk Per Trade,${portfolio.settings.riskPerTrade}%\n`;
  csv += `Rebalance Frequency,${portfolio.settings.rebalanceFrequency}\n`;

  if (portfolio.performance) {
    csv += '\n\nPerformance\n';
    csv += `Total Return,${portfolio.performance.totalReturn.toFixed(2)}%\n`;
    csv += `Sharpe Ratio,${portfolio.performance.sharpeRatio.toFixed(2)}\n`;
    csv += `Win Rate,${portfolio.performance.winRate.toFixed(2)}%\n`;
    csv += `Max Drawdown,${portfolio.performance.maxDrawdown.toFixed(2)}%\n`;
  }

  return csv;
}

/**
 * Import portfolio from JSON
 */
export function importPortfolioFromJSON(jsonString: string): PortfolioExport | null {
  try {
    const data = JSON.parse(jsonString);

    // Validate required fields
    if (!data.name || !Array.isArray(data.stocks) || !data.settings) {
      console.error('Invalid portfolio JSON: missing required fields');
      return null;
    }

    return {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      version: data.version || '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      stocks: data.stocks,
      settings: data.settings,
      performance: data.performance,
    };
  } catch (error) {
    console.error('Failed to import portfolio from JSON:', error);
    return null;
  }
}

/**
 * Import portfolio from CSV
 */
export function importPortfolioFromCSV(csvString: string): PortfolioExport | null {
  try {
    const lines = csvString.split('\n');
    let name = 'Imported Portfolio';
    let description = '';
    const stocks: PortfolioExport['stocks'] = [];
    const settings = {
      maxDrawdown: 20,
      riskPerTrade: 2,
      rebalanceFrequency: 'monthly',
    };

    let inStocksSection = false;
    let inSettingsSection = false;

    for (const line of lines) {
      if (line.startsWith('Portfolio:')) {
        name = line.replace('Portfolio:', '').trim();
      } else if (line.startsWith('Description:')) {
        description = line.replace('Description:', '').trim();
      } else if (line.startsWith('Ticker,Quantity')) {
        inStocksSection = true;
        inSettingsSection = false;
        continue;
      } else if (line.startsWith('Settings')) {
        inStocksSection = false;
        inSettingsSection = true;
        continue;
      } else if (inStocksSection && line.trim() && !line.startsWith('Ticker')) {
        const [ticker, quantity, entryPrice, stopLoss, takeProfit] = line.split(',');
        if (ticker) {
          stocks.push({
            ticker: ticker.trim(),
            quantity: parseInt(quantity) || 0,
            entryPrice: parseFloat(entryPrice) || 0,
            stopLoss: stopLoss && stopLoss.trim() !== 'N/A' ? parseFloat(stopLoss) : undefined,
            takeProfit: takeProfit && takeProfit.trim() !== 'N/A' ? parseFloat(takeProfit) : undefined,
          });
        }
      } else if (inSettingsSection && line.trim()) {
        const [key, value] = line.split(',');
        if (key.includes('Max Drawdown')) {
          settings.maxDrawdown = parseFloat(value) || 20;
        } else if (key.includes('Risk Per Trade')) {
          settings.riskPerTrade = parseFloat(value) || 2;
        } else if (key.includes('Rebalance')) {
          settings.rebalanceFrequency = value.trim() || 'monthly';
        }
      }
    }

    if (stocks.length === 0) {
      console.error('No stocks found in CSV');
      return null;
    }

    return {
      id: uuidv4(),
      name,
      description,
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      stocks,
      settings,
    };
  } catch (error) {
    console.error('Failed to import portfolio from CSV:', error);
    return null;
  }
}

/**
 * Create a shareable link for a portfolio
 */
export function createShareLink(portfolioId: string, userId: number, expiryDays?: number): ShareLink {
  const shareLink: ShareLink = {
    id: uuidv4(),
    portfolioId,
    shareToken: uuidv4(),
    createdBy: userId,
    createdAt: new Date(),
    expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
    viewCount: 0,
    isPublic: true,
    allowCopy: true,
  };

  return shareLink;
}

/**
 * Generate share URL
 */
export function generateShareURL(baseURL: string, shareToken: string): string {
  return `${baseURL}/portfolio/shared/${shareToken}`;
}

/**
 * Validate share link (check expiration, etc.)
 */
export function isShareLinkValid(shareLink: ShareLink): boolean {
  if (!shareLink.isPublic) {
    return false;
  }

  if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
    return false;
  }

  return true;
}

/**
 * Clone a portfolio
 */
export function clonePortfolio(source: PortfolioExport, newName: string, userId: number): ImportedPortfolio {
  return {
    id: uuidv4(),
    originalId: source.id,
    sourceUserId: userId,
    importedBy: userId,
    importedAt: new Date(),
    name: newName,
    status: 'draft',
  };
}

/**
 * Merge multiple portfolios
 */
export function mergePortfolios(portfolios: PortfolioExport[], name: string): PortfolioExport {
  const mergedStocks: Map<string, PortfolioExport['stocks'][0]> = new Map();

  // Combine all stocks, summing quantities for duplicates
  for (const portfolio of portfolios) {
    for (const stock of portfolio.stocks) {
      if (mergedStocks.has(stock.ticker)) {
        const existing = mergedStocks.get(stock.ticker)!;
        existing.quantity += stock.quantity;
        // Average the entry price
        existing.entryPrice = (existing.entryPrice + stock.entryPrice) / 2;
      } else {
        mergedStocks.set(stock.ticker, { ...stock });
      }
    }
  }

  return {
    id: uuidv4(),
    name,
    description: `Merged portfolio from ${portfolios.length} portfolios`,
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    stocks: Array.from(mergedStocks.values()),
    settings: portfolios[0].settings,
  };
}

/**
 * Compare two portfolios
 */
export function comparePortfolios(
  portfolio1: PortfolioExport,
  portfolio2: PortfolioExport
): {
  commonStocks: string[];
  uniqueToFirst: string[];
  uniqueToSecond: string[];
  totalDifference: number;
} {
  const stocks1 = new Set(portfolio1.stocks.map((s) => s.ticker));
  const stocks2 = new Set(portfolio2.stocks.map((s) => s.ticker));

  const commonStocks = Array.from(stocks1).filter((s) => stocks2.has(s));
  const uniqueToFirst = Array.from(stocks1).filter((s) => !stocks2.has(s));
  const uniqueToSecond = Array.from(stocks2).filter((s) => !stocks1.has(s));

  const totalDifference = uniqueToFirst.length + uniqueToSecond.length;

  return {
    commonStocks,
    uniqueToFirst,
    uniqueToSecond,
    totalDifference,
  };
}

/**
 * Generate portfolio comparison report
 */
export function generateComparisonReport(
  portfolio1: PortfolioExport,
  portfolio2: PortfolioExport
): string {
  const comparison = comparePortfolios(portfolio1, portfolio2);

  const report = `
# Portfolio Comparison Report

## Overview
- **Portfolio 1:** ${portfolio1.name} (${portfolio1.stocks.length} stocks)
- **Portfolio 2:** ${portfolio2.name} (${portfolio2.stocks.length} stocks)

## Common Holdings
${comparison.commonStocks.length > 0 ? comparison.commonStocks.join(', ') : 'No common holdings'}

## Unique to ${portfolio1.name}
${comparison.uniqueToFirst.length > 0 ? comparison.uniqueToFirst.join(', ') : 'None'}

## Unique to ${portfolio2.name}
${comparison.uniqueToSecond.length > 0 ? comparison.uniqueToSecond.join(', ') : 'None'}

## Similarity
- **Common Stocks:** ${comparison.commonStocks.length}
- **Total Differences:** ${comparison.totalDifference}
- **Similarity Score:** ${(((comparison.commonStocks.length / Math.max(portfolio1.stocks.length, portfolio2.stocks.length)) * 100).toFixed(1))}%
`;

  return report;
}
