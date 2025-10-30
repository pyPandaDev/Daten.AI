/**
 * Production-ready logger utility
 * Replaces console.log with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private addToHistory(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message), data);
    }
    this.addToHistory({ level: 'debug', message, timestamp: new Date().toISOString(), data });
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message), data);
    }
    this.addToHistory({ level: 'info', message, timestamp: new Date().toISOString(), data });
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message), data);
    this.addToHistory({ level: 'warn', message, timestamp: new Date().toISOString(), data });
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error);
    this.addToHistory({ level: 'error', message, timestamp: new Date().toISOString(), data: error });
    
    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Integrate with Sentry or similar service
      // window.Sentry?.captureException(error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
