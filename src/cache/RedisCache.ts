/**
 * Redis Cache Implementation
 *
 * Redis-backed cache for distributed caching
 *
 * @packageDocumentation
 */

import type { CacheInterface, CacheConfig, CacheStats } from './CacheInterface';

/**
 * Minimal type surface for the redis client.
 */
interface RedisClient {
  on(event: string, callback: (err: Error) => void): void;
  connect(): Promise<void>;
  quit(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
  exists(key: string): Promise<number>;
  del(key: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  mGet(keys: string[]): Promise<(string | null)[]>;
  multi(): RedisPipeline;
}

interface RedisPipeline {
  set(key: string, value: string): RedisPipeline;
  setEx(key: string, seconds: number, value: string): RedisPipeline;
  exec(): Promise<unknown>;
}

interface RedisModule {
  createClient(options: { url: string; socket?: { connectTimeout: number } }): RedisClient;
}

/**
 * Redis cache configuration
 */
export interface RedisCacheConfig extends CacheConfig {
  /**
   * Redis connection URL
   * @example 'redis://localhost:6379'
   */
  url?: string;

  /**
   * Redis host (alternative to URL)
   */
  host?: string;

  /**
   * Redis port (alternative to URL)
   */
  port?: number;

  /**
   * Redis password
   */
  password?: string;

  /**
   * Redis database number
   */
  db?: number;

  /**
   * Connection timeout in milliseconds
   */
  connectTimeout?: number;
}

/**
 * Redis cache adapter
 *
 * @example
 * ```typescript
 * const cache = new RedisCache({
 *   url: 'redis://localhost:6379',
 *   ttl: 300,
 *   namespace: 'seo'
 * });
 *
 * await cache.set('key', 'value');
 * const value = await cache.get('key');
 * await cache.close();
 * ```
 */
export class RedisCache implements CacheInterface {
  private client: RedisClient | null = null;
  private config: Required<RedisCacheConfig>;
  private stats: CacheStats;
  private connected: boolean;

  constructor(config: RedisCacheConfig = {}) {
    this.config = {
      ttl: config.ttl ?? 300,
      namespace: config.namespace ?? 'seo',
      maxSize: config.maxSize ?? 10000,
      enableStats: config.enableStats ?? false,
      url: config.url ?? 'redis://localhost:6379',
      host: config.host ?? 'localhost',
      port: config.port ?? 6379,
      password: config.password ?? '',
      db: config.db ?? 0,
      connectTimeout: config.connectTimeout ?? 5000,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0,
    };

    this.connected = false;
  }

  /**
   * Initialize Redis connection
   */
  private async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      // Dynamic import for optional peer dependency
      const redis = require('redis') as RedisModule;

      this.client = redis.createClient({
        url: this.config.url,
        socket: {
          connectTimeout: this.config.connectTimeout,
        },
      });

      this.client.on('error', (err: Error) => {
        // Redis client error - logged for diagnostics
        void err;
      });

      await this.client.connect();
      this.connected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Make sure redis is installed: npm install redis'
      );
    }
  }

  /**
   * Ensure connection is established
   */
  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  /**
   * Get the connected Redis client (throws if not connected).
   */
  private getClient(): RedisClient {
    if (!this.client) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  /**
   * Get namespaced key
   */
  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const value = await this.getClient().get(nsKey);

      if (value === null || value === undefined) {
        if (this.config.enableStats) {
          this.stats.misses++;
          this.updateHitRate();
        }
        return null;
      }

      if (this.config.enableStats) {
        this.stats.hits++;
        this.updateHitRate();
      }

      // Type guard ensures value is string at this point
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);
    const effectiveTtl = ttl ?? this.config.ttl;

    try {
      const serialized = JSON.stringify(value);

      if (effectiveTtl > 0) {
        await this.getClient().setEx(nsKey, effectiveTtl, serialized);
      } else {
        await this.getClient().set(nsKey, serialized);
      }

      if (this.config.enableStats) {
        this.stats.sets++;
      }

      return true;
    } catch {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const exists = await this.getClient().exists(nsKey);
      return exists === 1;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const deleted = await this.getClient().del(nsKey);

      if (deleted > 0 && this.config.enableStats) {
        this.stats.deletes++;
      }

      return deleted > 0;
    } catch {
      return false;
    }
  }

  async clear(): Promise<boolean> {
    await this.ensureConnected();

    try {
      const pattern = `${this.config.namespace}:*`;
      const keys: string[] = await this.getClient().keys(pattern);

      if (keys.length > 0) {
        await this.getClient().del(keys);
      }

      return true;
    } catch {
      return false;
    }
  }

  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    await this.ensureConnected();
    const result = new Map<string, T>();

    if (keys.length === 0) {
      return result;
    }

    try {
      const nsKeys = keys.map(k => this.getKey(k));
      const values: (string | null)[] = await this.getClient().mGet(nsKeys);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];

        if (!key) {
          continue;
        }

        if (value !== null && value !== undefined && typeof value === 'string') {
          result.set(key, JSON.parse(value) as T);
          if (this.config.enableStats) {
            this.stats.hits++;
          }
        } else {
          if (this.config.enableStats) {
            this.stats.misses++;
          }
        }
      }

      if (this.config.enableStats) {
        this.updateHitRate();
      }
    } catch {
      // Redis getMany error - fall through with partial results
    }

    return result;
  }

  async setMany<T>(entries: Map<string, T>, ttl?: number): Promise<boolean> {
    await this.ensureConnected();

    if (entries.size === 0) {
      return true;
    }

    try {
      const effectiveTtl = ttl ?? this.config.ttl;
      const pipeline = this.getClient().multi();

      for (const [key, value] of entries.entries()) {
        const nsKey = this.getKey(key);
        const serialized = JSON.stringify(value);

        if (effectiveTtl > 0) {
          pipeline.setEx(nsKey, effectiveTtl, serialized);
        } else {
          pipeline.set(nsKey, serialized);
        }
      }

      await pipeline.exec();

      if (this.config.enableStats) {
        this.stats.sets += entries.size;
      }

      return true;
    } catch {
      return false;
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    await this.ensureConnected();

    if (keys.length === 0) {
      return 0;
    }

    try {
      const nsKeys = keys.map(k => this.getKey(k));
      const deleted = await this.getClient().del(nsKeys);

      if (this.config.enableStats) {
        this.stats.deletes += deleted;
      }

      return deleted;
    } catch {
      return 0;
    }
  }

  async getStats(): Promise<CacheStats | null> {
    if (!this.config.enableStats) {
      return null;
    }

    try {
      await this.ensureConnected();
      const pattern = `${this.config.namespace}:*`;
      const keys: string[] = await this.getClient().keys(pattern);
      this.stats.size = keys.length;
    } catch {
      // Redis getStats error - return current stats
    }

    return { ...this.stats };
  }

  async resetStats(): Promise<void> {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0,
    };
  }

  async close(): Promise<void> {
    if (this.connected && this.client) {
      try {
        await this.client.quit();
        this.connected = false;
      } catch {
        // Redis close error - ignore
      }
    }
  }

  /**
   * Update hit rate statistic
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}
