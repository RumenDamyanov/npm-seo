/**
 * Framework adapter type definitions for @rumenx/seo
 */

import type { SeoConfig, SeoResult } from './SeoTypes';
import type { ContentMetadata } from './ContentTypes';

/**
 * Cache adapter interface
 */
export interface CacheAdapter {
  /** Get cached value by key */
  get(key: string): Promise<string | null>;

  /** Set cached value with optional TTL */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /** Check if key exists in cache */
  has(key: string): Promise<boolean>;

  /** Delete cached value by key */
  delete(key: string): Promise<void>;

  /** Clear all cached values */
  clear(): Promise<void>;

  /** Get cache statistics */
  getStats?(): Promise<{
    hits: number;
    misses: number;
    keys: number;
    memory?: number;
  }>;
}

/**
 * Logger adapter interface
 */
export interface LoggerAdapter {
  /** Log debug message */
  debug(message: string, meta?: Record<string, unknown>): void;

  /** Log info message */
  info(message: string, meta?: Record<string, unknown>): void;

  /** Log warning message */
  warn(message: string, meta?: Record<string, unknown>): void;

  /** Log error message */
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

/**
 * HTTP request interface (framework-agnostic)
 */
export interface SeoRequest {
  /** Request URL */
  url: string;

  /** Request method */
  method: string;

  /** Request headers */
  headers: Record<string, string | string[]>;

  /** Query parameters */
  query: Record<string, string | string[]>;

  /** Request body */
  body?: unknown;

  /** Get header value */
  getHeader(name: string): string | string[] | undefined;

  /** Get query parameter */
  getQuery(name: string): string | string[] | undefined;
}

/**
 * HTTP response interface (framework-agnostic)
 */
export interface SeoResponse {
  /** Set response header */
  setHeader(name: string, value: string | string[]): void;

  /** Set response status */
  setStatus(status: number): void;

  /** Send response */
  send(content: string, contentType?: string): void;

  /** Send JSON response */
  json(data: unknown): void;

  /** Redirect response */
  redirect(url: string, status?: number): void;
}

/**
 * SEO middleware options
 */
export interface SeoMiddlewareOptions {
  /** SEO configuration */
  config?: Partial<SeoConfig>;

  /** Routes to enable SEO for */
  routes?: string[] | RegExp[];

  /** Routes to exclude from SEO */
  excludeRoutes?: string[] | RegExp[];

  /** Cache adapter */
  cache?: CacheAdapter;

  /** Logger adapter */
  logger?: LoggerAdapter;

  /** Automatic meta tag injection */
  autoInject?: boolean;

  /** Custom content extractor */
  contentExtractor?: (req: SeoRequest, res: SeoResponse) => Promise<string> | string;

  /** Custom metadata extractor */
  metadataExtractor?: (
    req: SeoRequest,
    res: SeoResponse
  ) => Promise<ContentMetadata> | ContentMetadata;
}

/**
 * Express.js specific types
 */
export namespace Express {
  export interface ExpressSeoRequest extends SeoRequest {
    /** Express request object (when Express is available) */
    originalRequest?: unknown;
  }

  export interface ExpressSeoResponse extends SeoResponse {
    /** Express response object (when Express is available) */
    originalResponse?: unknown;

    /** Render view with SEO */
    renderWithSeo(view: string, data?: unknown, seoOptions?: Partial<SeoConfig>): void;
  }

  export interface SeoMiddleware {
    (req: unknown, res: unknown, next: unknown): void;
  }

  export interface SeoExpressOptions extends SeoMiddlewareOptions {
    /** View engine for rendering */
    viewEngine?: string;

    /** Template directory */
    templateDir?: string;
  }
}

/**
 * Next.js specific types
 */
export namespace NextJs {
  export interface NextSeoRequest extends SeoRequest {
    /** Next.js request object (when Next.js is available) */
    originalRequest?: unknown;
  }

  export interface NextSeoResponse extends SeoResponse {
    /** Next.js response object (when Next.js is available) */
    originalResponse?: unknown;
  }

  export interface SeoApiHandler {
    (req: unknown, res: unknown): Promise<void>;
  }

  export interface SeoMiddleware {
    (req: unknown): Promise<unknown>;
  }

  export interface SeoNextOptions extends SeoMiddlewareOptions {
    /** App Router or Pages Router */
    routerType?: 'app' | 'pages';

    /** Static generation */
    staticGeneration?: boolean;
  }
}

/**
 * Fastify specific types
 */
export namespace Fastify {
  export interface FastifySeoRequest extends SeoRequest {
    /** Fastify request object (when Fastify is available) */
    originalRequest?: unknown;
  }

  export interface FastifySeoResponse extends SeoResponse {
    /** Fastify reply object (when Fastify is available) */
    originalReply?: unknown;
  }

  export interface SeoPlugin {
    (fastify: unknown, options: SeoFastifyOptions): Promise<void>;
  }

  export interface SeoFastifyOptions extends SeoMiddlewareOptions {
    /** Plugin prefix */
    prefix?: string;

    /** Schema validation */
    schema?: boolean;
  }
}

/**
 * Framework adapter factory
 */
export interface FrameworkAdapterFactory {
  /** Create Express.js adapter */
  createExpress(options?: Express.SeoExpressOptions): Express.SeoMiddleware;

  /** Create Next.js API handler */
  createNextApiHandler(options?: NextJs.SeoNextOptions): NextJs.SeoApiHandler;

  /** Create Next.js middleware */
  createNextMiddleware(options?: NextJs.SeoNextOptions): NextJs.SeoMiddleware;

  /** Create Fastify plugin */
  createFastifyPlugin(options?: Fastify.SeoFastifyOptions): Fastify.SeoPlugin;
}

/**
 * SEO adapter collection
 */
export interface SeoAdapters {
  /** Cache adapter */
  cache?: CacheAdapter;

  /** Logger adapter */
  logger?: LoggerAdapter;

  /** Framework adapter factory */
  framework?: FrameworkAdapterFactory;
}

/**
 * Template renderer interface
 */
export interface TemplateRenderer {
  /** Render template with data */
  render(template: string, data: SeoTemplateData): Promise<string>;

  /** Check if template exists */
  exists(template: string): boolean;

  /** Register custom helper */
  registerHelper(name: string, helper: (...args: unknown[]) => unknown): void;
}

/**
 * SEO template data
 */
export interface SeoTemplateData {
  /** SEO result data */
  seoResult: SeoResult;

  /** Content metadata */
  metadata: ContentMetadata;

  /** Request information */
  request?: {
    url: string;
    userAgent?: string;
    referrer?: string;
  };

  /** Site information */
  site?: {
    name: string;
    url: string;
    description?: string;
    logo?: string;
  };

  /** Additional custom data */
  custom?: Record<string, unknown>;
}
