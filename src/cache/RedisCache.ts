/**
 * Redis Cache Implementation
 *
 * Redis-backed cache for distributed caching
 *
 * @packageDocumentation
 */

import { CacheInterface, CacheConfig, CacheStats } from './CacheInterface';

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
  private client: any; // Redis client (dynamic import)
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
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const redis = require('redis');

      this.client = redis.createClient({
        url: this.config.url,
        socket: {
          connectTimeout: this.config.connectTimeout,
        },
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
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
   * Get namespaced key
   */
  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const value = await this.client.get(nsKey);

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
      return JSON.parse(value as string) as T;
    } catch (error) {
      console.error('Redis get error:', error);
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
        await this.client.setEx(nsKey, effectiveTtl, serialized);
      } else {
        await this.client.set(nsKey, serialized);
      }

      if (this.config.enableStats) {
        this.stats.sets++;
      }

      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const exists = await this.client.exists(nsKey);
      return exists === 1;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureConnected();
    const nsKey = this.getKey(key);

    try {
      const deleted = await this.client.del(nsKey);

      if (deleted > 0 && this.config.enableStats) {
        this.stats.deletes++;
      }

      return deleted > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    await this.ensureConnected();

    try {
      const pattern = `${this.config.namespace}:*`;
      const keys: string[] = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(keys);
      }

      return true;
    } catch (error) {
      console.error('Redis clear error:', error);
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
      const values: (string | null)[] = await this.client.mGet(nsKeys);

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
    } catch (error) {
      console.error('Redis getMany error:', error);
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
      const pipeline = this.client.multi();

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
    } catch (error) {
      console.error('Redis setMany error:', error);
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
      const deleted = await this.client.del(nsKeys);

      if (this.config.enableStats) {
        this.stats.deletes += deleted;
      }

      return deleted;
    } catch (error) {
      console.error('Redis deleteMany error:', error);
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
      const keys: string[] = await this.client.keys(pattern);
      this.stats.size = keys.length;
    } catch (error) {
      console.error('Redis getStats error:', error);
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
      } catch (error) {
        console.error('Redis close error:', error);
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
