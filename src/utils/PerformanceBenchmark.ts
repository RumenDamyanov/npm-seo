/**
 * Performance benchmarking utilities for @rumenx/seo
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // operations per second
}

export interface ComparisonResult {
  baseline: BenchmarkResult;
  optimized: BenchmarkResult;
  improvement: {
    percentage: number;
    factor: number;
    description: string;
  };
}

/**
 * Get high-resolution time in milliseconds
 */
function getHighResTime(): number {
  // Try to use high-resolution timer if available
  if (typeof Date.now === 'function') {
    return Date.now();
  }
  return new Date().getTime();
}

/**
 * Benchmark a function with multiple iterations
 */
export async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 10
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // Warm-up run
  await fn();

  // Actual benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = getHighResTime();
    await fn();
    const end = getHighResTime();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const throughput = 1000 / averageTime; // operations per second

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    throughput,
  };
}

/**
 * Compare two functions and return performance comparison
 */
export async function compare(
  baselineFn: () => void | Promise<void>,
  optimizedFn: () => void | Promise<void>,
  iterations: number = 10
): Promise<ComparisonResult> {
  const baseline = await benchmark('Baseline', baselineFn, iterations);
  const optimized = await benchmark('Optimized', optimizedFn, iterations);

  const factor = baseline.averageTime / optimized.averageTime;
  const percentage = ((baseline.averageTime - optimized.averageTime) / baseline.averageTime) * 100;

  let description: string;
  if (percentage > 50) {
    description = 'Significant improvement';
  } else if (percentage > 20) {
    description = 'Good improvement';
  } else if (percentage > 5) {
    description = 'Minor improvement';
  } else if (percentage > -5) {
    description = 'Similar performance';
  } else if (percentage > -20) {
    description = 'Minor regression';
  } else {
    description = 'Significant regression';
  }

  return {
    baseline,
    optimized,
    improvement: {
      percentage,
      factor,
      description,
    },
  };
}

/**
 * Memory usage tracker (simplified for browser compatibility)
 */
export class MemoryTracker {
  private baseline: number;

  constructor() {
    this.baseline = this.getCurrentMemoryUsage();
  }

  private getCurrentMemoryUsage(): number {
    // Simple baseline tracking without global dependencies
    // Returns 0 as we can't reliably measure memory across all environments
    return 0;
  }

  getMemoryDelta(): number {
    return this.getCurrentMemoryUsage() - this.baseline;
  }

  getMemoryUsage(): {
    current: number;
    baseline: number;
    delta: number;
    deltaFormatted: string;
  } {
    const current = this.getCurrentMemoryUsage();
    const delta = current - this.baseline;

    return {
      current,
      baseline: this.baseline,
      delta,
      deltaFormatted: this.formatBytes(delta),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(1);
    const sign = bytes < 0 ? '-' : '+';

    return `${sign}${size} ${sizes[i]}`;
  }
}

/**
 * Throughput tester for measuring operations per second
 */
export async function measureThroughput(
  fn: () => void | Promise<void>,
  durationMs: number = 1000
): Promise<{
  operations: number;
  duration: number;
  throughput: number;
  averageTime: number;
}> {
  let operations = 0;
  const startTime = getHighResTime();
  const endTime = startTime + durationMs;

  while (getHighResTime() < endTime) {
    await fn();
    operations++;
  }

  const actualDuration = getHighResTime() - startTime;
  const throughput = (operations / actualDuration) * 1000; // operations per second
  const averageTime = actualDuration / operations;

  return {
    operations,
    duration: actualDuration,
    throughput,
    averageTime,
  };
}

/**
 * Performance profiler for detailed analysis
 */
export class PerformanceProfiler {
  private marks: Map<string, number> = new Map();
  private measures: Array<{
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
  }> = [];

  mark(name: string): void {
    this.marks.set(name, getHighResTime());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      throw new Error(`Start mark '${startMark}' not found`);
    }

    const endTime = endMark ? this.marks.get(endMark) : getHighResTime();
    if (endMark && !endTime) {
      throw new Error(`End mark '${endMark}' not found`);
    }

    const duration = (endTime ?? getHighResTime()) - startTime;

    this.measures.push({
      name,
      startTime,
      endTime: endTime ?? getHighResTime(),
      duration,
    });

    return duration;
  }

  getMeasures(): Array<{
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
  }> {
    return [...this.measures];
  }

  clear(): void {
    this.marks.clear();
    this.measures.length = 0;
  }

  getReport(): string {
    let report = 'Performance Profile Report:\n';
    report += '================================\n';

    this.measures.forEach(measure => {
      report += `${measure.name}: ${measure.duration.toFixed(2)}ms\n`;
    });

    if (this.measures.length > 0) {
      const totalTime = this.measures.reduce((sum, m) => sum + m.duration, 0);
      report += `\nTotal measured time: ${totalTime.toFixed(2)}ms\n`;
    }

    return report;
  }
}

/**
 * Stress tester for load testing
 */
export async function stressTest(
  fn: () => void | Promise<void>,
  options: {
    concurrent: number;
    iterations: number;
    timeout?: number;
  }
): Promise<{
  successful: number;
  failed: number;
  totalTime: number;
  averageTime: number;
  errors: Error[];
}> {
  const { concurrent, iterations } = options;
  const errors: Error[] = [];
  let successful = 0;
  let failed = 0;

  const startTime = getHighResTime();

  // Create batches of concurrent operations
  const batches = Math.ceil(iterations / concurrent);

  for (let batch = 0; batch < batches; batch++) {
    const batchPromises: Promise<void>[] = [];
    const batchSize = Math.min(concurrent, iterations - batch * concurrent);

    for (let i = 0; i < batchSize; i++) {
      const promise = Promise.resolve(fn())
        .then(() => {
          successful++;
        })
        .catch((error: unknown) => {
          failed++;
          if (error instanceof Error) {
            errors.push(error);
          } else {
            errors.push(new Error(String(error)));
          }
        });

      batchPromises.push(promise);
    }

    await Promise.all(batchPromises);
  }

  const totalTime = getHighResTime() - startTime;
  const averageTime = totalTime / iterations;

  return {
    successful,
    failed,
    totalTime,
    averageTime,
    errors,
  };
}

/**
 * Format benchmark results for display
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  return `
Benchmark: ${result.name}
Iterations: ${result.iterations}
Total time: ${result.totalTime.toFixed(2)}ms
Average time: ${result.averageTime.toFixed(2)}ms
Min time: ${result.minTime.toFixed(2)}ms
Max time: ${result.maxTime.toFixed(2)}ms
Throughput: ${result.throughput.toFixed(2)} ops/sec
  `.trim();
}

/**
 * Format comparison results for display
 */
export function formatComparisonResult(result: ComparisonResult): string {
  const { baseline, optimized, improvement } = result;

  return `
Performance Comparison
======================
Baseline: ${baseline.averageTime.toFixed(2)}ms avg (${baseline.throughput.toFixed(2)} ops/sec)
Optimized: ${optimized.averageTime.toFixed(2)}ms avg (${optimized.throughput.toFixed(2)} ops/sec)

Improvement: ${improvement.percentage.toFixed(1)}% (${improvement.factor.toFixed(2)}x)
Assessment: ${improvement.description}
  `.trim();
}
