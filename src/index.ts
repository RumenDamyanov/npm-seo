/**
 * Main entry point for @rumenx/seo
 */

// Core classes
export { SeoManager } from './core/SeoManager';
export { ContentAnalyzer } from './core/ContentAnalyzer';

// Schema.org classes
export {
  BaseSchema,
  ArticleSchema,
  BreadcrumbListSchema,
  ProductSchema,
} from './schema';

// AI providers and SEO analyzer
export {
  BaseAiProvider,
  OpenAiProvider,
  AnthropicProvider,
  GoogleAiProvider,
  XAiProvider,
  OllamaProvider,
  AiProviderFactory,
  RateLimiter,
  RateLimiterManager,
  AiProviderChain,
} from './ai';

// AI-powered SEO analysis
export { AiSeoAnalyzer } from './ai/AiSeoAnalyzer';

// Cache system
export { CacheKeyGenerator, MemoryCache, RedisCache } from './cache';
export type {
  CacheInterface,
  CacheConfig,
  CacheStats,
  CacheEntry,
} from './cache';

// Framework integrations
export {
  ExpressSeo,
  NextSeo,
  FastifySeo,
  createDefaultSeoConfig,
  validateContent,
  formatApiResponse,
  extractTextFromHtml,
} from './integrations';

// Utilities
export {
  extractTextContent,
  extractHeadings,
  extractImages,
  extractLinks,
  extractSeoMetrics,
  calculateReadingTime,
  countSentences,
  countParagraphs,
  extractKeywords,
  calculateKeywordDensity,
  getFrequentWords,
} from './utils/HtmlParser';

// Re-export all types
export type * from './types';
