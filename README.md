# @rumenx/seo

[![CI](https://github.com/RumenDamyanov/npm-seo/actions/workflows/ci.yml/badge.svg)](https://github.com/RumenDamyanov/npm-seo/actions)
[![CodeQL](https://github.com/RumenDamyanov/npm-seo/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/RumenDamyanov/npm-seo/actions/workflows/github-code-scanning/codeql)
[![Dependabot](https://github.com/RumenDamyanov/npm-seo/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/RumenDamyanov/npm-seo/actions/workflows/dependabot/dependabot-updates)
[![codecov](https://codecov.io/gh/RumenDamyanov/npm-seo/branch/master/graph/badge.svg)](https://codecov.io/gh/RumenDamyanov/npm-seo)
[![npm version](https://img.shields.io/npm/v/@rumenx/seo.svg)](https://www.npmjs.com/package/@rumenx/seo)

A comprehensive TypeScript library for SEO analysis, content optimization, and meta tag generation with AI-powered suggestions.

## ✨ Features

- 🔍 **Content Analysis**: Deep analysis of HTML content, structure, and SEO metrics
- 🎯 **SEO Recommendations**: Automated suggestions for title, description, headings, and more
- 🤖 **AI Integration**: Support for OpenAI GPT-4.1, Claude 4, Gemini 1.5 Pro, xAI Grok, and Ollama for content generation
- 📊 **SEO Scoring**: Comprehensive scoring system with detailed breakdowns
- ⚡ **Fast Mode**: Optimized analysis for performance-critical applications
- 🏗️ **Framework Ready**: Built-in adapters for Express, Next.js, and Fastify
- 📝 **TypeScript**: Full type safety with extensive type definitions
- 🌐 **Dual Module**: Both ESM and CommonJS support
- 🚀 **Zero Dependencies**: Core functionality works without external dependencies
- 🔒 **Security First**: Secure HTML parsing and content analysis
- 📦 **Batch Processing**: Analyze multiple documents efficiently
- 💾 **Caching System**: Memory and Redis cache support for performance
- ⏱️ **Rate Limiting**: Protect API limits with built-in rate limiters
- 🔄 **Provider Fallback**: Automatic failover between AI providers
- 🏷️ **Schema.org**: Generate structured data for rich snippets
- 🔗 **Fluent Interface**: Method chaining for elegant code

## 📦 Installation

```bash
npm install @rumenx/seo
```

### Optional AI Dependencies

For AI-powered content generation, install your preferred provider:

```bash
# OpenAI (GPT-4.1, GPT-4.1-turbo)
npm install openai

# Anthropic (Claude 4)
npm install @anthropic-ai/sdk

# Google AI (Gemini 1.5 Pro, Gemini 2.0)
npm install @google/generative-ai

# xAI (Grok-2, Grok-2-mini)
npm install @xai-sdk/client  # Coming soon

# Ollama (Local models: Llama 3.3, Qwen 2.5, etc.)
npm install ollama

# Redis (for distributed caching)
npm install redis
```

### Requirements

- **Node.js**: 18.x or higher
- **TypeScript**: 4.7 or higher (for TypeScript projects)

## 🚀 Quick Start

### Template Rendering Workflow (Recommended)

The primary use case is to optimize content **before** rendering your templates:

```typescript
import { ContentAnalyzer } from '@rumenx/seo';

// Step 1: Analyze your content data
const analyzer = new ContentAnalyzer();
const postData = {
  title: 'Complete Guide to SEO',
  content: '<p>Your blog post content...</p>',
  tags: ['SEO', 'Web Development'],
};

// Step 2: Generate optimized SEO data for templates
function generateSeoForPost(postData) {
  const mockContent = `
    <article>
      <h1>${postData.title}</h1>
      <div>${postData.content}</div>
    </article>
  `;

  const analysis = analyzer.analyze(mockContent);

  return {
    title: optimizeTitle(postData.title, analysis.keywords),
    description: generateDescription(analysis.textContent),
    keywords: [...postData.tags, ...analysis.keywords.slice(0, 5)],
  };
}

// Step 3: Use optimized data in your template
const seoData = generateSeoForPost(postData);

const html = `
<head>
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}">
  <meta name="keywords" content="${seoData.keywords.join(', ')}">
</head>
<body>
  <h1>${postData.title}</h1>
  <div>${postData.content}</div>
</body>
`;
```

### Content Analysis (Advanced)

For analyzing existing HTML content:

```typescript
import { ContentAnalyzer } from '@rumenx/seo';

const analyzer = new ContentAnalyzer();
const analysis = analyzer.analyze(existingHtml);

console.log('📊 Analysis Results:');
console.log(`Word count: ${analysis.wordCount}`);
console.log(`Reading time: ${analysis.readingTime} minutes`);
console.log(`Keywords:`, analysis.keywords.slice(0, 5));
console.log(`SEO Score: ${analysis.seoMetrics.score}/100`);
```

### SEO Manager with Recommendations

```typescript
import { SeoManager } from '@rumenx/seo';

const seoManager = new SeoManager({
  baseUrl: 'https://example.com',
  mode: 'comprehensive',
});

const result = await seoManager.analyze(htmlContent, {
  url: 'https://example.com/seo-guide',
});

// View recommendations
result.recommendations.forEach(rec => {
  console.log(`${rec.severity.toUpperCase()}: ${rec.message}`);
  if (rec.suggestion) {
    console.log(`💡 Suggestion: ${rec.suggestion}`);
  }
});
```

### AI-Powered Content Generation

```typescript
import { SeoManager } from '@rumenx/seo';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const seoManager = new SeoManager(config, openai);

// Generate optimized titles for your content
const titleSuggestions = await seoManager.generateSuggestions(analysis, 'title', {
  maxTokens: 100,
  temperature: 0.7,
});

console.log('🎯 Title Suggestions:');
titleSuggestions.forEach((title, i) => {
  console.log(`${i + 1}. ${title}`);
});
```

## 💡 How It Works

This library is designed for **template-first SEO optimization**:

1. **Analyze** your content data (from CMS, database, etc.)
2. **Optimize** SEO elements before rendering
3. **Render** templates with pre-optimized meta tags

This approach is more efficient than analyzing already-rendered HTML and allows you to optimize content for search engines before users see it.

## 🚀 Advanced Features

### Batch Processing

Process multiple documents efficiently:

```typescript
import { SeoManager } from '@rumenx/seo';

const seoManager = new SeoManager(config);

// Analyze multiple documents in batch
const documents = [
  { id: 'post-1', content: htmlContent1, metadata: { title: 'Post 1' } },
  { id: 'post-2', content: htmlContent2, metadata: { title: 'Post 2' } },
  { id: 'post-3', content: htmlContent3, metadata: { title: 'Post 3' } },
];

const results = await seoManager.analyzeBatch(documents, {
  fast: true, // Use fast mode for better performance
  concurrency: 5, // Process 5 documents at a time
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`);
  },
});

results.forEach(({ id, result, error }) => {
  if (error) {
    console.error(`Failed to analyze ${id}:`, error);
  } else {
    console.log(`${id}: Score ${result.score.overall}/100`);
  }
});

// Generate SEO data for multiple documents with AI
const analyses = results.map(r => ({ id: r.id, analysis: r.result.analysis }));

const seoData = await seoManager.generateBatch(analyses, {
  types: ['title', 'description', 'keywords'],
  concurrency: 3,
  onProgress: (completed, total) => {
    console.log(`Generated: ${completed}/${total}`);
  },
});

seoData.forEach((data, id) => {
  console.log(`\nSEO for ${id}:`);
  console.log(`Titles:`, data.title);
  console.log(`Descriptions:`, data.description);
  console.log(`Keywords:`, data.keywords);
});
```

### Caching System

Improve performance with built-in caching:

```typescript
import { SeoManager, MemoryCache, RedisCache } from '@rumenx/seo';

// Memory cache (for single instance)
const memoryCache = new MemoryCache({
  ttl: 300, // 5 minutes
  maxSize: 1000, // Maximum 1000 entries
  enableStats: true,
});

// Redis cache (for distributed systems)
const redisCache = new RedisCache({
  url: 'redis://localhost:6379',
  ttl: 600, // 10 minutes
  namespace: 'seo',
  enableStats: true,
});

// Use cache with SeoManager
const config = {
  baseUrl: 'https://example.com',
  cache: memoryCache, // or redisCache
};

// Cache statistics
const stats = await memoryCache.getStats();
console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
console.log(`Cache size: ${stats.size}`);

// Manual cache operations
await memoryCache.set('key', { data: 'value' }, 300);
const cached = await memoryCache.get('key');
await memoryCache.delete('key');

// Batch cache operations
const entries = new Map([
  ['key1', { data: 'value1' }],
  ['key2', { data: 'value2' }],
]);
await memoryCache.setMany(entries, 300);
const cachedData = await memoryCache.getMany(['key1', 'key2']);
```

### Rate Limiting

Protect your AI provider API limits:

```typescript
import { RateLimiter, RateLimiterManager } from '@rumenx/seo';

// Create rate limiter for OpenAI
const openaiLimiter = new RateLimiter({
  maxRequests: 60, // 60 requests
  windowMs: 60000, // per minute
  maxConcurrent: 5, // max 5 concurrent requests
  enableQueue: true, // queue excess requests
  maxQueueSize: 100, // max 100 queued requests
});

// Use with AI provider
async function callAI() {
  await openaiLimiter.acquire(); // Wait for rate limit slot
  try {
    const response = await aiProvider.generate(prompt);
    return response;
  } finally {
    openaiLimiter.release(); // Release slot
  }
}

// Check rate limiter status
console.log(`Available tokens: ${openaiLimiter.getAvailableTokens()}`);
const stats = openaiLimiter.getStats();
console.log(`Accepted: ${stats.acceptedRequests}`);
console.log(`Rejected: ${stats.rejectedRequests}`);
console.log(`Queued: ${stats.queuedRequests}`);

// Rate limiter manager for multiple providers
const manager = new RateLimiterManager();

manager.setLimiter(
  'openai',
  new RateLimiter({
    maxRequests: 60,
    windowMs: 60000,
  })
);

manager.setLimiter(
  'anthropic',
  new RateLimiter({
    maxRequests: 50,
    windowMs: 60000,
  })
);

const limiter = manager.getLimiter('openai');
await limiter.acquire();
```

### Multi-Provider Fallback

Automatic fallback between AI providers:

```typescript
import { AiProviderChain, OpenAiProvider, AnthropicProvider, GoogleAiProvider } from '@rumenx/seo';

// Create AI providers
const providers = [
  new OpenAiProvider({ apiKey: process.env.OPENAI_API_KEY }),
  new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY }),
  new GoogleAiProvider({ apiKey: process.env.GOOGLE_AI_API_KEY }),
];

// Create provider chain (tries each in order until success)
const providerChain = new AiProviderChain({
  providers,
  maxRetries: 2, // Retry each provider twice
  timeout: 30000, // 30 second timeout per provider
  onProviderFailed: (provider, error) => {
    console.warn(`Provider ${provider} failed:`, error.message);
  },
  onProviderSuccess: (provider, response) => {
    console.log(`Provider ${provider} succeeded`);
  },
});

// Generate with automatic fallback
try {
  const response = await providerChain.generate('Generate SEO title');
  console.log('Generated:', response.content);
} catch (error) {
  console.error('All providers failed:', error);
}

// Provider chain statistics
const chainStats = providerChain.getStats();
console.log(`Success rate: ${chainStats.successfulRequests}/${chainStats.totalRequests}`);
console.log(`Provider usage:`, Object.fromEntries(chainStats.providerUsage));
console.log(`Average response time: ${chainStats.averageResponseTime}ms`);

// Dynamic provider management
providerChain.addProvider(new XAiProvider({ apiKey: process.env.XAI_API_KEY }), 1); // Add at priority 1
providerChain.removeProvider('google-ai');
providerChain.setProviderPriority('anthropic', 0); // Make Anthropic first
```

### Schema.org Structured Data

Generate structured data for rich snippets:

```typescript
import { ArticleSchema, BreadcrumbListSchema, ProductSchema } from '@rumenx/seo';

// Article schema
const article = new ArticleSchema()
  .setHeadline('Complete Guide to SEO Optimization')
  .setDescription('Learn how to optimize your website for search engines')
  .setImage('https://example.com/article-image.jpg')
  .setDatePublished(new Date('2024-01-01'))
  .setDateModified(new Date())
  .setAuthor({
    '@type': 'Person',
    name: 'John Doe',
    url: 'https://example.com/authors/john-doe',
  })
  .setPublisher({
    '@type': 'Organization',
    name: 'Example Inc',
    logo: {
      '@type': 'ImageObject',
      url: 'https://example.com/logo.png',
    },
  });

// Breadcrumb schema
const breadcrumbs = new BreadcrumbListSchema()
  .addItem('Home', 'https://example.com', 1)
  .addItem('Blog', 'https://example.com/blog', 2)
  .addItem('SEO Guide', 'https://example.com/blog/seo-guide', 3);

// Product schema
const product = new ProductSchema()
  .setName('SEO Pro Tool')
  .setImage('https://example.com/product.jpg')
  .setDescription('Professional SEO analysis tool')
  .setSKU('SEO-PRO-001')
  .setBrand({ '@type': 'Brand', name: 'Example Inc' })
  .setOffers({
    '@type': 'Offer',
    price: '99.00',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://example.com/products/seo-pro',
  })
  .setAggregateRating({
    '@type': 'AggregateRating',
    ratingValue: 4.8,
    reviewCount: 125,
  });

// Generate JSON-LD
const articleJson = article.toJson();
const breadcrumbsJson = breadcrumbs.toJson();
const productJson = product.toJson();

// Use in HTML
const html = `
<script type="application/ld+json">
${JSON.stringify(articleJson, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumbsJson, null, 2)}
</script>
`;
```

### Fluent Interface

Chain methods for cleaner code:

```typescript
import { SeoManager } from '@rumenx/seo';

const seoManager = new SeoManager(config);

// Method chaining for configuration and analysis
const seoData = seoManager
  .setAiProvider(openaiProvider)
  .updateConfig({ mode: 'comprehensive' })
  .analyze(htmlContent, metadata)
  .generateAll();

console.log('Title:', seoData.title);
console.log('Description:', seoData.description);
console.log('Keywords:', seoData.keywords);
console.log('Score:', seoData.score.overall);
```

### Template Rendering Examples

See [examples/simple-template-rendering.ts](examples/simple-template-rendering.ts) for a complete workflow demonstration.

### Framework Integration Examples

```typescript
// Express.js
app.get('/posts/:slug', async (req, res) => {
  const postData = await getPostFromDatabase(req.params.slug);
  const seoData = generateSeoForPost(postData);
  const html = renderBlogPost(postData, seoData);
  res.send(html);
});

// Next.js
export async function getServerSideProps({ params }) {
  const postData = await getPostFromCMS(params.slug);
  const seoData = generateSeoForPost(postData);

  return { props: { postData, seoData } };
}
```

## Content Analysis Utilities

The library provides comprehensive content analysis utilities:

```typescript
import { extractTextContent, extractHeadings, extractKeywords } from '@rumenx/seo';

const html = '<h1>Title</h1><p>Content...</p>';

// Extract text content
const text = extractTextContent(html);

// Extract headings
const headings = extractHeadings(html);

// Extract keywords
const keywords = extractKeywords(text);
```

## SEO Recommendations

Get automated SEO recommendations:

```typescript
const result = await seoManager.analyze(htmlContent);

result.recommendations.forEach(rec => {
  console.log(`${rec.severity}: ${rec.message}`);
  console.log(`Suggestion: ${rec.suggestion}`);
});
```

## AI-Powered Suggestions

Generate content suggestions with AI:

```typescript
// Configure with AI provider
const seoManager = new SeoManager(config, aiProvider);

// Generate title suggestions
const titles = await seoManager.generateSuggestions(analysis, 'title', {
  maxTokens: 100,
  temperature: 0.7,
});

// Generate meta description suggestions
const descriptions = await seoManager.generateSuggestions(analysis, 'description');
```

## API Reference

### Classes

- **`SeoManager`**: Main class for SEO analysis and content generation
- **`ContentAnalyzer`**: Standalone content analysis utilities

### Utilities

- **`extractTextContent(html)`**: Extract clean text from HTML
- **`extractHeadings(html)`**: Extract heading structure
- **`extractImages(html)`**: Analyze images and alt text
- **`extractKeywords(text)`**: Extract relevant keywords
- **`calculateReadingTime(text)`**: Calculate reading time

### Types

The library includes comprehensive TypeScript types for all features:

- `SeoConfig` - Configuration options
- `ContentAnalysis` - Analysis results
- `SeoRecommendation` - Recommendation structure
- `ImageAnalysis` - Image analysis data
- `SeoMetrics` - SEO-specific metrics

## Framework Integration

### Express.js

```typescript
import express from 'express';
import { SeoManager } from '@rumenx/seo';

const app = express();
const seoManager = new SeoManager(config);

app.get('/analyze', async (req, res) => {
  const result = await seoManager.analyze(req.body.html);
  res.json(result);
});
```

### Next.js

```typescript
import { SeoManager } from '@rumenx/seo';

export async function getServerSideProps({ req }) {
  const seoManager = new SeoManager(config);
  const analysis = await seoManager.analyze(pageContent);

  return {
    props: { seoData: analysis },
  };
}
```

## Configuration

```typescript
const config = {
  baseUrl: 'https://example.com',
  mode: 'comprehensive', // or 'fast'
  aiProvider: 'openai',
  validation: {
    strictMode: true,
    customRules: [],
  },
  cache: {
    enabled: true,
    ttl: 3600,
  },
};
```

## 📚 Documentation

- [**API Reference**](https://github.com/RumenDamyanov/npm-seo/blob/master/docs/api.md) - Complete API documentation
- [**Examples**](https://github.com/RumenDamyanov/npm-seo/tree/master/examples) - Working code examples
- [**Changelog**](https://github.com/RumenDamyanov/npm-seo/blob/master/CHANGELOG.md) - Version history and updates

## 🔗 Related Projects

Check out our other Node.js tools that work great with `@rumenx/seo`:

### JavaScript/TypeScript Libraries

- **[@rumenx/chatbot](https://github.com/RumenDamyanov/npm-chatbot)** - AI-powered chatbot integration for Node.js applications
- **[@rumenx/sitemap](https://github.com/RumenDamyanov/npm-sitemap)** - Dynamic sitemap generation and management
- **[@rumenx/feed](https://github.com/RumenDamyanov/npm-feed)** - RSS/Atom feed generator for content syndication

### Other Languages

- **[php-seo](https://github.com/RumenDamyanov/php-seo)** - SEO analysis and optimization library for PHP
- **[go-seo](https://github.com/RumenDamyanov/go-seo)** _(Planned)_ - SEO analysis and optimization library for Go

These tools complement each other to provide a complete content management and SEO solution for modern web applications.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

- 🐛 [Report Bugs](https://github.com/RumenDamyanov/npm-seo/issues/new?template=bug_report.yml)
- 💡 [Request Features](https://github.com/RumenDamyanov/npm-seo/issues/new?template=feature_request.yml)
- 📖 [Improve Docs](https://github.com/RumenDamyanov/npm-seo/issues/new?template=documentation.yml)
- ❓ [Ask Questions](https://github.com/RumenDamyanov/npm-seo/discussions)

## 🔒 Security

Security is important to us. Please review our [Security Policy](SECURITY.md) and report vulnerabilities responsibly.

## 💝 Support This Project

If you find this library helpful, consider supporting its development:

- ⭐ [Star the repository](https://github.com/RumenDamyanov/npm-seo)
- 💰 [Sponsor on GitHub](https://github.com/sponsors/RumenDamyanov)
- ☕ [Buy me a coffee](https://ko-fi.com/rumenx)
- 📢 Share with others

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

## 📞 Support & Community

- 📖 [Documentation](https://github.com/RumenDamyanov/npm-seo#readme)
- 🐛 [Issue Tracker](https://github.com/RumenDamyanov/npm-seo/issues)
- ✉️ [Email Support](mailto:contact@rumenx.com)

---

**Made with ❤️ by [Rumen Damyanov](https://github.com/RumenDamyanov)**
