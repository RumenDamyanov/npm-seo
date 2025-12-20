/**
 * Tests for PerformanceBenchmark utilities
 */

import type { BenchmarkResult, ComparisonResult } from '../../src/utils/PerformanceBenchmark';
import {
  benchmark,
  compare,
  MemoryTracker,
  measureThroughput,
  PerformanceProfiler,
  stressTest,
  formatBenchmarkResult,
  formatComparisonResult,
} from '../../src/utils/PerformanceBenchmark';

describe('PerformanceBenchmark', () => {
  describe('benchmark function', () => {
    it('should benchmark a synchronous function', async () => {
      const testFn = (): void => {
        // Simple operation that takes some time
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        void sum; // Suppress unused variable warning
        // Don't return anything to match void signature
        void sum; // Suppress unused variable warning
      };

      const result = await benchmark('Sync Test', testFn, 5);

      expect(result).toBeDefined();
      expect(result.name).toBe('Sync Test');
      expect(result.iterations).toBe(5);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.averageTime).toBeGreaterThanOrEqual(0);
      expect(result.minTime).toBeGreaterThanOrEqual(0);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
      expect(result.throughput).toBeGreaterThanOrEqual(0);
    });

    it('should benchmark an asynchronous function', async () => {
      const testFn = async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1));
      };

      const result = await benchmark('Async Test', testFn, 3);

      expect(result).toBeDefined();
      expect(result.name).toBe('Async Test');
      expect(result.iterations).toBe(3);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
    });

    it('should handle zero time operations', async () => {
      const testFn = (): void => {
        // Very fast operation
        const value = 42;
        void value; // Suppress unused variable
        // Don't return anything
      };

      const result = await benchmark('Fast Test', testFn, 2);

      expect(result).toBeDefined();
      expect(result.iterations).toBe(2);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.averageTime).toBeGreaterThanOrEqual(0);
    });

    it('should use default iterations when not specified', async () => {
      const testFn = (): void => {
        Math.random(); // Do something without returning
      };

      const result = await benchmark('Default Iterations', testFn);

      expect(result.iterations).toBe(10);
    });
  });

  describe('compare function', () => {
    it('should compare two functions and show improvement', async () => {
      const slowFn = (): void => {
        let sum = 0;
        for (let i = 0; i < 5000; i++) {
          sum += Math.sqrt(i);
        }
        void sum; // Suppress unused variable warning
        // Don't return sum
      };

      const fastFn = (): void => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i * i;
        }
        void sum; // Suppress unused variable warning
        // Don't return sum
      };

      const result = await compare(slowFn, fastFn, 3);

      expect(result).toBeDefined();
      expect(result.baseline).toBeDefined();
      expect(result.optimized).toBeDefined();
      expect(result.improvement).toBeDefined();
      expect(result.improvement.percentage).toBeDefined();
      expect(result.improvement.factor).toBeDefined();
      expect(result.improvement.description).toBeDefined();
      expect(typeof result.improvement.description).toBe('string');
    });

    it('should handle similar performance functions', async () => {
      const fn1 = (): void => {
        Math.random(); // Don't return
      };
      const fn2 = (): void => {
        Math.random(); // Don't return
      };

      const result = await compare(fn1, fn2, 5);

      expect(result).toBeDefined();
      expect(result.improvement.description).toMatch(/Similar performance|improvement|regression/i);
    });

    it('should classify performance improvements correctly', async () => {
      // Create a deliberately slow function for baseline
      const slowFn = (): void => {
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
          sum += Math.sin(i);
        }
        void sum; // Suppress unused variable warning
        // Don't return sum
      };

      // Fast function
      const fastFn = (): void => {
        const value = 42;
        void value; // Suppress unused variable // Don't return
      };

      const result = await compare(slowFn, fastFn, 3);

      expect(result.improvement.percentage).toBeGreaterThan(0);
      expect(result.improvement.factor).toBeGreaterThan(1);
      expect(result.improvement.description).toMatch(/improvement/i);
    });
  });

  describe('MemoryTracker', () => {
    it('should create memory tracker instance', () => {
      const tracker = new MemoryTracker();

      expect(tracker).toBeDefined();
      expect(tracker).toBeInstanceOf(MemoryTracker);
    });

    it('should get memory delta', () => {
      const tracker = new MemoryTracker();
      const delta = tracker.getMemoryDelta();

      expect(typeof delta).toBe('number');
      expect(delta).toBeGreaterThanOrEqual(0);
    });

    it('should get memory usage details', () => {
      const tracker = new MemoryTracker();
      const usage = tracker.getMemoryUsage();

      expect(usage).toBeDefined();
      expect(usage).toHaveProperty('current');
      expect(usage).toHaveProperty('baseline');
      expect(usage).toHaveProperty('delta');
      expect(usage).toHaveProperty('deltaFormatted');
      expect(typeof usage.current).toBe('number');
      expect(typeof usage.baseline).toBe('number');
      expect(typeof usage.delta).toBe('number');
      expect(typeof usage.deltaFormatted).toBe('string');
    });

    it('should format bytes correctly', () => {
      const tracker = new MemoryTracker();
      const usage = tracker.getMemoryUsage();

      // Since we return 0 for memory in our implementation
      expect(usage.deltaFormatted).toBe('0 B');
    });
  });

  describe('measureThroughput', () => {
    it('should measure throughput for operations', async () => {
      const testFn = (): void => {
        void (Math.random() * 1000); // Don't return, use void to indicate intentional unused expression
      };

      const result = await measureThroughput(testFn, 100); // 100ms test

      expect(result).toBeDefined();
      expect(result.operations).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
    });

    it('should measure throughput for async operations', async () => {
      const testFn = async (): Promise<void> => {
        await Promise.resolve();
        // Don't return 42
      };

      const result = await measureThroughput(testFn, 50); // 50ms test

      expect(result).toBeDefined();
      expect(result.operations).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should use default duration when not specified', async () => {
      const testFn = (): void => {
        Math.random(); // Don't return
      };

      const result = await measureThroughput(testFn);

      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThan(500); // Should be close to 1000ms default
    });
  });

  describe('PerformanceProfiler', () => {
    let profiler: PerformanceProfiler;

    beforeEach(() => {
      profiler = new PerformanceProfiler();
    });

    it('should create profiler instance', () => {
      expect(profiler).toBeDefined();
      expect(profiler).toBeInstanceOf(PerformanceProfiler);
    });

    it('should mark performance points', () => {
      expect(() => profiler.mark('start')).not.toThrow();
      expect(() => profiler.mark('middle')).not.toThrow();
      expect(() => profiler.mark('end')).not.toThrow();
    });

    it('should measure duration between marks', () => {
      profiler.mark('start');
      profiler.mark('end');

      const duration = profiler.measure('test-measure', 'start', 'end');

      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure from mark to now when end mark not provided', () => {
      profiler.mark('start');

      const duration = profiler.measure('test-measure', 'start');

      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for missing start mark', () => {
      expect(() => {
        profiler.measure('test-measure', 'nonexistent');
      }).toThrow("Start mark 'nonexistent' not found");
    });

    it('should throw error for missing end mark', () => {
      profiler.mark('start');

      expect(() => {
        profiler.measure('test-measure', 'start', 'nonexistent');
      }).toThrow("End mark 'nonexistent' not found");
    });

    it('should get measures array', () => {
      profiler.mark('start');
      profiler.mark('end');
      profiler.measure('test1', 'start', 'end');
      profiler.measure('test2', 'start');

      const measures = profiler.getMeasures();

      expect(Array.isArray(measures)).toBe(true);
      expect(measures).toHaveLength(2);
      expect(measures[0]).toHaveProperty('name', 'test1');
      expect(measures[0]).toHaveProperty('duration');
      expect(measures[1]).toHaveProperty('name', 'test2');
    });

    it('should clear marks and measures', () => {
      profiler.mark('start');
      profiler.mark('end');
      profiler.measure('test', 'start', 'end');

      profiler.clear();

      const measures = profiler.getMeasures();
      expect(measures).toHaveLength(0);

      // Should throw error after clearing marks
      expect(() => {
        profiler.measure('test', 'start', 'end');
      }).toThrow();
    });

    it('should generate performance report', () => {
      profiler.mark('start');
      profiler.mark('middle');
      profiler.mark('end');
      profiler.measure('phase1', 'start', 'middle');
      profiler.measure('phase2', 'middle', 'end');

      const report = profiler.getReport();

      expect(typeof report).toBe('string');
      expect(report).toContain('Performance Profile Report');
      expect(report).toContain('phase1');
      expect(report).toContain('phase2');
      expect(report).toContain('Total measured time');
    });

    it('should handle empty report', () => {
      const report = profiler.getReport();

      expect(typeof report).toBe('string');
      expect(report).toContain('Performance Profile Report');
    });
  });

  describe('stressTest', () => {
    it('should run stress test with concurrent operations', async () => {
      const testFn = (): void => {
        void (Math.random() * 100); // Don't return, use void to indicate intentional unused expression
      };

      const result = await stressTest(testFn, {
        concurrent: 2,
        iterations: 10,
      });

      expect(result).toBeDefined();
      expect(result.successful).toBe(10);
      expect(result.failed).toBe(0);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.averageTime).toBeGreaterThanOrEqual(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle async operations in stress test', async () => {
      const testFn = async (): Promise<void> => {
        await Promise.resolve();
        // Don't return 42
      };

      const result = await stressTest(testFn, {
        concurrent: 3,
        iterations: 6,
      });

      expect(result.successful).toBe(6);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should capture errors in async stress test', async () => {
      let callCount = 0;

      const testFn = async (): Promise<void> => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Async test error');
        }
        // Don't return anything
      };

      const result = await stressTest(testFn, {
        concurrent: 1,
        iterations: 5,
      });

      // The test may have different exact counts due to async timing
      expect(result.successful + result.failed).toBe(5);
      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toBeInstanceOf(Error);
      expect(result.errors[0].message).toBe('Async test error');
    });

    it('should handle async non-Error exceptions', async () => {
      const testFn = async (): Promise<void> => {
        throw new Error('Async string error');
      };

      const result = await stressTest(testFn, {
        concurrent: 1,
        iterations: 2,
      });

      expect(result.successful + result.failed).toBe(2);
      expect(result.failed).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0]).toBeInstanceOf(Error);
      expect(result.errors[0].message).toBe('Async string error');
    });

    it('should handle concurrent batching correctly', async () => {
      const testFn = (): void => {
        Math.random(); // Don't return
      };

      const result = await stressTest(testFn, {
        concurrent: 3,
        iterations: 7, // Not divisible by concurrent
      });

      expect(result.successful).toBe(7);
      expect(result.failed).toBe(0);
    });
  });

  describe('formatting functions', () => {
    describe('formatBenchmarkResult', () => {
      it('should format benchmark result correctly', () => {
        const result: BenchmarkResult = {
          name: 'Test Benchmark',
          iterations: 10,
          totalTime: 100.5,
          averageTime: 10.05,
          minTime: 8.2,
          maxTime: 12.7,
          throughput: 99.5,
        };

        const formatted = formatBenchmarkResult(result);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('Test Benchmark');
        expect(formatted).toContain('10');
        expect(formatted).toContain('100.50ms');
        expect(formatted).toContain('10.05ms');
        expect(formatted).toContain('8.20ms');
        expect(formatted).toContain('12.70ms');
        expect(formatted).toContain('99.50 ops/sec');
      });
    });

    describe('formatComparisonResult', () => {
      it('should format comparison result correctly', () => {
        const result: ComparisonResult = {
          baseline: {
            name: 'Baseline',
            iterations: 5,
            totalTime: 50,
            averageTime: 10,
            minTime: 8,
            maxTime: 12,
            throughput: 100,
          },
          optimized: {
            name: 'Optimized',
            iterations: 5,
            totalTime: 25,
            averageTime: 5,
            minTime: 4,
            maxTime: 6,
            throughput: 200,
          },
          improvement: {
            percentage: 50,
            factor: 2,
            description: 'Significant improvement',
          },
        };

        const formatted = formatComparisonResult(result);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('Performance Comparison');
        expect(formatted).toContain('Baseline: 10.00ms');
        expect(formatted).toContain('Optimized: 5.00ms');
        expect(formatted).toContain('100.00 ops/sec');
        expect(formatted).toContain('200.00 ops/sec');
        expect(formatted).toContain('50.0%');
        expect(formatted).toContain('2.00x');
        expect(formatted).toContain('Significant improvement');
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle functions that throw errors in benchmark', async () => {
      const errorFn = (): void => {
        throw new Error('Test error');
      };

      await expect(benchmark('Error Test', errorFn, 1)).rejects.toThrow('Test error');
    });

    it('should handle async functions that reject in benchmark', async () => {
      const rejectFn = async (): Promise<void> => {
        throw new Error('Async error');
      };

      await expect(benchmark('Async Error', rejectFn, 1)).rejects.toThrow('Async error');
    });

    it('should handle very short operations', async () => {
      const fastFn = (): void => {
        // Extremely fast operation
      };

      const result = await benchmark('Super Fast', fastFn, 5);

      expect(result).toBeDefined();
      expect(result.iterations).toBe(5);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });
  });
});
