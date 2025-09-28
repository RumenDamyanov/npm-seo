/**
 * HTML Parser utility tests
 */

import {
  extractTextContent,
  extractHeadings,
  extractImages,
  extractLinks,
  extractSeoMetrics,
  countParagraphs,
  extractKeywords,
  calculateKeywordDensity,
  getFrequentWords,
  countSentences,
  calculateReadingTime,
} from '../../src/utils/HtmlParser';

describe('HtmlParser Utils', () => {
  const mockHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="A comprehensive test page for HTML parsing utilities">
        <meta name="keywords" content="test, parsing, seo, html">
        <meta property="og:title" content="Test OG Title">
        <link rel="canonical" href="https://example.com/test">
      </head>
      <body>
        <h1>Main Test Heading</h1>
        <h2>Secondary Heading</h2>
        <h3>Third Level Heading</h3>
        <p>This is the first paragraph with test content for parsing utilities. It contains multiple sentences.</p>
        <p>Second paragraph with more test content. Additional text for testing purposes.</p>
        <img src="test1.jpg" alt="Test image 1" width="300" height="200">
        <img src="test2.png" alt="">
        <img src="test3.gif">
        <a href="https://external.com">External Link</a>
        <a href="/internal">Internal Link</a>
        <a href="mailto:test@example.com">Email Link</a>
        <script>console.log('should be removed');</script>
        <style>body { color: red; }</style>
      </body>
    </html>
  `;

  describe('extractTextContent', () => {
    it('should extract clean text content', () => {
      const text = extractTextContent(mockHtml);

      expect(text).toContain('Main Test Heading');
      expect(text).toContain('first paragraph');
      expect(text).not.toContain('console.log');
      expect(text).not.toContain('color: red');
    });

    it('should handle empty string', () => {
      expect(extractTextContent('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(extractTextContent(null as any)).toBe('');
      expect(extractTextContent(undefined as any)).toBe('');
    });
  });

  describe('extractHeadings', () => {
    it('should extract all heading levels', () => {
      const headings = extractHeadings(mockHtml);

      expect(headings).toHaveLength(3);
      expect(headings[0].level).toBe(1);
      expect(headings[0].text).toBe('Main Test Heading');
      expect(headings[1].level).toBe(2);
      expect(headings[2].level).toBe(3);
    });

    it('should handle empty content', () => {
      expect(extractHeadings('')).toEqual([]);
    });

    it('should handle null/undefined', () => {
      expect(extractHeadings(null as any)).toEqual([]);
      expect(extractHeadings(undefined as any)).toEqual([]);
    });
  });

  describe('extractImages', () => {
    it('should extract all images with analysis', () => {
      const images = extractImages(mockHtml);

      expect(images).toHaveLength(3);
      expect(images[0].url).toBe('test1.jpg');
      expect(images[0].currentAlt).toBe('Test image 1');
      expect(images[0].width).toBe(300);
      expect(images[0].height).toBe(200);
      expect(images[1].currentAlt).toBe('');
      expect(images[2].currentAlt).toBeUndefined();
    });

    it('should handle empty content', () => {
      expect(extractImages('')).toEqual([]);
    });

    it('should handle null/undefined', () => {
      expect(extractImages(null as any)).toEqual([]);
      expect(extractImages(undefined as any)).toEqual([]);
    });
  });

  describe('extractLinks', () => {
    it('should extract and categorize links', () => {
      const links = extractLinks(mockHtml);

      expect(links).toHaveLength(3);
      expect(links[0].isExternal).toBe(true);
      expect(links[0].url).toBe('https://external.com');
      expect(links[1].isExternal).toBe(false);
      expect(links[1].url).toBe('/internal');
      expect(links[2].url).toBe('mailto:test@example.com');
    });

    it('should handle empty content', () => {
      expect(extractLinks('')).toEqual([]);
    });

    it('should handle null/undefined', () => {
      expect(extractLinks(null as any)).toEqual([]);
      expect(extractLinks(undefined as any)).toEqual([]);
    });
  });

  describe('extractSeoMetrics', () => {
    it('should extract comprehensive SEO data', () => {
      const metrics = extractSeoMetrics(mockHtml);

      expect(metrics.titleTag).toBe('Test Page Title');
      expect(metrics.metaDescription).toBe('A comprehensive test page for HTML parsing utilities');
      expect(metrics.metaKeywords).toEqual(['test', 'parsing', 'seo', 'html']);
      expect(metrics.canonicalUrl).toBe('https://example.com/test');
      expect(metrics.h1Tags).toContain('Main Test Heading');
      expect(metrics.openGraphTags['og:title']).toBe('Test OG Title');
    });

    it('should handle empty content', () => {
      const metrics = extractSeoMetrics('');

      expect(metrics.titleTag).toBeUndefined();
      expect(metrics.metaDescription).toBeUndefined();
      expect(metrics.h1Tags).toEqual([]);
    });

    it('should handle null/undefined', () => {
      const nullMetrics = extractSeoMetrics(null as any);
      expect(nullMetrics.titleTag).toBeUndefined();

      const undefinedMetrics = extractSeoMetrics(undefined as any);
      expect(undefinedMetrics.titleTag).toBeUndefined();
    });
  });

  describe('countParagraphs', () => {
    it('should count paragraph elements', () => {
      expect(countParagraphs(mockHtml)).toBe(2);
    });

    it('should handle empty content', () => {
      expect(countParagraphs('')).toBe(0);
    });

    it('should handle null/undefined', () => {
      expect(countParagraphs(null as any)).toBe(0);
      expect(countParagraphs(undefined as any)).toBe(0);
    });
  });

  describe('text processing utilities', () => {
    const sampleText = 'This is a test text. It has multiple sentences! Does it work well?';

    it('should extract keywords', () => {
      const keywords = extractKeywords(sampleText);

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('test');
      expect(keywords).toContain('text');
    });

    it('should calculate keyword density', () => {
      const keywords = ['test', 'text', 'multiple'];
      const density = calculateKeywordDensity(sampleText, keywords);

      expect(typeof density).toBe('object');
      expect(density.test).toBeDefined();
      expect(density.test).toBeGreaterThan(0);
    });

    it('should get frequent words', () => {
      const words = getFrequentWords(sampleText);

      expect(Array.isArray(words)).toBe(true);
      expect(words.length).toBeGreaterThan(0);
      expect(words[0]).toHaveProperty('word');
      expect(words[0]).toHaveProperty('count');
      expect(words[0]).toHaveProperty('percentage');
    });

    it('should count sentences', () => {
      expect(countSentences(sampleText)).toBe(3);
    });

    it('should calculate reading time', () => {
      const time = calculateReadingTime(sampleText);

      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedHtml = '<html><head><title>Test</title><body><p>No closing tags';

      expect(() => extractTextContent(malformedHtml)).not.toThrow();
      expect(() => extractHeadings(malformedHtml)).not.toThrow();
      expect(() => extractImages(malformedHtml)).not.toThrow();
      expect(() => extractLinks(malformedHtml)).not.toThrow();
      expect(() => extractSeoMetrics(malformedHtml)).not.toThrow();
    });

    it('should handle empty and whitespace-only content', () => {
      const whitespaceHtml = '   \n\t   ';

      expect(extractTextContent(whitespaceHtml)).toBe('');
      expect(extractHeadings(whitespaceHtml)).toEqual([]);
      expect(extractImages(whitespaceHtml)).toEqual([]);
      expect(extractLinks(whitespaceHtml)).toEqual([]);
    });
  });
});
