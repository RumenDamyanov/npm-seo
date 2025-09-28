/**
 * Core SEO type definitions for @rumenx/seo
 */

/**
 * SEO operation modes
 */
export type SeoMode = 'ai' | 'manual' | 'hybrid';

/**
 * Supported AI providers
 */
export type AiProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

/**
 * AI provider configuration
 */
export interface AiProviderConfig {
  /** AI provider name */
  provider: AiProvider;
  /** API key for the provider */
  apiKey?: string;
  /** API URL (for local providers like Ollama) */
  apiUrl?: string;
  /** Model name to use */
  model?: string;
  /** Maximum tokens for generation */
  maxTokens?: number;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Title generation configuration
 */
export interface TitleConfig {
  /** Title pattern template */
  pattern?: string;
  /** Site name for pattern replacement */
  siteName?: string;
  /** Maximum title length */
  maxLength?: number;
  /** Minimum title length */
  minLength?: number;
  /** Whether to append site name */
  appendSiteName?: boolean;
  /** Separator between title and site name */
  separator?: string;
}

/**
 * Description generation configuration
 */
export interface DescriptionConfig {
  /** Description pattern template */
  pattern?: string;
  /** Maximum description length */
  maxLength?: number;
  /** Minimum description length */
  minLength?: number;
  /** Whether to extract from content if not provided */
  extractFromContent?: boolean;
}

/**
 * Keywords configuration
 */
export interface KeywordsConfig {
  /** Maximum number of keywords */
  maxCount?: number;
  /** Minimum keyword length */
  minLength?: number;
  /** Whether to extract from content */
  extractFromContent?: boolean;
  /** Custom keywords to include */
  include?: string[];
  /** Keywords to exclude */
  exclude?: string[];
}

/**
 * Open Graph configuration
 */
export interface OpenGraphConfig {
  /** Default Open Graph type */
  type?: string;
  /** Default site name */
  siteName?: string;
  /** Default locale */
  locale?: string;
  /** Default image URL */
  defaultImage?: string;
  /** Image dimensions */
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Twitter Card configuration
 */
export interface TwitterCardConfig {
  /** Default card type */
  cardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Twitter site handle */
  site?: string;
  /** Twitter creator handle */
  creator?: string;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Enable validation */
  enabled?: boolean;
  /** Strict validation mode */
  strict?: boolean;
  /** Validate URLs */
  validateUrls?: boolean;
  /** Allowed domains for URL validation */
  allowedDomains?: string[];
  /** Validate HTML structure */
  validateHtml?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Enable caching */
  enabled?: boolean;
  /** Cache TTL in seconds */
  ttl?: number;
  /** Cache key prefix */
  prefix?: string;
  /** Maximum cache entries */
  maxEntries?: number;
}

/**
 * Main SEO configuration interface
 */
export interface SeoConfig {
  /** SEO operation mode */
  mode?: SeoMode;
  /** AI configuration */
  ai?: AiProviderConfig & {
    /** Fallback providers */
    fallbackProviders?: AiProviderConfig[];
    /** Enable AI for specific tasks */
    enabledFor?: ('title' | 'description' | 'keywords' | 'altText')[];
  };
  /** Title configuration */
  title?: TitleConfig;
  /** Description configuration */
  description?: DescriptionConfig;
  /** Keywords configuration */
  keywords?: KeywordsConfig;
  /** Open Graph configuration */
  openGraph?: OpenGraphConfig;
  /** Twitter Card configuration */
  twitterCard?: TwitterCardConfig;
  /** Validation configuration */
  validation?: ValidationConfig;
  /** Cache configuration */
  cache?: CacheConfig;
  /** Default language */
  language?: string;
  /** Base URL for relative URLs */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Package version */
  version?: string;
}

/**
 * Meta tag structure
 */
export interface MetaTag {
  /** Tag name (e.g., 'meta', 'title', 'link') */
  tag: string;
  /** Tag attributes */
  attributes?: Record<string, string>;
  /** Tag content (for self-closing tags) */
  content?: string;
  /** Inner HTML content */
  innerHTML?: string;
}

/**
 * Open Graph data structure
 */
export interface OpenGraphData {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Page type */
  type?: string;
  /** Page URL */
  url?: string;
  /** Site name */
  siteName?: string;
  /** Locale */
  locale?: string;
  /** Images */
  images?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[];
}

/**
 * Twitter Card data structure
 */
export interface TwitterCardData {
  /** Card type */
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Site handle */
  site?: string;
  /** Creator handle */
  creator?: string;
  /** Image URL */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
}

/**
 * JSON-LD structured data
 */
export interface JsonLdData {
  /** Schema.org type */
  '@type': string;
  /** Schema.org context */
  '@context'?: string;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Complete SEO result
 */
export interface SeoResult {
  /** Generated title */
  title: string;
  /** Generated description */
  description: string;
  /** Generated keywords */
  keywords?: string[];
  /** Meta tags */
  metaTags: MetaTag[];
  /** Open Graph data */
  openGraph: OpenGraphData;
  /** Twitter Card data */
  twitterCard: TwitterCardData;
  /** JSON-LD structured data */
  jsonLd?: JsonLdData[];
  /** Generation metadata */
  meta: {
    /** Generation timestamp */
    generatedAt: Date;
    /** Mode used for generation */
    mode: SeoMode;
    /** AI provider used (if any) */
    aiProvider?: string;
    /** Processing time in milliseconds */
    processingTime: number;
    /** Whether result was cached */
    fromCache: boolean;
  };
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error type */
  type: string;
  /** Human-readable message */
  message: string;
  /** The value that failed validation */
  value: unknown;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
}

/**
 * SEO statistics
 */
export interface SeoStats {
  /** Total number of requests processed */
  totalRequests: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of AI generations */
  aiGenerations: number;
  /** Average processing time */
  averageProcessingTime: number;
  /** Last generation timestamp */
  lastGeneration: Date;
  /** Error count */
  errorCount: number;
}
