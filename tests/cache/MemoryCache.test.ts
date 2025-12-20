/**
 * Tests for MemoryCache
 */

import { MemoryCache } from '../../src/cache/MemoryCache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache({
      ttl: 60,
      maxSize: 10,
      enableStats: true,
    });
  });

  afterEach(async () => {
    await cache.close();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      await cache.set('key1', 'value1');
      const value = await cache.get<string>('key1');
      expect(value).toBe('value1');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cache.get('nonexistent');
      expect(value).toBeNull();
    });

    it('should check if key exists', async () => {
      await cache.set('key1', 'value1');
      expect(await cache.has('key1')).toBe(true);
      expect(await cache.has('key2')).toBe(false);
    });

    it('should delete keys', async () => {
      await cache.set('key1', 'value1');
      expect(await cache.has('key1')).toBe(true);

      const deleted = await cache.delete('key1');
      expect(deleted).toBe(true);
      expect(await cache.has('key1')).toBe(false);
    });

    it('should clear all keys', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.clear();

      expect(await cache.has('key1')).toBe(false);
      expect(await cache.has('key2')).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire keys after TTL', async () => {
      const shortCache = new MemoryCache({ ttl: 1 }); // 1 second

      await shortCache.set('key1', 'value1');
      expect(await shortCache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(await shortCache.get('key1')).toBeNull();
      await shortCache.close();
    });

    it('should use custom TTL per key', async () => {
      await cache.set('key1', 'value1', 1); // 1 second
      await cache.set('key2', 'value2', 10); // 10 seconds

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBe('value2');
    });

    it('should support zero TTL (no expiration)', async () => {
      await cache.set('key1', 'value1', 0);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await cache.get('key1')).toBe('value1');
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used items when full', async () => {
      const smallCache = new MemoryCache({ maxSize: 3 });

      await smallCache.set('key1', 'value1');
      await smallCache.set('key2', 'value2');
      await smallCache.set('key3', 'value3');

      // Access key1 to make it recently used
      await smallCache.get('key1');

      // Add key4, should evict key2 (least recently used)
      await smallCache.set('key4', 'value4');

      expect(await smallCache.has('key1')).toBe(true);
      expect(await smallCache.has('key2')).toBe(false);
      expect(await smallCache.has('key3')).toBe(true);
      expect(await smallCache.has('key4')).toBe(true);

      await smallCache.close();
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      const values = await cache.getMany<string>(['key1', 'key2', 'key4']);

      expect(values.size).toBe(2);
      expect(values.get('key1')).toBe('value1');
      expect(values.get('key2')).toBe('value2');
      expect(values.has('key4')).toBe(false);
    });

    it('should set multiple values', async () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ]);

      await cache.setMany(entries);

      expect(await cache.get('key1')).toBe('value1');
      expect(await cache.get('key2')).toBe('value2');
      expect(await cache.get('key3')).toBe('value3');
    });

    it('should delete multiple values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      const deleted = await cache.deleteMany(['key1', 'key3']);

      expect(deleted).toBe(2);
      expect(await cache.has('key1')).toBe(false);
      expect(await cache.has('key2')).toBe(true);
      expect(await cache.has('key3')).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should track cache statistics', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.get('key1'); // Hit
      await cache.get('key1'); // Hit
      await cache.get('key3'); // Miss

      const stats = await cache.getStats();

      expect(stats).not.toBeNull();
      expect(stats!.hits).toBe(2);
      expect(stats!.misses).toBe(1);
      expect(stats!.sets).toBe(2);
      expect(stats!.size).toBe(2);
      expect(stats!.hitRate).toBeCloseTo(2 / 3, 2);
    });

    it('should reset statistics', async () => {
      await cache.set('key1', 'value1');
      await cache.get('key1');

      await cache.resetStats();

      const stats = await cache.getStats();
      expect(stats!.hits).toBe(0);
      expect(stats!.misses).toBe(0);
      expect(stats!.sets).toBe(0);
    });

    it('should return null stats when disabled', async () => {
      const noStatsCache = new MemoryCache({ enableStats: false });

      await noStatsCache.set('key1', 'value1');
      const stats = await noStatsCache.getStats();

      expect(stats).toBeNull();
      await noStatsCache.close();
    });
  });

  describe('Namespace', () => {
    it('should isolate keys by namespace', async () => {
      const cache1 = new MemoryCache({ namespace: 'ns1' });
      const cache2 = new MemoryCache({ namespace: 'ns2' });

      await cache1.set('key1', 'value1');
      await cache2.set('key1', 'value2');

      expect(await cache1.get('key1')).toBe('value1');
      expect(await cache2.get('key1')).toBe('value2');

      await cache1.close();
      await cache2.close();
    });
  });

  describe('Complex Data Types', () => {
    it('should store and retrieve objects', async () => {
      const obj = { name: 'test', value: 123, nested: { prop: 'value' } };

      await cache.set('obj', obj);
      const retrieved = await cache.get<typeof obj>('obj');

      expect(retrieved).toEqual(obj);
    });

    it('should store and retrieve arrays', async () => {
      const arr = [1, 2, 3, 'four', { five: 5 }];

      await cache.set('arr', arr);
      const retrieved = await cache.get<typeof arr>('arr');

      expect(retrieved).toEqual(arr);
    });
  });
});
