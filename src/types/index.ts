/**
 * Type definitions index for @rumenx/seo
 */

// Core SEO types
export type {
  SeoMode,
  AiProvider,
  AiProviderConfig,
  TitleConfig,
  DescriptionConfig,
  KeywordsConfig,
  OpenGraphConfig,
  TwitterCardConfig,
  ValidationConfig,
  CacheConfig,
  SeoConfig,
  MetaTag,
  OpenGraphData,
  TwitterCardData,
  JsonLdData,
  SeoResult,
  ValidationError,
  SeoStats,
} from './SeoTypes';

// Content analysis types
export type {
  ContentMetadata,
  ImageAnalysis,
  LinkAnalysis,
  HeadingAnalysis,
  ContentStructure,
  SeoMetrics,
  ContentAnalysis,
  AiContext,
  ImageContext,
} from './ContentTypes';

// AI provider types
export type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderError,
  AiProviderCapabilities,
  IAiProvider,
  OpenAiConfig,
  AnthropicConfig,
  GoogleAiConfig,
  OllamaConfig,
  AiProviderFactoryConfig,
  AiPromptTemplates,
} from './AiTypes';

// Framework adapter types
export type {
  CacheAdapter,
  LoggerAdapter,
  SeoRequest,
  SeoResponse,
  SeoMiddlewareOptions,
  FrameworkAdapterFactory,
  SeoAdapters,
  TemplateRenderer,
  SeoTemplateData,
} from './AdapterTypes';

// Re-export constants
export { DEFAULT_PROMPTS } from './AiTypes';

// Re-export namespaces
export type { Express, NextJs, Fastify } from './AdapterTypes';
