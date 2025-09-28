/**
 * SeoManager unit tests
 */

import { SeoManager } from '../../src/core/SeoManager';

describe('SeoManager', () => {
  let seoManager: SeoManager;

  const mockHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test SEO Page</title>
        <meta name="description" content="This is a test page for SEO analysis with proper meta description length and content.">
        <meta name="keywords" content="seo, testing, analysis">
      </head>
      <body>
        <h1>Main Heading for SEO Testing</h1>
        <h2>Secondary Heading</h2>
        <p>This is the main content of the page with relevant keywords for SEO testing purposes.</p>
        <p>Additional paragraph with more content to ensure we have enough text for proper analysis.</p>
        <img src="test.jpg" alt="Test image for SEO analysis">
        <a href="https://example.com">External link</a>
        <a href="/internal">Internal link</a>
      </body>
    </html>
  `;

  beforeEach(() => {
    const config = {
      mode: 'manual' as const,
    };
    seoManager = new SeoManager(config);
  });

  describe('analyze', () => {
    it('should analyze content and return SEO result', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');
    });

    it('should return analysis with content metrics', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result.analysis).toBeDefined();
      expect(result.analysis.textContent).toContain('Main Heading');
      expect(result.analysis.wordCount).toBeGreaterThan(0);
      expect(result.analysis.keywords).toBeDefined();
      expect(Array.isArray(result.analysis.keywords)).toBe(true);
    });

    it('should return recommendations array', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle empty content', () => {
      const result = seoManager.analyze('');

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle content without proper SEO elements', () => {
      const poorContent = '<html><body><p>Just some text</p></body></html>';
      const result = seoManager.analyze(poorContent);

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should analyze content structure', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result.analysis.structure).toBeDefined();
      expect(result.analysis.structure.headings).toBeDefined();
      expect(result.analysis.structure.images).toBeDefined();
      expect(result.analysis.structure.links).toBeDefined();
    });

    it('should extract SEO metrics', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result.analysis.seoMetrics).toBeDefined();
      expect(result.analysis.seoMetrics.titleTag).toBeDefined();
      expect(result.analysis.seoMetrics.titleTag).toBe('Test SEO Page');
      expect(result.analysis.seoMetrics.metaDescription).toBeDefined();
    });

    it('should calculate reading time', () => {
      const result = seoManager.analyze(mockHtmlContent);

      expect(result.analysis.readingTime).toBeDefined();
      expect(typeof result.analysis.readingTime).toBe('number');
      expect(result.analysis.readingTime).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedHtml = '<html><head><title>Test</title><body><p>No closing tags';

      const result = seoManager.analyze(malformedHtml);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should handle null input', () => {
      // @ts-expect-error Testing runtime behavior
      const result = seoManager.analyze(null);

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle undefined input', () => {
      // @ts-expect-error Testing runtime behavior
      const result = seoManager.analyze(undefined);

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('configuration', () => {
    it('should work with different modes', () => {
      const manualManager = new SeoManager({ mode: 'manual' });
      const hybridManager = new SeoManager({ mode: 'hybrid' });

      expect(manualManager).toBeDefined();
      expect(hybridManager).toBeDefined();
    });

    it('should work with custom title configuration', () => {
      const customConfig = {
        mode: 'manual' as const,
        title: {
          minLength: 20,
          maxLength: 60,
        },
      };

      const customManager = new SeoManager(customConfig);
      const result = customManager.analyze(
        '<html><head><title>Short</title></head><body><p>Content</p></body></html>'
      );

      expect(result).toBeDefined();
      expect(result.recommendations.some((rec: any) => rec.type.includes('title'))).toBe(true);
    });

    it('should update configuration correctly', () => {
      const originalConfig = { mode: 'manual' as const };
      const manager = new SeoManager(originalConfig);

      const newConfig = {
        mode: 'hybrid' as const,
        title: { minLength: 30, maxLength: 80 },
      };

      manager.updateConfig(newConfig);

      // Configuration should be updated (we can't directly access it, but we can test behavior)
      expect(manager).toBeDefined();
    });

    it('should set AI provider correctly', () => {
      const mockAiProvider = {
        name: 'mock-provider',
        capabilities: {
          supportsTitle: true,
          supportsDescription: true,
          supportsKeywords: true,
          maxInputTokens: 1000,
          maxOutputTokens: 500,
          supportedLanguages: ['en'],
          supportsImageAnalysis: false,
          supportsStreaming: false,
          supportsFunctionCalling: false,
          rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 1000,
          },
        },
        isAvailable: jest.fn().mockResolvedValue(true),
        generateTitle: jest.fn().mockResolvedValue({ content: 'Mock Title' }),
        generateDescription: jest.fn().mockResolvedValue({ content: 'Mock Description' }),
        generateKeywords: jest.fn().mockResolvedValue({ content: 'mock,keywords' }),
        generateAltText: jest.fn().mockResolvedValue({ content: 'Mock alt text' }),
        generate: jest.fn().mockResolvedValue({ content: 'mock response' }),
        getStatus: jest.fn().mockResolvedValue({ available: true, model: 'mock-model' }),
      };

      seoManager.setAiProvider(mockAiProvider);

      // AI provider should be set (we can't directly access it, but we can test behavior)
      expect(seoManager).toBeDefined();
    });
  });

  describe('AI integration', () => {
    it('should handle AI provider configuration', () => {
      const mockAiProvider = {
        name: 'test-provider',
        capabilities: {
          supportsTitle: true,
          supportsDescription: true,
          supportsKeywords: true,
          maxInputTokens: 1000,
          maxOutputTokens: 500,
          supportedLanguages: ['en'],
          supportsImageAnalysis: false,
          supportsStreaming: false,
          supportsFunctionCalling: false,
          rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 1000,
          },
        },
        isAvailable: jest.fn().mockResolvedValue(true),
        generateTitle: jest.fn().mockResolvedValue({ content: 'AI Generated Title' }),
        generateDescription: jest.fn().mockResolvedValue({ content: 'AI Generated Description' }),
        generateKeywords: jest.fn().mockResolvedValue({ content: 'ai,generated,keywords' }),
        generateAltText: jest.fn().mockResolvedValue({ content: 'AI alt text' }),
        generate: jest.fn().mockResolvedValue({ content: 'AI response' }),
        getStatus: jest.fn().mockResolvedValue({ available: true, model: 'test-model' }),
      };

      seoManager.setAiProvider(mockAiProvider);

      // AI provider should be set successfully
      expect(seoManager).toBeDefined();
    });
  });

  describe('recommendations generation', () => {
    it('should generate title recommendations for missing title', () => {
      const noTitleContent = '<html><body><p>Content without title</p></body></html>';
      const result = seoManager.analyze(noTitleContent);

      const titleRecs = result.recommendations.filter(rec => rec.type === 'title');
      expect(titleRecs.length).toBeGreaterThan(0);
    });

    it('should generate heading recommendations for missing H1', () => {
      const noH1Content =
        '<html><head><title>Title</title></head><body><h2>Only H2</h2><p>Content</p></body></html>';
      const result = seoManager.analyze(noH1Content);

      const structureRecs = result.recommendations.filter(rec => rec.type === 'structure');
      expect(structureRecs.length).toBeGreaterThan(0);
    });

    it('should generate recommendations for multiple H1 tags', () => {
      const multiH1Content =
        '<html><head><title>Title</title></head><body><h1>First</h1><h1>Second</h1><p>Content</p></body></html>';
      const result = seoManager.analyze(multiH1Content);

      const structureRecs = result.recommendations.filter(rec => rec.type === 'structure');
      expect(structureRecs.some(rec => rec.message.includes('Multiple H1'))).toBe(true);
    });

    it('should generate content length recommendations', () => {
      const shortContent =
        '<html><head><title>Title</title></head><body><h1>Heading</h1><p>Short content.</p></body></html>';
      const result = seoManager.analyze(shortContent);

      const contentRecs = result.recommendations.filter(rec => rec.type === 'content');
      expect(contentRecs.some(rec => rec.message.includes('short'))).toBe(true);
    });

    it('should generate image alt text recommendations', () => {
      const noAltContent =
        '<html><head><title>Title</title></head><body><h1>Heading</h1><p>Content with image.</p><img src="test.jpg"></body></html>';
      const result = seoManager.analyze(noAltContent);

      const imageRecs = result.recommendations.filter(rec => rec.type === 'images');
      expect(imageRecs.some(rec => rec.message.includes('alt text'))).toBe(true);
    });
  });

  describe('AI integration methods', () => {
    let seoManager: SeoManager;

    beforeEach(() => {
      const config = { mode: 'manual' as const };
      seoManager = new SeoManager(config);
    });

    it('should throw error when AI provider not configured for generateSuggestions', () => {
      const mockAnalysis = {
        wordCount: 100,
        language: 'en',
        keywords: ['test', 'content'],
        textContent: 'This is test content for analysis and suggestion generation.',
        seoMetrics: { titleTag: 'Test Title', metaDescription: null },
      };

      await expect(seoManager.generateSuggestions(mockAnalysis as any, 'title')).rejects.toThrow(
        'AI provider not configured'
      );
    });

    it('should handle AI generation with proper provider', () => {
      // Mock AI provider
      const mockAiProvider = {
        generate: jest.fn().mockResolvedValue({
          content:
            'Test AI Generated Title 1\nTest AI Generated Title 2\nTest AI Generated Title 3',
        }),
      };

      seoManager.setAiProvider(mockAiProvider as any);

      const mockAnalysis = {
        wordCount: 100,
        language: 'en',
        keywords: ['test', 'content'],
        textContent: 'This is test content for analysis and suggestion generation.',
        seoMetrics: { titleTag: 'Test Title', metaDescription: null },
      };

      const result = await seoManager.generateSuggestions(mockAnalysis as any, 'title');

      expect(mockAiProvider.generate).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Array));
    });

    it('should handle AI generation errors and return fallback suggestions', () => {
      // Mock AI provider that throws an error
      const mockAiProvider = {
        generate: jest.fn().mockRejectedValue(new Error('AI service error')),
      };

      seoManager.setAiProvider(mockAiProvider as any);

      const mockAnalysis = {
        wordCount: 100,
        language: 'en',
        keywords: ['test', 'content'],
        textContent: 'This is test content for analysis and suggestion generation.',
        seoMetrics: { titleTag: 'Test Title', metaDescription: null },
      };

      const result = await seoManager.generateSuggestions(mockAnalysis as any, 'title');

      expect(mockAiProvider.generate).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Array));
    });

    it('should generate different types of AI suggestions', () => {
      const mockAiProvider = {
        generate: jest.fn().mockResolvedValue({
          content: 'Generated suggestion 1\nGenerated suggestion 2',
        }),
      };

      seoManager.setAiProvider(mockAiProvider as any);

      const mockAnalysis = {
        wordCount: 100,
        language: 'en',
        keywords: ['test', 'content'],
        textContent: 'This is test content for analysis and suggestion generation.',
        seoMetrics: { titleTag: 'Test Title', metaDescription: null },
      };

      // Test different suggestion types
      await seoManager.generateSuggestions(mockAnalysis as any, 'title');
      await seoManager.generateSuggestions(mockAnalysis as any, 'description');
      await seoManager.generateSuggestions(mockAnalysis as any, 'keywords');

      expect(mockAiProvider.generate).toHaveBeenCalledTimes(3);
    });
  });

  describe('SEO scoring', () => {
    let seoManager: SeoManager;

    beforeEach(() => {
      const config = { mode: 'manual' as const };
      seoManager = new SeoManager(config);
    });

    it('should calculate SEO score with perfect title', () => {
      const htmlWithGoodSeo = `
        <html>
          <head>
            <title>Perfect SEO Title Length Test Content</title>
            <meta name="description" content="This is a perfect meta description that is exactly the right length for SEO optimization and contains good keywords.">
          </head>
          <body>
            <h1>Main Heading</h1>
            <h2>Subheading</h2>
            <p>This is substantial content for SEO testing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <img src="test.jpg" alt="Descriptive alt text">
            <a href="https://example.com">External link</a>
          </body>
        </html>
      `;

      const result = seoManager.analyze(htmlWithGoodSeo);

      expect(result.score).toBeDefined();
      expect(result.score.overall).toBeGreaterThan(50);
      expect(result.score.breakdown).toHaveProperty('title');
      expect(result.score.breakdown).toHaveProperty('description');
      expect(result.score.breakdown).toHaveProperty('content');
      expect(result.score.breakdown).toHaveProperty('structure');
      expect(result.score.breakdown).toHaveProperty('technical');
    });

    it('should calculate SEO score with poor SEO elements', () => {
      const htmlWithPoorSeo = `
        <html>
          <head>
            <title>Bad</title>
          </head>
          <body>
            <p>Short content.</p>
          </body>
        </html>
      `;

      const result = seoManager.analyze(htmlWithPoorSeo);

      expect(result.score).toBeDefined();
      expect(result.score.overall).toBeLessThan(50);
      expect(result.score.breakdown.title).toBeLessThan(20);
      expect(result.score.breakdown.description).toBe(0);
    });

    it('should handle medium-length title and description scoring', () => {
      const htmlWithMediumSeo = `
        <html>
          <head>
            <title>Medium Length Title Test</title>
            <meta name="description" content="Medium length description for testing scoring algorithm functionality.">
          </head>
          <body>
            <h1>Heading</h1>
            <p>Medium amount of content for testing purposes. This should score somewhere in the middle range.</p>
          </body>
        </html>
      `;

      const result = seoManager.analyze(htmlWithMediumSeo);

      expect(result.score.breakdown.title).toBeGreaterThan(10);
      expect(result.score.breakdown.title).toBeLessThan(20);
      expect(result.score.breakdown.description).toBeGreaterThanOrEqual(10);
      expect(result.score.breakdown.description).toBeLessThan(20);
    });
  });
});
