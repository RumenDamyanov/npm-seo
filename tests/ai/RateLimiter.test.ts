/**
 * Tests for RateLimiter
 */

import { RateLimiter, RateLimiterManager } from '../../src/ai/RateLimiter';

describe('RateLimiter', () => {
  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
        maxConcurrent: 5,
      });

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        await limiter.acquire();
        limiter.release();
      }

      const stats = limiter.getStats();
      expect(stats.acceptedRequests).toBe(5);
      expect(stats.rejectedRequests).toBe(0);

      limiter.destroy();
    });

    it('should reject requests exceeding limit when queue disabled', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
        enableQueue: false,
      });

      await limiter.acquire();
      await limiter.acquire();

      // Third request should be rejected
      await expect(limiter.acquire()).rejects.toThrow('Rate limit exceeded');

      limiter.destroy();
    });

    it('should queue requests when enabled', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 500,
        maxConcurrent: 2,
        enableQueue: true,
        maxQueueSize: 10,
      });

      const promises: Promise<void>[] = [];

      // Make 4 requests (2 immediate, 2 queued)
      for (let i = 0; i < 4; i++) {
        promises.push(
          limiter.acquire().then(() => {
            limiter.release();
          })
        );
      }

      await Promise.all(promises);

      const stats = limiter.getStats();
      expect(stats.acceptedRequests).toBe(4);

      limiter.destroy();
    }, 10000);
  });

  describe('Concurrent Requests', () => {
    it('should limit concurrent requests', async () => {
      const limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 1000,
        maxConcurrent: 2,
        enableQueue: true,
      });

      let concurrent = 0;
      let maxConcurrent = 0;

      const promises = Array.from({ length: 5 }, async () => {
        await limiter.acquire();
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);

        await new Promise(resolve => setTimeout(resolve, 50));

        concurrent--;
        limiter.release();
      });

      await Promise.all(promises);

      expect(maxConcurrent).toBeLessThanOrEqual(2);

      limiter.destroy();
    });
  });

  describe('Token Refill', () => {
    it('should refill tokens over time', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 500,
        maxConcurrent: 5,
      });

      // Use all tokens
      await limiter.acquire();
      await limiter.acquire();

      expect(limiter.getAvailableTokens()).toBe(0);

      // Wait for refill
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(limiter.getAvailableTokens()).toBeGreaterThan(0);

      limiter.destroy();
    });
  });

  describe('tryAcquire', () => {
    it('should return true when token available', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      const acquired = limiter.tryAcquire();
      expect(acquired).toBe(true);

      limiter.destroy();
    });

    it('should return false when no tokens available', () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
      });

      limiter.tryAcquire(); // Use the token
      const acquired = limiter.tryAcquire(); // Try again

      expect(acquired).toBe(false);

      limiter.destroy();
    });
  });

  describe('Queue Management', () => {
    it('should reject when queue is full', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 10000,
        maxConcurrent: 1,
        enableQueue: true,
        maxQueueSize: 2,
      });

      await limiter.acquire(); // Use token

      // Fill queue
      const promise1 = limiter.acquire();
      const promise2 = limiter.acquire();

      // This should be rejected (queue full)
      await expect(limiter.acquire()).rejects.toThrow('Rate limit queue is full');

      limiter.release();
      await promise1;
      limiter.release();
      await promise2;
      limiter.release();

      limiter.destroy();
    });

    it('should clear queue', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 10000,
        enableQueue: true,
      });

      await limiter.acquire(); // Use token

      const promises = [limiter.acquire(), limiter.acquire()];

      limiter.clearQueue();

      await expect(Promise.all(promises)).rejects.toThrow();

      limiter.destroy();
    });
  });

  describe('Statistics', () => {
    it('should track statistics', async () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
        enableQueue: false,
      });

      await limiter.acquire();
      limiter.release();
      await limiter.acquire();
      limiter.release();

      try {
        await limiter.acquire();
        await limiter.acquire();
        await limiter.acquire();
      } catch (error) {
        // Expected rejections
      }

      const stats = limiter.getStats();

      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.acceptedRequests).toBeGreaterThan(0);
      expect(stats.rejectedRequests).toBeGreaterThan(0);

      limiter.destroy();
    });

    it('should reset statistics', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      limiter.tryAcquire();

      limiter.resetStats();

      const stats = limiter.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.acceptedRequests).toBe(0);

      limiter.destroy();
    });
  });
});

describe('RateLimiterManager', () => {
  let manager: RateLimiterManager;

  beforeEach(() => {
    manager = new RateLimiterManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  it('should create and get limiters', () => {
    const limiter = manager.getLimiter('openai', {
      maxRequests: 60,
      windowMs: 60000,
    });

    expect(limiter).toBeDefined();

    const sameLimiter = manager.getLimiter('openai');
    expect(sameLimiter).toBe(limiter);
  });

  it('should manage multiple limiters', () => {
    manager.getLimiter('openai', { maxRequests: 60, windowMs: 60000 });
    manager.getLimiter('anthropic', { maxRequests: 50, windowMs: 60000 });

    const stats = manager.getAllStats();

    expect(stats.size).toBe(2);
    expect(stats.has('openai')).toBe(true);
    expect(stats.has('anthropic')).toBe(true);
  });

  it('should replace existing limiter', () => {
    const limiter1 = manager.getLimiter('openai', {
      maxRequests: 60,
      windowMs: 60000,
    });

    const limiter2 = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000,
    });

    manager.setLimiter('openai', limiter2);

    const retrieved = manager.getLimiter('openai');
    expect(retrieved).toBe(limiter2);
    expect(retrieved).not.toBe(limiter1);
  });

  it('should throw when getting non-existent limiter without config', () => {
    expect(() => {
      manager.getLimiter('nonexistent');
    }).toThrow('No rate limiter configured for provider: nonexistent');
  });

  it('should destroy all limiters', () => {
    manager.getLimiter('openai', { maxRequests: 60, windowMs: 60000 });
    manager.getLimiter('anthropic', { maxRequests: 50, windowMs: 60000 });

    manager.destroy();

    const stats = manager.getAllStats();
    expect(stats.size).toBe(0);
  });
});

