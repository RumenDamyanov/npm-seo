/**
 * Memory Cache Implementation
 *
 * In-memory cache with LRU eviction policy
 *
 * @packageDocumentation
 */

import { CacheInterface, CacheConfig, CacheEntry, CacheStats } from './CacheInterface';

/**
 * In-memory cache with LRU eviction
 *
 * @example
 * ```typescript
 * const cache = new MemoryCache({
 *   ttl: 300,
 *   maxSize: 1000,
 *   enableStats: true
 * });
 *
 * await cache.set('key', 'value', 60);
 * const value = await cache.get('key');
 * ```
 */
export class MemoryCache implements CacheInterface {
  private store: Map<string, CacheEntry<unknown>>;
  private accessOrder: Map<string, number>;
  private config: Required<CacheConfig>;
  private stats: CacheStats;
  private accessCounter: number;

  constructor(config: CacheConfig = {}) {
    this.store = new Map();
    this.accessOrder = new Map();
    this.accessCounter = 0;
    this.config = {
      ttl: config.ttl ?? 300,
      namespace: config.namespace ?? 'default',
      maxSize: config.maxSize ?? 1000,
      enableStats: config.enableStats ?? false,
    };
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0,
    };
  }

  /**
   * Get namespaced key
   */
  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (entry.expiresAt === null) {
      return false;
    }
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.store.size === 0) {
      return;
    }

    let oldestKey = '';
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * Update access order
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }

  async get<T>(key: string): Promise<T | null> {
    const nsKey = this.getKey(key);
    const entry = this.store.get(nsKey) as CacheEntry<T> | undefined;

    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(nsKey);
      this.accessOrder.delete(nsKey);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    this.updateAccessOrder(nsKey);
    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const nsKey = this.getKey(key);
    const effectiveTtl = ttl ?? this.config.ttl;

    // Evict if at capacity and key doesn't exist
    if (this.store.size >= this.config.maxSize && !this.store.has(nsKey)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: effectiveTtl > 0 ? Date.now() + effectiveTtl * 1000 : null,
      createdAt: Date.now(),
    };

    this.store.set(nsKey, entry);
    this.updateAccessOrder(nsKey);

    if (this.config.enableStats) {
      this.stats.sets++;
      this.stats.size = this.store.size;
    }

    return true;
  }

  async has(key: string): Promise<boolean> {
    const nsKey = this.getKey(key);
    const entry = this.store.get(nsKey);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.store.delete(nsKey);
      this.accessOrder.delete(nsKey);
      return false;
    }

    return true;
  }

  async delete(key: string): Promise<boolean> {
    const nsKey = this.getKey(key);
    const deleted = this.store.delete(nsKey);
    this.accessOrder.delete(nsKey);

    if (deleted && this.config.enableStats) {
      this.stats.deletes++;
      this.stats.size = this.store.size;
    }

    return deleted;
  }

  async clear(): Promise<boolean> {
    this.store.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;

    if (this.config.enableStats) {
      this.stats.size = 0;
    }

    return true;
  }

  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  async setMany<T>(entries: Map<string, T>, ttl?: number): Promise<boolean> {
    for (const [key, value] of entries.entries()) {
      await this.set(key, value, ttl);
    }
    return true;
  }

  async deleteMany(keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      const deleted = await this.delete(key);
      if (deleted) {
        count++;
      }
    }
    return count;
  }

  async getStats(): Promise<CacheStats | null> {
    if (!this.config.enableStats) {
      return null;
    }
    return { ...this.stats };
  }

  async resetStats(): Promise<void> {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: this.store.size,
      hitRate: 0,
    };
  }

  async close(): Promise<void> {
    // Nothing to close for memory cache
  }

  /**
   * Update hit rate statistic
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}
