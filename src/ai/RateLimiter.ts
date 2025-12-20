/**
 * Rate Limiter for AI Providers
 *
 * Token bucket algorithm for rate limiting API calls
 *
 * @packageDocumentation
 */

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /**
   * Maximum number of requests per window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Maximum concurrent requests
   */
  maxConcurrent?: number;

  /**
   * Enable queue for requests exceeding limit
   */
  enableQueue?: boolean;

  /**
   * Maximum queue size (0 = unlimited)
   */
  maxQueueSize?: number;
}

/**
 * Rate limiter statistics
 */
export interface RateLimiterStats {
  totalRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  queuedRequests: number;
  currentConcurrent: number;
  averageWaitTime: number;
}

/**
 * Token bucket rate limiter
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 60,
 *   windowMs: 60000, // 60 requests per minute
 *   maxConcurrent: 5
 * });
 *
 * await limiter.acquire();
 * // ... make API call ...
 * limiter.release();
 * ```
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private tokens: number;
  private lastRefill: number;
  private concurrent: number;
  private queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
    timestamp: number;
  }>;
  private stats: RateLimiterStats;
  private refillInterval: ReturnType<typeof setInterval> | null;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      maxConcurrent: config.maxConcurrent ?? 10,
      enableQueue: config.enableQueue ?? true,
      maxQueueSize: config.maxQueueSize ?? 100,
    };

    this.tokens = this.config.maxRequests;
    this.lastRefill = Date.now();
    this.concurrent = 0;
    this.queue = [];
    this.stats = {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      currentConcurrent: 0,
      averageWaitTime: 0,
    };

    // Start refill interval
    this.refillInterval = globalThis.setInterval(() => {
      this.refillTokens();
      this.processQueue();
    }, 1000); // Check every second
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed >= this.config.windowMs) {
      this.tokens = this.config.maxRequests;
      this.lastRefill = now;
    } else {
      // Partial refill based on elapsed time
      const tokensToAdd = (this.config.maxRequests * elapsed) / this.config.windowMs;
      this.tokens = Math.min(this.config.maxRequests, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    while (this.queue.length > 0 && this.canAcquire()) {
      const item = this.queue.shift();
      if (item) {
        this.tokens--;
        this.concurrent++;
        this.stats.acceptedRequests++;
        this.stats.queuedRequests--;
        this.stats.currentConcurrent = this.concurrent;

        // Calculate wait time
        const waitTime = Date.now() - item.timestamp;
        this.updateAverageWaitTime(waitTime);

        item.resolve();
      }
    }
  }

  /**
   * Check if we can acquire a token
   */
  private canAcquire(): boolean {
    return this.tokens >= 1 && this.concurrent < this.config.maxConcurrent;
  }

  /**
   * Acquire a token (wait if necessary)
   *
   * @throws Error if queue is full and queueing is disabled
   */
  async acquire(): Promise<void> {
    this.stats.totalRequests++;
    this.refillTokens();

    if (this.canAcquire()) {
      this.tokens--;
      this.concurrent++;
      this.stats.acceptedRequests++;
      this.stats.currentConcurrent = this.concurrent;
      return;
    }

    // Queue the request if enabled
    if (this.config.enableQueue) {
      if (this.config.maxQueueSize > 0 && this.queue.length >= this.config.maxQueueSize) {
        this.stats.rejectedRequests++;
        throw new Error('Rate limit queue is full');
      }

      this.stats.queuedRequests++;

      return new Promise<void>((resolve, reject) => {
        this.queue.push({
          resolve,
          reject,
          timestamp: Date.now(),
        });
      });
    }

    // Reject if queueing is disabled
    this.stats.rejectedRequests++;
    throw new Error('Rate limit exceeded');
  }

  /**
   * Release a token
   */
  release(): void {
    this.concurrent = Math.max(0, this.concurrent - 1);
    this.stats.currentConcurrent = this.concurrent;
    this.processQueue();
  }

  /**
   * Try to acquire without waiting
   *
   * @returns True if acquired, false otherwise
   */
  tryAcquire(): boolean {
    this.stats.totalRequests++;
    this.refillTokens();

    if (this.canAcquire()) {
      this.tokens--;
      this.concurrent++;
      this.stats.acceptedRequests++;
      this.stats.currentConcurrent = this.concurrent;
      return true;
    }

    this.stats.rejectedRequests++;
    return false;
  }

  /**
   * Get current statistics
   */
  getStats(): RateLimiterStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      currentConcurrent: this.concurrent,
      averageWaitTime: 0,
    };
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refillTokens();
    return Math.floor(this.tokens);
  }

  /**
   * Update average wait time
   */
  private updateAverageWaitTime(waitTime: number): void {
    const total = this.stats.acceptedRequests;
    this.stats.averageWaitTime = (this.stats.averageWaitTime * (total - 1) + waitTime) / total;
  }

  /**
   * Clear queue and reject all pending requests
   */
  clearQueue(error?: Error): void {
    const defaultError = error || new Error('Rate limiter queue cleared');

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.reject(defaultError);
      }
    }

    this.stats.queuedRequests = 0;
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    if (this.refillInterval) {
      globalThis.clearInterval(this.refillInterval);
      this.refillInterval = null;
    }
    this.clearQueue();
  }
}

/**
 * Rate limiter manager for multiple providers
 */
export class RateLimiterManager {
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.limiters = new Map();
  }

  /**
   * Get or create rate limiter for provider
   */
  getLimiter(provider: string, config?: RateLimiterConfig): RateLimiter {
    let limiter = this.limiters.get(provider);

    if (!limiter && config) {
      limiter = new RateLimiter(config);
      this.limiters.set(provider, limiter);
    }

    if (!limiter) {
      throw new Error(`No rate limiter configured for provider: ${provider}`);
    }

    return limiter;
  }

  /**
   * Set rate limiter for provider
   */
  setLimiter(provider: string, limiter: RateLimiter): void {
    // Destroy existing limiter if any
    const existing = this.limiters.get(provider);
    if (existing) {
      existing.destroy();
    }

    this.limiters.set(provider, limiter);
  }

  /**
   * Get statistics for all limiters
   */
  getAllStats(): Map<string, RateLimiterStats> {
    const stats = new Map<string, RateLimiterStats>();

    for (const [provider, limiter] of this.limiters.entries()) {
      stats.set(provider, limiter.getStats());
    }

    return stats;
  }

  /**
   * Destroy all limiters
   */
  destroy(): void {
    for (const limiter of this.limiters.values()) {
      limiter.destroy();
    }
    this.limiters.clear();
  }
}
