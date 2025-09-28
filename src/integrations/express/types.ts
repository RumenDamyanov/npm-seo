/**
 * Express.js integration types for @rumenx/seo
 */

import type { SeoConfig, SeoResult } from '../../types/SeoTypes';
import type { ContentAnalysis } from '../../types/ContentTypes';
import type { AiProviderFactoryConfig } from '../../types/AiTypes';

// Express types - these will be available when express is installed
export interface Request {
  [key: string]: unknown;
}

export interface Response {
  [key: string]: unknown;
}

export interface NextFunction {
  (error?: unknown): void;
}

/**
 * Express SEO middleware configuration
 */
export interface ExpressSeoConfig extends SeoConfig {
  /** AI provider configuration */
  aiProvider?: AiProviderFactoryConfig;
  /** Enable automatic SEO analysis for responses */
  autoAnalyze?: boolean;
  /** Routes to exclude from automatic analysis */
  excludeRoutes?: string[];
  /** Enable SEO API endpoints */
  enableApiEndpoints?: boolean;
  /** API endpoint prefix */
  apiPrefix?: string;
  /** Enable response caching */
  enableCaching?: boolean;
  /** Cache TTL in seconds */
  cacheTtl?: number;
}

/**
 * Extended Express request with SEO functionality
 */
export interface SeoRequest extends Request {
  seo: {
    /** Analyze content and get SEO recommendations */
    analyze: (content: string, options?: Partial<SeoConfig>) => Promise<SeoResult>;
    /** Generate AI-powered content */
    generateTitle: (content: string) => Promise<string>;
    generateDescription: (content: string) => Promise<string>;
    generateKeywords: (content: string) => Promise<string[]>;
    /** Get SEO configuration */
    getConfig: () => SeoConfig;
  };
}

/**
 * Extended Express response with SEO functionality
 */
export interface SeoResponse extends Response {
  seo: {
    /** Send response with automatic SEO analysis */
    sendWithSeo: (content: string) => Promise<void>;
    /** Set SEO meta tags in response headers */
    setSeoHeaders: (analysis: ContentAnalysis) => void;
    /** Add structured data to response */
    addStructuredData: (data: Record<string, unknown>) => void;
  };
}

/**
 * Express SEO middleware function type
 */
export type ExpressSeoMiddleware = (req: SeoRequest, res: SeoResponse, next: NextFunction) => void;

/**
 * Express SEO route handler type
 */
export type ExpressSeoRouteHandler = (
  req: SeoRequest,
  res: SeoResponse,
  next: NextFunction
) => void | Promise<void>;

/**
 * SEO analysis cache entry
 */
export interface SeoAnalysisCache {
  analysis: SeoResult;
  timestamp: number;
  ttl: number;
}

/**
 * Express SEO middleware options
 */
export interface ExpressMiddlewareOptions {
  /** SEO configuration */
  config: ExpressSeoConfig;
  /** Custom cache implementation */
  cache?: Map<string, SeoAnalysisCache>;
  /** Enable development mode with detailed logging */
  development?: boolean;
}
