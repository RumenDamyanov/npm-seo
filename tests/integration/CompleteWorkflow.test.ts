/**
 * Integration Tests for Complete Workflows
 */

import {
  SeoManager,
  ArticleSchema,
  BreadcrumbListSchema,
  ProductSchema,
  MemoryCache,
  OpenAiProvider,
} from '../../src';

describe('Complete SEO Workflow Integration', () => {
  describe('Blog Post Workflow', () => {
    it('should analyze and optimize blog post', () => {
      const seoManager = new SeoManager({
        baseUrl: 'https://example.com',
        mode: 'comprehensive',
      });

      const blogPost = `
        <article>
          <h1>Complete Guide to TypeScript SEO</h1>
          <p>Learn how to build SEO-optimized applications with TypeScript.</p>
          <h2>Introduction</h2>
          <p>TypeScript provides excellent type safety for SEO tools.</p>
          <h2>Key Features</h2>
          <p>Strong typing, IntelliSense, and compile-time checking.</p>
          <img src="/image.jpg" alt="TypeScript Logo">
        </article>
      `;

      const result = seoManager.analyze(blogPost).generateAll();

      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.score.overall).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should generate structured data for blog post', () => {
      const article = new ArticleSchema()
        .setHeadline('Complete Guide to TypeScript SEO')
        .setDescription('Learn how to build SEO-optimized applications')
        .setImage('https://example.com/image.jpg')
        .setDatePublished(new Date('2024-01-01'))
        .setAuthor({
          '@type': 'Person',
          name: 'John Doe',
        })
        .setPublisher({
          '@type': 'Organization',
          name: 'Example Inc',
          logo: {
            '@type': 'ImageObject',
            url: 'https://example.com/logo.png',
          },
        });

      const breadcrumbs = new BreadcrumbListSchema()
        .addItem('Home', 'https://example.com', 1)
        .addItem('Blog', 'https://example.com/blog', 2)
        .addItem('TypeScript SEO', 'https://example.com/blog/typescript-seo', 3);

      const articleJson = article.toJson();
      const breadcrumbsJson = breadcrumbs.toJson();

      expect(articleJson['@type']).toBe('Article');
      expect(articleJson.headline).toBe('Complete Guide to TypeScript SEO');
      expect(breadcrumbsJson.itemListElement).toHaveLength(3);
    });
  });

  describe('E-commerce Workflow', () => {
    it('should analyze and optimize product page', () => {
      const seoManager = new SeoManager({
        baseUrl: 'https://shop.example.com',
        mode: 'comprehensive',
      });

      const productPage = `
        <main>
          <h1>Premium Wireless Headphones</h1>
          <img src="/headphones.jpg" alt="Premium Wireless Headphones">
          <p>Experience crystal-clear audio with our premium wireless headphones.</p>
          <h2>Features</h2>
          <ul>
            <li>Active Noise Cancellation</li>
            <li>40-hour battery life</li>
            <li>Bluetooth 5.0</li>
          </ul>
          <h2>Specifications</h2>
          <p>Driver size: 40mm, Frequency response: 20Hz-20kHz</p>
        </main>
      `;

      const result = seoManager.analyze(productPage).generateAll();

      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.score.overall).toBeGreaterThan(0);
    });

    it('should generate product schema', () => {
      const product = new ProductSchema()
        .setName('Premium Wireless Headphones')
        .setImage('https://shop.example.com/headphones.jpg')
        .setDescription('Crystal-clear audio with active noise cancellation')
        .setSKU('HEADPHONES-001')
        .setBrand({
          '@type': 'Brand',
          name: 'AudioPro',
        })
        .setOffers({
          '@type': 'Offer',
          price: '299.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://shop.example.com/headphones',
        })
        .setAggregateRating({
          '@type': 'AggregateRating',
          ratingValue: 4.8,
          reviewCount: 342,
        });

      const json = product.toJson();

      expect(json['@type']).toBe('Product');
      expect(json.name).toBe('Premium Wireless Headphones');
      expect(json.offers.price).toBe('299.99');
      expect(json.aggregateRating.ratingValue).toBe(4.8);
    });
  });

  describe('Batch Processing Workflow', () => {
    it('should process multiple pages efficiently', async () => {
      const seoManager = new SeoManager({
        baseUrl: 'https://example.com',
        mode: 'fast', // Use fast mode for batch
      });

      const pages = [
        {
          id: 'home',
          content: '<h1>Welcome</h1><p>Homepage content</p>',
          metadata: { url: 'https://example.com' },
        },
        {
          id: 'about',
          content: '<h1>About Us</h1><p>About page content</p>',
          metadata: { url: 'https://example.com/about' },
        },
        {
          id: 'contact',
          content: '<h1>Contact</h1><p>Contact page content</p>',
          metadata: { url: 'https://example.com/contact' },
        },
      ];

      const results = await seoManager.analyzeBatch(pages, {
        fast: true,
        concurrency: 2,
      });

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.result.score.overall).toBeGreaterThan(0);
        expect(result.result.analysis.wordCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Caching Workflow', () => {
    it('should cache analysis results', async () => {
      const cache = new MemoryCache({
        ttl: 60,
        maxSize: 100,
        enableStats: true,
      });

      const seoManager = new SeoManager({
        baseUrl: 'https://example.com',
        mode: 'comprehensive',
      });

      const content = '<h1>Test Page</h1><p>Content for caching test</p>';

      // First analysis
      const result1 = seoManager.analyze(content).generateAll();

      // Cache the result
      await cache.set('test-page', result1);

      // Retrieve from cache
      const cached = await cache.get('test-page');

      expect(cached).toEqual(result1);

      const stats = await cache.getStats();
      expect(stats!.sets).toBe(1);
      expect(stats!.hits).toBe(1);

      await cache.close();
    });
  });

  describe('AI Provider Workflow', () => {
    it('should work with mock AI provider', async () => {
      const aiProvider = new OpenAiProvider({ mock: true });

      const seoManager = new SeoManager(
        {
          baseUrl: 'https://example.com',
          mode: 'comprehensive',
        },
        aiProvider
      );

      const content = '<h1>AI Test</h1><p>Content for AI generation</p>';

      const analysis = seoManager.analyze(content).getAnalysis();

      expect(analysis).toBeDefined();
      expect(analysis!.keywords).toBeDefined();

      // Generate suggestions with AI
      const suggestions = await seoManager.generateSuggestions(analysis!, 'title');

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Complete Site Audit Workflow', () => {
    it('should audit multiple pages and generate report', async () => {
      const seoManager = new SeoManager({
        baseUrl: 'https://example.com',
        mode: 'comprehensive',
      });

      const sitePages = [
        {
          id: 'home',
          content: `
            <h1>Welcome to Example</h1>
            <meta name="description" content="Example homepage">
            <p>Welcome to our website with great content.</p>
          `,
        },
        {
          id: 'blog',
          content: `
            <h1>Blog</h1>
            <p>Read our latest articles about technology.</p>
          `,
        },
        {
          id: 'products',
          content: `
            <h1>Our Products</h1>
            <p>Discover our amazing products.</p>
          `,
        },
      ];

      const results = await seoManager.analyzeBatch(sitePages);

      // Generate audit report
      const auditReport = {
        totalPages: results.length,
        averageScore: results.reduce((sum, r) => sum + r.result.score.overall, 0) / results.length,
        issues: results.flatMap(r => r.result.recommendations),
        pageScores: results.map(r => ({
          id: r.id,
          score: r.result.score.overall,
          issues: r.result.recommendations.length,
        })),
      };

      expect(auditReport.totalPages).toBe(3);
      expect(auditReport.averageScore).toBeGreaterThan(0);
      expect(auditReport.pageScores).toHaveLength(3);
    });
  });

  describe('Fluent Interface Workflow', () => {
    it('should chain multiple operations', () => {
      const seoManager = new SeoManager({
        baseUrl: 'https://example.com',
        mode: 'comprehensive',
      });

      const content = '<h1>Fluent Test</h1><p>Testing method chaining</p>';

      // Chain analyze and generate
      const result = seoManager.updateConfig({ mode: 'fast' }).analyze(content).generateAll();

      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(result.score).toBeDefined();
    });

    it('should chain schema building', () => {
      const article = new ArticleSchema()
        .setHeadline('Chained Article')
        .setDescription('Testing fluent interface')
        .setImage('https://example.com/image.jpg')
        .setDatePublished(new Date());

      const json = article.toJson();

      expect(json.headline).toBe('Chained Article');
      expect(json.description).toBe('Testing fluent interface');
      expect(json.image).toBe('https://example.com/image.jpg');
    });
  });
});
