/**
 * Cache Interface for SEO Manager
 *
 * @packageDocumentation
 */

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /**
   * Default TTL in seconds (0 = no expiration)
   */
  ttl?: number;

  /**
   * Namespace for cache keys (useful for multi-tenant)
   */
  namespace?: string;

  /**
   * Maximum number of items in cache (for memory cache)
   */
  maxSize?: number;

  /**
   * Whether to enable cache statistics
   */
  enableStats?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  createdAt: number;
}

/**
 * Cache adapter interface
 *
 * All cache implementations must conform to this interface
 */
export interface CacheInterface {
  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional, uses default if not provided)
   * @returns True if successful
   */
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Check if a key exists in cache
   *
   * @param key - Cache key
   * @returns True if key exists and not expired
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a value from cache
   *
   * @param key - Cache key
   * @returns True if deleted, false if not found
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all cache entries
   *
   * @returns True if successful
   */
  clear(): Promise<boolean>;

  /**
   * Get multiple values from cache
   *
   * @param keys - Array of cache keys
   * @returns Map of key-value pairs (only existing keys)
   */
  getMany<T>(keys: string[]): Promise<Map<string, T>>;

  /**
   * Set multiple values in cache
   *
   * @param entries - Map of key-value pairs
   * @param ttl - Time to live in seconds (optional)
   * @returns True if successful
   */
  setMany<T>(entries: Map<string, T>, ttl?: number): Promise<boolean>;

  /**
   * Delete multiple values from cache
   *
   * @param keys - Array of cache keys
   * @returns Number of deleted keys
   */
  deleteMany(keys: string[]): Promise<number>;

  /**
   * Get cache statistics (if enabled)
   *
   * @returns Cache statistics or null if disabled
   */
  getStats(): Promise<CacheStats | null>;

  /**
   * Reset cache statistics
   */
  resetStats(): Promise<void>;

  /**
   * Close cache connection (for external caches like Redis)
   */
  close(): Promise<void>;
}

/**
 * Base cache key generator
 */
export class CacheKeyGenerator {
  /**
   * Generate a cache key for content analysis
   */
  static contentAnalysis(content: string): string {
    const hash = this.hashString(content);
    return `seo:content:${hash}`;
  }

  /**
   * Generate a cache key for AI generation
   */
  static aiGeneration(prompt: string, model: string, provider: string): string {
    const hash = this.hashString(prompt);
    return `seo:ai:${provider}:${model}:${hash}`;
  }

  /**
   * Generate a cache key for HTML parsing
   */
  static htmlParsing(html: string): string {
    const hash = this.hashString(html);
    return `seo:html:${hash}`;
  }

  /**
   * Generate a cache key for SEO result
   */
  static seoResult(content: string, config: string): string {
    const hash = this.hashString(content + config);
    return `seo:result:${hash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(str.length, 1000); i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
