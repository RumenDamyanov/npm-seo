/**
 * Basic performance tests for @rumenx/seo optimization features
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { OptimizedContentAnalyzer } from '../src/core/OptimizedContentAnalyzer';
import { benchmark, formatBenchmarkResult } from '../src/utils/PerformanceBenchmark';

describe('Performance Optimization Tests', () => {
  let optimizedAnalyzer: OptimizedContentAnalyzer;

  const testHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Performance Test Page</title>
      <meta name="description" content="This is a test page for performance optimization">
      <meta name="keywords" content="performance, optimization, testing, seo">
    </head>
    <body>
      <h1>Main Heading</h1>
      <h2>Secondary Heading</h2>
      <p>This is a paragraph with some content for testing performance.</p>
      <p>Another paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
      <img src="test.jpg" alt="Test image" />
      <a href="https://example.com" title="External link">Link text</a>
    </body>
    </html>
  `;

  beforeEach(() => {
    optimizedAnalyzer = new OptimizedContentAnalyzer();
  });

  describe('Basic Analysis Performance', () => {
    it('should benchmark optimized content analysis', async () => {
      const iterations = 50;

      const result = await benchmark(
        'Optimized Content Analysis',
        () => {
          optimizedAnalyzer.analyze(testHtml);
        },
        iterations
      );

      console.log('\n=== Optimized Analysis Performance ===');
      console.log(formatBenchmarkResult(result));

      // Should complete analysis in reasonable time
      expect(result.averageTime).toBeLessThan(100); // Less than 100ms per analysis
      expect(result.throughput).toBeGreaterThan(5); // At least 5 ops/sec
    });

    it('should test caching behavior', () => {
      const testHtml1 = '<html><head><title>Test 1</title></head><body><h1>Test</h1></body></html>';
      const testHtml2 = '<html><head><title>Test 2</title></head><body><h2>Test</h2></body></html>';

      // Parse different content multiple times
      optimizedAnalyzer.analyze(testHtml1);
      optimizedAnalyzer.analyze(testHtml2);
      optimizedAnalyzer.analyze(testHtml1); // Should hit cache
      optimizedAnalyzer.analyze(testHtml2); // Should hit cache

      const stats = optimizedAnalyzer.getPerformanceStats();

      console.log('\n=== Cache Performance ===');
      console.log(
        `Analysis Cache Size: ${stats.analysisCache.size}/${stats.analysisCache.maxSize}`
      );
      console.log(
        `Language Cache Size: ${stats.languageCache.size}/${stats.languageCache.maxSize}`
      );
      console.log(
        `HTML Parser Cache Size: ${stats.htmlParserCache.parseCache.size}/${stats.htmlParserCache.parseCache.maxSize}`
      );

      // Caches should have entries
      expect(stats.analysisCache.size).toBeGreaterThan(0);
      expect(stats.analysisCache.size).toBeLessThanOrEqual(stats.analysisCache.maxSize);
    });

    it('should handle multiple unique documents', () => {
      const uniqueHtmls = Array.from(
        { length: 20 },
        (_, i) =>
          `<html><head><title>Test ${i}</title></head><body><h1>Content ${i}</h1></body></html>`
      );

      // Analyze multiple unique documents
      uniqueHtmls.forEach(html => optimizedAnalyzer.analyze(html));

      const stats = optimizedAnalyzer.getPerformanceStats();

      console.log('\n=== Multiple Documents ===');
      console.log(
        `Analysis Cache Usage: ${stats.analysisCache.size}/${stats.analysisCache.maxSize}`
      );

      // Should have cached multiple documents
      expect(stats.analysisCache.size).toBeGreaterThan(1);
    });
  });

  describe('Performance Regression Tests', () => {
    it('should maintain reasonable performance thresholds', async () => {
      const simpleHtml =
        '<html><head><title>Simple</title></head><body><h1>Test</h1></body></html>';
      const complexHtml = testHtml;

      // Test simple HTML
      const simpleResult = await benchmark(
        'Simple HTML',
        () => {
          optimizedAnalyzer.analyze(simpleHtml);
        },
        30
      );

      // Test complex HTML
      const complexResult = await benchmark(
        'Complex HTML',
        () => {
          optimizedAnalyzer.analyze(complexHtml);
        },
        20
      );

      console.log('\n=== Performance Regression Tests ===');
      console.log(`Simple HTML: ${simpleResult.averageTime.toFixed(2)}ms`);
      console.log(`Complex HTML: ${complexResult.averageTime.toFixed(2)}ms`);

      // Performance thresholds
      expect(simpleResult.averageTime).toBeLessThan(50); // 50ms for simple HTML
      expect(complexResult.averageTime).toBeLessThan(100); // 100ms for complex HTML
    });
  });
});
