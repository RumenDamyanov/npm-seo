/**
 * ContentAnalyzer unit tests
 */

import { ContentAnalyzer } from '../../src/core/ContentAnalyzer';

describe('ContentAnalyzer', () => {
  let analyzer: ContentAnalyzer;

  const mockHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test SEO Page</title>
        <meta name="description" content="This is a test page for SEO analysis with proper meta description.">
        <meta name="keywords" content="seo, testing, analysis">
      </head>
      <body>
        <h1>Main Heading</h1>
        <h2>Secondary Heading</h2>
        <p>This is the main content with keywords like seo and testing.</p>
        <img src="test.jpg" alt="Test image">
        <a href="https://example.com">External link</a>
      </body>
    </html>
  `;

  beforeEach(() => {
    analyzer = new ContentAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze HTML content and return analysis object', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('textContent');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('structure');
    });

    it('should extract text content properly', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.textContent).toBeDefined();
      expect(result.textContent).toContain('Main Heading');
      expect(result.textContent).toContain('Secondary Heading');
      expect(result.textContent).toContain('main content');
    });

    it('should extract keywords', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should detect headings structure', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.structure.headings).toBeDefined();
      expect(Array.isArray(result.structure.headings)).toBe(true);
      expect(result.structure.headings.length).toBeGreaterThan(0);
      expect(result.structure.headings[0].text).toBe('Main Heading');
    });

    it('should analyze images', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.structure.images).toBeDefined();
      expect(result.structure.images).toHaveLength(1);
      expect(result.structure.images[0]).toMatchObject({
        url: 'test.jpg',
        currentAlt: 'Test image',
      });
    });

    it('should analyze links', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.structure.links).toBeDefined();
      expect(result.structure.links.length).toBe(1);
      expect(result.structure.links[0]).toMatchObject({
        url: 'https://example.com',
        text: 'External link',
        isExternal: true,
      });
    });

    it('should extract SEO metrics', () => {
      const result = analyzer.analyze(mockHtmlContent);

      expect(result.seoMetrics).toBeDefined();
      expect(result.seoMetrics.titleTag).toBe('Test SEO Page');
      expect(result.seoMetrics.metaDescription).toContain('test page for SEO analysis');
      expect(result.seoMetrics.h1Tags).toContain('Main Heading');
    });

    it('should handle empty content gracefully', () => {
      const result = analyzer.analyze('');

      expect(result).toBeDefined();
      expect(result.textContent).toBeDefined();
      expect(result.wordCount).toBe(0);
    });

    it('should handle malformed HTML', () => {
      const malformedHtml = '<html><head><title>Test</title><body><p>No closing tags';
      const result = analyzer.analyze(malformedHtml);

      expect(result).toBeDefined();
      expect(result.textContent).toBeDefined();
      expect(result.seoMetrics.titleTag).toBe('Test');
    });

    it('should detect language from content', () => {
      const englishContent = `
        <html><body>
          <p>The quick brown fox jumps over the lazy dog. This is a test with many English words and phrases.</p>
          <p>We are testing the language detection feature with sufficient content to ensure accuracy.</p>
        </body></html>
      `;
      const result = analyzer.analyze(englishContent);
      expect(result.language).toBe('en');
    });

    it('should detect Spanish language', () => {
      const spanishContent = `
        <html><body>
          <p>El rápido zorro marrón salta sobre el perro perezoso. Esta es una prueba con muchas palabras en español.</p>
          <p>Estamos probando la detección de idioma con contenido suficiente para garantizar la precisión.</p>
        </body></html>
      `;
      const result = analyzer.analyze(spanishContent);
      expect(result.language).toBe('es');
    });

    it('should use provided metadata language when detection fails', () => {
      const shortContent = '<html><body><p>Hi</p></body></html>';
      const result = analyzer.analyze(shortContent, { language: 'fr' });
      expect(result.language).toBe('fr');
    });

    it('should extract content sections', () => {
      const sectionalContent = `
        <html><body>
          <header><p>This is the header section with some content</p></header>
          <main><p>This is the main content area with important information</p></main>
          <footer><p>This is the footer with additional details</p></footer>
        </body></html>
      `;
      const result = analyzer.analyze(sectionalContent);
      expect(result.structure.sections).toBeDefined();
      expect(result.structure.sections.length).toBeGreaterThan(0);
      const sectionTypes = result.structure.sections.map(s => s.type);
      expect(sectionTypes).toContain('header');
      expect(sectionTypes).toContain('main');
      expect(sectionTypes).toContain('footer');
    });
  });

  describe('analyzeFast', () => {
    it('should perform fast analysis with minimal processing', () => {
      const result = analyzer.analyzeFast(mockHtmlContent);

      expect(result).toBeDefined();
      expect(result.meta.mode).toBe('fast');
      expect(result.textContent).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.keywords).toBeDefined();
    });

    it('should skip detailed metrics in fast mode', () => {
      const result = analyzer.analyzeFast(mockHtmlContent);

      expect(result.sentenceCount).toBe(0);
      expect(result.paragraphCount).toBe(0);
      expect(result.structure.images).toEqual([]);
      expect(result.structure.links).toEqual([]);
      expect(result.structure.sections).toEqual([]);
    });

    it('should be faster than full analysis', () => {
      const startFull = Date.now();
      analyzer.analyze(mockHtmlContent);
      const fullTime = Date.now() - startFull;

      const startFast = Date.now();
      analyzer.analyzeFast(mockHtmlContent);
      const fastTime = Date.now() - startFast;

      // Fast mode should generally be faster or similar
      expect(fastTime).toBeLessThanOrEqual(fullTime + 5); // Allow 5ms margin
    });

    it('should use provided metadata language in fast mode', () => {
      const result = analyzer.analyzeFast(mockHtmlContent, { language: 'de' });
      expect(result.language).toBe('de');
    });

    it('should limit keywords in fast mode', () => {
      const result = analyzer.analyzeFast(mockHtmlContent);
      expect(result.keywords.length).toBeLessThanOrEqual(10);
    });
  });
});
