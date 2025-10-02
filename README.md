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
- 🤖 **AI Integration**: Support for OpenAI GPT-4.1, Claude 4, Gemini 1.5 Pro, and Ollama for content generation
- 📊 **SEO Scoring**: Comprehensive scoring system with detailed breakdowns
- ⚡ **Fast Mode**: Optimized analysis for performance-critical applications
- 🏗️ **Framework Ready**: Built-in adapters for Express, Next.js, and Fastify
- 📝 **TypeScript**: Full type safety with extensive type definitions
- 🌐 **Dual Module**: Both ESM and CommonJS support
- 🚀 **Zero Dependencies**: Core functionality works without external dependencies
- 🔒 **Security First**: Secure HTML parsing and content analysis

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

# Ollama (Local models: Llama 3.3, Qwen 2.5, etc.)
npm install ollama
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
