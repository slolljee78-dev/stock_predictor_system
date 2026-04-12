/**
 * Comprehensive Error Handling & Logging System
 * Centralized error management, logging, and monitoring
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'auth' | 'validation' | 'database' | 'api' | 'trading' | 'payment' | 'broker' | 'unknown';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  code: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: number;
  endpoint?: string;
  statusCode?: number;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  unresolvedErrors: number;
  errorRate: number; // errors per hour
  criticalErrorCount: number;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public category: ErrorCategory = 'unknown',
    public severity: ErrorSeverity = 'medium',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error definitions
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_001', message: 'Invalid credentials', statusCode: 401, category: 'auth' as const },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_002', message: 'Token expired', statusCode: 401, category: 'auth' as const },
  AUTH_UNAUTHORIZED: { code: 'AUTH_003', message: 'Unauthorized access', statusCode: 403, category: 'auth' as const },

  // Validation errors
  VALIDATION_INVALID_INPUT: { code: 'VAL_001', message: 'Invalid input', statusCode: 400, category: 'validation' as const },
  VALIDATION_MISSING_FIELD: { code: 'VAL_002', message: 'Missing required field', statusCode: 400, category: 'validation' as const },
  VALIDATION_INVALID_FORMAT: { code: 'VAL_003', message: 'Invalid format', statusCode: 400, category: 'validation' as const },

  // Database errors
  DB_CONNECTION_FAILED: { code: 'DB_001', message: 'Database connection failed', statusCode: 503, category: 'database' as const },
  DB_QUERY_FAILED: { code: 'DB_002', message: 'Database query failed', statusCode: 500, category: 'database' as const },
  DB_NOT_FOUND: { code: 'DB_003', message: 'Record not found', statusCode: 404, category: 'database' as const },

  // API errors
  API_RATE_LIMIT: { code: 'API_001', message: 'Rate limit exceeded', statusCode: 429, category: 'api' as const },
  API_EXTERNAL_SERVICE_ERROR: { code: 'API_002', message: 'External service error', statusCode: 502, category: 'api' as const },
  API_TIMEOUT: { code: 'API_003', message: 'Request timeout', statusCode: 504, category: 'api' as const },

  // Trading errors
  TRADING_INSUFFICIENT_FUNDS: { code: 'TRD_001', message: 'Insufficient funds', statusCode: 400, category: 'trading' as const },
  TRADING_INVALID_ORDER: { code: 'TRD_002', message: 'Invalid order', statusCode: 400, category: 'trading' as const },
  TRADING_ORDER_FAILED: { code: 'TRD_003', message: 'Order execution failed', statusCode: 500, category: 'trading' as const },

  // Payment errors
  PAYMENT_INVALID_CARD: { code: 'PAY_001', message: 'Invalid card', statusCode: 400, category: 'payment' as const },
  PAYMENT_DECLINED: { code: 'PAY_002', message: 'Payment declined', statusCode: 402, category: 'payment' as const },
  PAYMENT_PROCESSING_ERROR: { code: 'PAY_003', message: 'Payment processing error', statusCode: 500, category: 'payment' as const },

  // Broker errors
  BROKER_CONNECTION_FAILED: { code: 'BRK_001', message: 'Broker connection failed', statusCode: 503, category: 'broker' as const },
  BROKER_INVALID_CREDENTIALS: { code: 'BRK_002', message: 'Invalid broker credentials', statusCode: 401, category: 'broker' as const },
  BROKER_ORDER_REJECTED: { code: 'BRK_003', message: 'Broker rejected order', statusCode: 400, category: 'broker' as const },

  // Generic errors
  INTERNAL_SERVER_ERROR: { code: 'ERR_001', message: 'Internal server error', statusCode: 500, category: 'unknown' as const },
};

/**
 * Error logger
 */
export class ErrorLogger {
  private logs: ErrorLog[] = [];

