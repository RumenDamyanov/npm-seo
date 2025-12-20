/**
 * AI provider type definitions for @rumenx/seo
 */

import type { AiContext, ImageContext } from './ContentTypes';

/**
 * AI generation request
 */
export interface AiGenerationRequest {
  /** Generation prompt */
  prompt: string;
  /** Context for generation */
  context: AiContext | ImageContext;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for generation */
  temperature?: number;
  /** Additional generation parameters */
  parameters?: Record<string, unknown>;
}

/**
 * AI generation response
 */
export interface AiGenerationResponse {
  /** Generated content */
  content: string;
  /** Alternative suggestions */
  alternatives?: string[];
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Generation metadata */
  meta: {
    /** AI model used */
    model: string;
    /** Provider name */
    provider: string;
    /** Generation timestamp */
    generatedAt: Date;
    /** Processing time in milliseconds */
    processingTime: number;
    /** Request ID (if available) */
    requestId?: string;
  };
}

/**
 * AI provider error
 */
export interface AiProviderError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error type */
  type: 'auth' | 'rate_limit' | 'quota' | 'network' | 'validation' | 'server' | 'unknown';
  /** Whether error is retryable */
  retryable: boolean;
  /** Retry after seconds (for rate limits) */
  retryAfter?: number;
  /** Original error */
  originalError?: Error;
}

/**
 * AI provider capabilities
 */
export interface AiProviderCapabilities {
  /** Maximum input tokens */
  maxInputTokens: number;
  /** Maximum output tokens */
  maxOutputTokens: number;
  /** Supported languages */
  supportedLanguages: string[];
  /** Supports image analysis */
  supportsImageAnalysis: boolean;
  /** Supports streaming */
  supportsStreaming: boolean;
  /** Supports function calling */
  supportsFunctionCalling: boolean;
  /** Rate limits */
  rateLimits: {
    /** Requests per minute */
    requestsPerMinute: number;
    /** Tokens per minute */
    tokensPerMinute: number;
    /** Requests per day */
    requestsPerDay?: number;
  };
}

/**
 * Abstract AI provider interface
 */
export interface IAiProvider {
  /** Provider name */
  readonly name: string;

  /** Provider capabilities */
  readonly capabilities: AiProviderCapabilities;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;

  /** Generate title */
  generateTitle(context: AiContext): Promise<AiGenerationResponse>;

  /** Generate description */
  generateDescription(context: AiContext): Promise<AiGenerationResponse>;

  /** Generate keywords */
  generateKeywords(context: AiContext): Promise<AiGenerationResponse>;

  /** Generate alt text for images */
  generateAltText(context: ImageContext): Promise<AiGenerationResponse>;

  /** Custom generation with prompt */
  generate(request: AiGenerationRequest): Promise<AiGenerationResponse>;

  /** Get provider status */
  getStatus(): Promise<{
    available: boolean;
    model: string;
    version?: string;
    usage?: {
      current: number;
      limit: number;
      resetAt?: Date;
    };
  }>;
}

/**
 * OpenAI provider configuration
 */
export interface OpenAiConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Organization ID */
  organization?: string;
  /** Base URL for API */
  baseUrl?: string;
  /** Model to use (default: gpt-4.1-turbo) */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Use mock mode for testing (no real API calls) */
  mockMode?: boolean;
}

/**
 * Anthropic provider configuration
 */
export interface AnthropicConfig {
  /** Anthropic API key */
  apiKey: string;
  /** Model to use (default: claude-4-sonnet-20250101) */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Use mock mode for testing (no real API calls) */
  mockMode?: boolean;
}

/**
 * Google AI provider configuration
 */
export interface GoogleAiConfig {
  /** Google AI API key */
  apiKey: string;
  /** Model to use (default: gemini-1.5-pro-latest) */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Use mock mode for testing (no real API calls) */
  mockMode?: boolean;
}

/**
 * xAI provider configuration (Grok models)
 */
export interface XAiConfig {
  /** xAI API key */
  apiKey: string;
  /** Base URL for xAI API (default: https://api.x.ai/v1) */
  baseUrl?: string;
  /** Model to use (default: grok-2-latest) */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Use mock mode for testing (no real API calls) */
  mockMode?: boolean;
}

/**
 * Ollama provider configuration
 */
export interface OllamaConfig {
  /** Ollama API URL */
  apiUrl: string;
  /** Model to use */
  model: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Use mock mode for testing (no real API calls) */
  mockMode?: boolean;
}

/**
 * AI provider factory configuration
 */
export interface AiProviderFactoryConfig {
  /** Primary provider configuration */
  primary:
    | {
        provider: 'openai';
        config: OpenAiConfig;
      }
    | {
        provider: 'anthropic';
        config: AnthropicConfig;
      }
    | {
        provider: 'google';
        config: GoogleAiConfig;
      }
    | {
        provider: 'ollama';
        config: OllamaConfig;
      };

  /** Fallback providers */
  fallbacks?: Array<
    | {
        provider: 'openai';
        config: OpenAiConfig;
      }
    | {
        provider: 'anthropic';
        config: AnthropicConfig;
      }
    | {
        provider: 'google';
        config: GoogleAiConfig;
      }
    | {
        provider: 'ollama';
        config: OllamaConfig;
      }
  >;

  /** Fallback strategy */
  fallbackStrategy?: 'sequential' | 'random' | 'fastest';

  /** Enable automatic retries */
  autoRetry?: boolean;

  /** Circuit breaker configuration */
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
}

/**
 * AI prompt templates
 */
export interface AiPromptTemplates {
  /** Title generation prompt */
  title: string;

  /** Description generation prompt */
  description: string;

  /** Keywords generation prompt */
  keywords: string;

  /** Alt text generation prompt */
  altText: string;

  /** Custom prompts */
  custom?: Record<string, string>;
}

/**
 * Default prompt templates
 */
export const DEFAULT_PROMPTS: AiPromptTemplates = {
  title: `Generate an SEO-optimized title for the following content. The title should be:
- Between 50-60 characters
- Engaging and click-worthy
- Include the main keyword naturally
- Accurately describe the content

Content: {content}
Keywords: {keywords}
Context: {context}

Generate only the title, no additional text:`,

  description: `Generate an SEO-optimized meta description for the following content. The description should be:
- Between 150-160 characters
- Compelling and informative
- Include the main keyword naturally
- Include a call-to-action if appropriate

Content: {content}
Title: {title}
Keywords: {keywords}
Context: {context}

Generate only the description, no additional text:`,

  keywords: `Extract and suggest relevant SEO keywords for the following content. Provide:
- 5-10 primary keywords
- Focus on search intent
- Include long-tail keywords
- Consider semantic variations

Content: {content}
Title: {title}
Context: {context}

Return keywords as a comma-separated list:`,

  altText: `Generate descriptive alt text for this image. The alt text should be:
- Concise but descriptive
- Relevant to the page context
- Accessible for screen readers
- Under 125 characters

Image context: {imageContext}
Page context: {pageContext}
Surrounding text: {textContext}

Generate only the alt text, no additional text:`,
};
