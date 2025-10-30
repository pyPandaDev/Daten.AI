/**
 * Optimized API Service with:
 * - Request/Response caching
 * - Automatic retry with exponential backoff
 * - Request debouncing
 * - Error handling
 * - Request cancellation
 * - Performance monitoring
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache implementation
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
      if (!isExpired) {
        logger.debug(`[CACHE HIT] ${key}`);
        return cached.data;
      }
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
    logger.debug(`[CACHE SET] ${key}`);
  }

  clear() {
    this.cache.clear();
  }

  generateKey(config: AxiosRequestConfig): string {
    const { method = 'GET', url = '', params, data } = config;
    const paramStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${paramStr}:${dataStr}`;
  }
}

// Request debouncer
class RequestDebouncer {
  private pending = new Map<string, NodeJS.Timeout>();

  debounce(key: string, fn: () => void, delay = 300) {
    const existing = this.pending.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => {
      this.pending.delete(key);
      fn();
    }, delay);
    this.pending.set(key, timeout);
  }

  cancel(key: string) {
    const timeout = this.pending.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.pending.delete(key);
    }
  }

  clear() {
    this.pending.forEach(timeout => clearTimeout(timeout));
    this.pending.clear();
  }
}

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  start(requestId: string): number {
    return performance.now();
  }

  end(requestId: string, startTime: number) {
    const duration = performance.now() - startTime;
    const key = requestId.split(':')[1] || requestId; // Extract endpoint
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const durations = this.metrics.get(key)!;
    durations.push(duration);
    
    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift();
    }
    
    logger.debug(`[PERF] ${key}: ${duration.toFixed(2)}ms`);
  }

  getMetrics() {
    const result: Record<string, { avg: number; min: number; max: number }> = {};
    
    this.metrics.forEach((durations, endpoint) => {
      if (durations.length > 0) {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        result[endpoint] = { avg, min, max };
      }
    });
    
    return result;
  }
}

// Enhanced API class
class OptimizedAPI {
  private api: AxiosInstance;
  private cache = new RequestCache();
  private debouncer = new RequestDebouncer();
  private monitor = new PerformanceMonitor();
  private abortControllers = new Map<string, AbortController>();

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Log in development
        logger.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error) => {
        logger.error('[API] Request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        logger.debug(`[API] Response ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: number };
        
        // Handle network errors and retry
        if (!error.response && config && (!config._retry || config._retry < MAX_RETRIES)) {
          config._retry = (config._retry || 0) + 1;
          const delay = RETRY_DELAY * Math.pow(2, config._retry - 1); // Exponential backoff
          
          logger.warn(`[API] Retry attempt ${config._retry} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.api.request(config);
        }

        // Log error details
        logger.error('[API] Response error', {
          url: config?.url,
          status: error.response?.status,
          message: error.message,
        });

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as any;
      const message = data?.detail || data?.message || `API Error: ${error.response.status}`;
      return new Error(message);
    }
    if (error.request) {
      return new Error('Network error: Unable to reach server');
    }
    return new Error(error.message || 'Unknown error occurred');
  }

  // Enhanced request methods with caching
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const cacheKey = this.cache.generateKey({ ...config, method: 'GET', url });
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const startTime = this.monitor.start(cacheKey);
    
    try {
      const response = await this.api.get<T>(url, config);
      this.cache.set(cacheKey, response.data);
      this.monitor.end(cacheKey, startTime);
      return response.data;
    } catch (error) {
      this.monitor.end(cacheKey, startTime);
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestId = `${url}:${this.generateRequestId()}`;
    const startTime = this.monitor.start(requestId);
    
    try {
      const response = await this.api.post<T>(url, data, config);
      this.monitor.end(requestId, startTime);
      return response.data;
    } catch (error) {
      this.monitor.end(requestId, startTime);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Debounced request for search/autocomplete
  debounced<T>(
    key: string,
    request: () => Promise<T>,
    delay = 300
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.debouncer.debounce(key, async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  // Cancellable request
  cancellable<T>(
    key: string,
    request: (signal: AbortSignal) => Promise<T>
  ): Promise<T> {
    // Cancel previous request with same key
    const existing = this.abortControllers.get(key);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    return request(controller.signal).finally(() => {
      this.abortControllers.delete(key);
    });
  }

  // Utility methods
  clearCache() {
    this.cache.clear();
  }

  getPerformanceMetrics() {
    return this.monitor.getMetrics();
  }

  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
    this.debouncer.clear();
  }
}

// Export singleton instance
export const optimizedAPI = new OptimizedAPI();

// Re-export types
export * from './api';
