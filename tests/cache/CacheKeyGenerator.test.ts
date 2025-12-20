/**
 * Tests for CacheKeyGenerator
 */

import { CacheKeyGenerator } from '../../src/cache/CacheInterface';

describe('CacheKeyGenerator', () => {
  describe('contentAnalysis', () => {
    it('should generate consistent keys for same content', () => {
      const content = '<h1>Test</h1><p>Content</p>';

      const key1 = CacheKeyGenerator.contentAnalysis(content);
      const key2 = CacheKeyGenerator.contentAnalysis(content);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^seo:content:/);
    });

    it('should generate different keys for different content', () => {
      const content1 = '<h1>Test 1</h1>';
      const content2 = '<h1>Test 2</h1>';

      const key1 = CacheKeyGenerator.contentAnalysis(content1);
      const key2 = CacheKeyGenerator.contentAnalysis(content2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('aiGeneration', () => {
    it('should generate consistent keys for same prompt and model', () => {
      const prompt = 'Generate SEO title';
      const model = 'gpt-4.1';
      const provider = 'openai';

      const key1 = CacheKeyGenerator.aiGeneration(prompt, model, provider);
      const key2 = CacheKeyGenerator.aiGeneration(prompt, model, provider);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^seo:ai:openai:gpt-4.1:/);
    });

    it('should generate different keys for different prompts', () => {
      const key1 = CacheKeyGenerator.aiGeneration('prompt1', 'model', 'provider');
      const key2 = CacheKeyGenerator.aiGeneration('prompt2', 'model', 'provider');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different models', () => {
      const key1 = CacheKeyGenerator.aiGeneration('prompt', 'model1', 'provider');
      const key2 = CacheKeyGenerator.aiGeneration('prompt', 'model2', 'provider');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different providers', () => {
      const key1 = CacheKeyGenerator.aiGeneration('prompt', 'model', 'provider1');
      const key2 = CacheKeyGenerator.aiGeneration('prompt', 'model', 'provider2');

      expect(key1).not.toBe(key2);
    });
  });

  describe('htmlParsing', () => {
    it('should generate consistent keys for same HTML', () => {
      const html = '<div><p>Test</p></div>';

      const key1 = CacheKeyGenerator.htmlParsing(html);
      const key2 = CacheKeyGenerator.htmlParsing(html);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^seo:html:/);
    });

    it('should generate different keys for different HTML', () => {
      const key1 = CacheKeyGenerator.htmlParsing('<div>1</div>');
      const key2 = CacheKeyGenerator.htmlParsing('<div>2</div>');

      expect(key1).not.toBe(key2);
    });
  });

  describe('seoResult', () => {
    it('should generate consistent keys for same content and config', () => {
      const content = 'content';
      const config = JSON.stringify({ mode: 'fast' });

      const key1 = CacheKeyGenerator.seoResult(content, config);
      const key2 = CacheKeyGenerator.seoResult(content, config);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^seo:result:/);
    });

    it('should generate different keys for different content', () => {
      const config = JSON.stringify({ mode: 'fast' });

      const key1 = CacheKeyGenerator.seoResult('content1', config);
      const key2 = CacheKeyGenerator.seoResult('content2', config);

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different config', () => {
      const content = 'content';

      const key1 = CacheKeyGenerator.seoResult(content, JSON.stringify({ mode: 'fast' }));
      const key2 = CacheKeyGenerator.seoResult(content, JSON.stringify({ mode: 'comprehensive' }));

      expect(key1).not.toBe(key2);
    });
  });

  describe('Hash Consistency', () => {
    it('should handle very long content efficiently', () => {
      const longContent = 'x'.repeat(10000);

      const start = Date.now();
      const key = CacheKeyGenerator.contentAnalysis(longContent);
      const duration = Date.now() - start;

      expect(key).toBeDefined();
      expect(duration).toBeLessThan(10); // Should be very fast
    });

    it('should handle special characters', () => {
      const specialContent = '<div>Test 测试 🎉 \n\t\r</div>';

      const key1 = CacheKeyGenerator.contentAnalysis(specialContent);
      const key2 = CacheKeyGenerator.contentAnalysis(specialContent);

      expect(key1).toBe(key2);
    });

    it('should handle empty strings', () => {
      const key = CacheKeyGenerator.contentAnalysis('');

      expect(key).toBeDefined();
      expect(key).toMatch(/^seo:content:/);
    });
  });
});