  /**
   * Log an error
   */
  logError(error: Error | AppError, context?: Record<string, any>): ErrorLog {
    const errorLog: ErrorLog = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: error instanceof AppError ? error.severity : 'medium',
      category: error instanceof AppError ? error.category : 'unknown',
      message: error.message,
      code: error instanceof AppError ? error.code : 'UNKNOWN',
      stack: error.stack,
      context,
      resolved: false,
    };

    this.logs.push(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorLog.severity.toUpperCase()}] ${errorLog.code}: ${errorLog.message}`, context);
    }

    // Alert on critical errors
    if (errorLog.severity === 'critical') {
      this.alertCriticalError(errorLog);
    }

    return errorLog;
  }

  /**
   * Alert on critical errors
   */
  private alertCriticalError(error: ErrorLog): void {
    // TODO: Implement alerting (email, Slack, PagerDuty, etc.)
    console.error(`🚨 CRITICAL ERROR: ${error.message}`);
  }

  /**
   * Get error logs
   */
  getLogs(filters?: { category?: ErrorCategory; severity?: ErrorSeverity; limit?: number }): ErrorLog[] {
    let filtered = [...this.logs];

    if (filters?.category) {
      filtered = filtered.filter((l) => l.category === filters.category);
    }

    if (filters?.severity) {
      filtered = filtered.filter((l) => l.severity === filters.severity);
    }

    const limit = filters?.limit || 100;
    return filtered.slice(-limit);
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    const categories: Record<ErrorCategory, number> = {
      auth: 0,
      validation: 0,
      database: 0,
      api: 0,
      trading: 0,
      payment: 0,
      broker: 0,
      unknown: 0,
    };

    const severities: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const log of this.logs) {
      categories[log.category]++;
      severities[log.severity]++;
    }

    const unresolvedErrors = this.logs.filter((l) => !l.resolved).length;
    const criticalErrors = this.logs.filter((l) => l.severity === 'critical').length;

    // Calculate error rate (errors per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.logs.filter((l) => l.timestamp > oneHourAgo).length;
    const errorRate = recentErrors; // errors per hour

    return {
      totalErrors: this.logs.length,
      errorsByCategory: categories,
      errorsBySeverity: severities,
      unresolvedErrors,
      errorRate,
      criticalErrorCount: criticalErrors,
    };
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, notes?: string): void {
    const error = this.logs.find((l) => l.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolutionNotes = notes;
    }
  }

  /**
   * Clear old logs (older than 30 days)
   */
  clearOldLogs(daysOld: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialLength = this.logs.length;
    this.logs = this.logs.filter((l) => l.timestamp > cutoffDate);
    return initialLength - this.logs.length;
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const recentErrors = this.getLogs({ limit: 10 });

    const report = `
# Error Report

## Summary
- **Total Errors:** ${metrics.totalErrors}
- **Unresolved Errors:** ${metrics.unresolvedErrors}
- **Critical Errors:** ${metrics.criticalErrorCount}
- **Error Rate:** ${metrics.errorRate} errors/hour

## Errors by Category
${Object.entries(metrics.errorsByCategory)
  .map(([cat, count]) => `- ${cat}: ${count}`)
  .join('\n')}

## Errors by Severity
${Object.entries(metrics.errorsBySeverity)
  .map(([sev, count]) => `- ${sev}: ${count}`)
  .join('\n')}

## Recent Errors
${recentErrors
  .map(
    (err) => `
### ${err.code} (${err.severity})
- Message: ${err.message}
- Time: ${err.timestamp.toISOString()}
- Resolved: ${err.resolved ? 'Yes' : 'No'}
`
  )
  .join('')}
`;

    return report;
  }
}

/**
 * Global error logger instance
 */
export const errorLogger = new ErrorLogger();

/**
 * Error boundary middleware
 */
export function errorBoundary(fn: Function) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorLogger.logError(error as Error);
      throw error;
    }
  };
}

/**
 * Throw app error
 */
export function throwError(errorDef: any, message?: string, context?: Record<string, any>): never {
  throw new AppError(message || errorDef.message, errorDef.code, errorDef.statusCode, errorDef.category, 'high', context);
}
