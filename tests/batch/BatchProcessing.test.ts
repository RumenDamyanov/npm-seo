/**
 * Tests for Batch Processing
 */

import { SeoManager } from '../../src/core/SeoManager';
import type { ContentAnalysis } from '../../src/types/ContentTypes';

describe('Batch Processing', () => {
  let seoManager: SeoManager;

  beforeEach(() => {
    seoManager = new SeoManager({
      baseUrl: 'https://example.com',
      mode: 'comprehensive',
    });
  });

  describe('analyzeBatch', () => {
    it('should analyze multiple documents', async () => {
      const documents = [
        {
          id: 'doc1',
          content: '<h1>Document 1</h1><p>Content for document 1</p>',
          metadata: { url: 'https://example.com/doc1' },
        },
        {
          id: 'doc2',
          content: '<h1>Document 2</h1><p>Content for document 2</p>',
          metadata: { url: 'https://example.com/doc2' },
        },
        {
          id: 'doc3',
          content: '<h1>Document 3</h1><p>Content for document 3</p>',
          metadata: { url: 'https://example.com/doc3' },
        },
      ];

      const results = await seoManager.analyzeBatch(documents);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('doc1');
      expect(results[1].id).toBe('doc2');
      expect(results[2].id).toBe('doc3');

      results.forEach(result => {
        expect(result.result).toBeDefined();
        expect(result.result.analysis).toBeDefined();
        expect(result.result.score).toBeDefined();
      });
    });

    it('should use fast mode when specified', async () => {
      const documents = [
        { id: 'doc1', content: '<h1>Test</h1><p>Content</p>' },
        { id: 'doc2', content: '<h1>Test</h1><p>Content</p>' },
      ];

      const results = await seoManager.analyzeBatch(documents, { fast: true });

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.result.analysis.meta.mode).toBe('fast');
      });
    });

    it('should handle concurrency', async () => {
      const documents = Array.from({ length: 10 }, (_, i) => ({
        id: `doc${i}`,
        content: `<h1>Document ${i}</h1><p>Content ${i}</p>`,
      }));

      const startTime = Date.now();
      const results = await seoManager.analyzeBatch(documents, {
        concurrency: 3,
      });
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      // With concurrency, should be faster than sequential
      expect(duration).toBeLessThan(5000);
    });

    it('should call progress callback', async () => {
      const documents = Array.from({ length: 5 }, (_, i) => ({
        id: `doc${i}`,
        content: `<h1>Document ${i}</h1>`,
      }));

      const progressCalls: Array<{ completed: number; total: number }> = [];

      await seoManager.analyzeBatch(documents, {
        onProgress: (completed, total) => {
          progressCalls.push({ completed, total });
        },
      });

      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[progressCalls.length - 1]).toEqual({
        completed: 5,
        total: 5,
      });
    });

    it('should handle errors gracefully', async () => {
      const documents = [
        { id: 'doc1', content: '<h1>Valid</h1>' },
        { id: 'doc2', content: '' }, // Empty content might cause issues
        { id: 'doc3', content: '<h1>Valid</h1>' },
      ];

      const results = await seoManager.analyzeBatch(documents);

      expect(results).toHaveLength(3);

      // Check that valid documents succeeded
      expect(results[0].error).toBeUndefined();
      expect(results[2].error).toBeUndefined();

      // All should have results (even if error)
      results.forEach(result => {
        expect(result.result).toBeDefined();
      });
    });

    it('should handle empty document list', async () => {
      const results = await seoManager.analyzeBatch([]);

      expect(results).toHaveLength(0);
    });

    it('should process documents with different metadata', async () => {
      const documents = [
        {
          id: 'doc1',
          content: '<h1>Test</h1>',
          metadata: { title: 'Custom Title 1', author: 'Author 1' },
        },
        {
          id: 'doc2',
          content: '<h1>Test</h1>',
          metadata: { title: 'Custom Title 2', author: 'Author 2' },
        },
      ];

      const results = await seoManager.analyzeBatch(documents);

      expect(results).toHaveLength(2);
      expect(results[0].result.meta.config).toBeDefined();
      expect(results[1].result.meta.config).toBeDefined();
    });
  });

  describe('generateBatch', () => {
    it('should generate SEO data for multiple documents', async () => {
      // Create mock AI provider
      const mockAiProvider = {
        name: 'mock',
        generate: jest.fn(async () => ({
          content: 'Generated title\nGenerated description\nGenerated keyword',
          model: 'mock',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        })),
        isAvailable: () => true,
        getModelName: () => 'mock',
        getVersion: () => '1.0.0',
      };

      const seoManagerWithAi = new SeoManager(
        { baseUrl: 'https://example.com', mode: 'comprehensive' },
        mockAiProvider as any
      );

      const mockAnalysis: ContentAnalysis = {
        rawContent: '<h1>Test</h1>',
        textContent: 'Test content',
        language: 'en',
        wordCount: 100,
        characterCount: 500,
        sentenceCount: 5,
        paragraphCount: 2,
        readingTime: 1,
        keywords: ['test', 'content'],
        keywordDensity: { test: 0.02 },
        frequentWords: [{ word: 'test', count: 2, percentage: 0.02 }],
        structure: {
          headings: [],
          images: [],
          links: [],
          sections: [],
        },
        seoMetrics: {
          h1Tags: ['Test'],
          openGraphTags: {},
          twitterCardTags: {},
          structuredData: [],
        },
        meta: {
          analyzedAt: new Date(),
          processingTime: 10,
          version: '1.0.0',
          mode: 'comprehensive',
        },
      };

      const documents = [
        { id: 'doc1', analysis: mockAnalysis },
        { id: 'doc2', analysis: mockAnalysis },
      ];

      const results = await seoManagerWithAi.generateBatch(documents, {
        types: ['title', 'description'],
      });

      expect(results.size).toBe(2);
      expect(results.get('doc1')).toBeDefined();
      expect(results.get('doc2')).toBeDefined();

      const doc1Data = results.get('doc1')!;
      expect(doc1Data.title).toBeDefined();
      expect(doc1Data.description).toBeDefined();
    });

    it('should handle concurrency in batch generation', async () => {
      const mockAiProvider = {
        name: 'mock',
        generate: jest.fn(async () => ({
          content: 'Generated content',
          model: 'mock',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        })),
        isAvailable: () => true,
        getModelName: () => 'mock',
        getVersion: () => '1.0.0',
      };

      const seoManagerWithAi = new SeoManager(
        { baseUrl: 'https://example.com', mode: 'comprehensive' },
        mockAiProvider as any
      );

      const mockAnalysis: ContentAnalysis = {
        rawContent: '<h1>Test</h1>',
        textContent: 'Test',
        language: 'en',
        wordCount: 1,
        characterCount: 4,
        sentenceCount: 1,
        paragraphCount: 1,
        readingTime: 1,
        keywords: [],
        keywordDensity: {},
        frequentWords: [],
        structure: { headings: [], images: [], links: [], sections: [] },
        seoMetrics: {
          h1Tags: [],
          openGraphTags: {},
          twitterCardTags: {},
          structuredData: [],
        },
        meta: {
          analyzedAt: new Date(),
          processingTime: 0,
          version: '1.0.0',
          mode: 'comprehensive',
        },
      };

      const documents = Array.from({ length: 6 }, (_, i) => ({
        id: `doc${i}`,
        analysis: mockAnalysis,
      }));

      const results = await seoManagerWithAi.generateBatch(documents, {
        types: ['title'],
        concurrency: 2,
      });

      expect(results.size).toBe(6);
    });

    it('should call progress callback during generation', async () => {
      const mockAiProvider = {
        name: 'mock',
        generate: jest.fn(async () => ({
          content: 'Generated',
          model: 'mock',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        })),
        isAvailable: () => true,
        getModelName: () => 'mock',
        getVersion: () => '1.0.0',
      };

      const seoManagerWithAi = new SeoManager(
        { baseUrl: 'https://example.com', mode: 'comprehensive' },
        mockAiProvider as any
      );

      const mockAnalysis: ContentAnalysis = {
        rawContent: '',
        textContent: '',
        language: 'en',
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTime: 0,
        keywords: [],
        keywordDensity: {},
        frequentWords: [],
        structure: { headings: [], images: [], links: [], sections: [] },
        seoMetrics: {
          h1Tags: [],
          openGraphTags: {},
          twitterCardTags: {},
          structuredData: [],
        },
        meta: {
          analyzedAt: new Date(),
          processingTime: 0,
          version: '1.0.0',
          mode: 'comprehensive',
        },
      };

      const documents = Array.from({ length: 3 }, (_, i) => ({
        id: `doc${i}`,
        analysis: mockAnalysis,
      }));

      const progressCalls: Array<{ completed: number; total: number }> = [];

      await seoManagerWithAi.generateBatch(documents, {
        types: ['title'],
        onProgress: (completed, total) => {
          progressCalls.push({ completed, total });
        },
      });

      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[progressCalls.length - 1].completed).toBe(3);
    });

    it('should throw error when AI provider not configured', async () => {
      const mockAnalysis: ContentAnalysis = {
        rawContent: '',
        textContent: '',
        language: 'en',
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTime: 0,
        keywords: [],
        keywordDensity: {},
        frequentWords: [],
        structure: { headings: [], images: [], links: [], sections: [] },
        seoMetrics: {
          h1Tags: [],
          openGraphTags: {},
          twitterCardTags: {},
          structuredData: [],
        },
        meta: {
          analyzedAt: new Date(),
          processingTime: 0,
          version: '1.0.0',
          mode: 'comprehensive',
        },
      };

      await expect(
        seoManager.generateBatch([{ id: 'doc1', analysis: mockAnalysis }])
      ).rejects.toThrow('AI provider required for batch generation');
    });
  });
});
