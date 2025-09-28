/**
 * AI-powered SEO suggestion types
 */

import type { AiContext, ContentAnalysis } from './ContentTypes';
import type { SeoResult } from './SeoTypes';

/**
 * Types of AI SEO suggestions
 */
export type AiSeoSuggestionType =
  | 'technical' // Technical SEO improvements
  | 'content' // Content quality and optimization
  | 'keywords' // Keyword optimization
  | 'structure' // HTML structure improvements
  | 'performance' // Performance-related SEO
  | 'accessibility' // Accessibility improvements
  | 'meta' // Meta tags and descriptions
  | 'schema' // Schema markup suggestions
  | 'links' // Internal and external linking
  | 'images'; // Image optimization

/**
 * Priority levels for suggestions
 */
export type AiSuggestionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Single AI SEO suggestion
 */
export interface AiSeoSuggestion {
  /** Unique suggestion ID */
  id: string;
  /** Type of suggestion */
  type: AiSeoSuggestionType;
  /** Priority level */
  priority: AiSuggestionPriority;
  /** Main suggestion title */
  title: string;
  /** Detailed description */
  description: string;
  /** Specific actionable steps */
  actionSteps: string[];
  /** Expected impact description */
  impact: string;
  /** Estimated effort required */
  effort: 'low' | 'medium' | 'high';
  /** Code examples or snippets (if applicable) */
  codeExample?: string;
  /** Related URLs or resources */
  resources?: string[];
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Grouped AI SEO suggestions by type
 */
export interface AiSeoSuggestionGroup {
  /** Suggestion type */
  type: AiSeoSuggestionType;
  /** Human-readable type name */
  typeName: string;
  /** Suggestions in this group */
  suggestions: AiSeoSuggestion[];
  /** Overall priority for this group */
  overallPriority: AiSuggestionPriority;
  /** Estimated total impact */
  totalImpact: string;
}

/**
 * Complete AI SEO analysis result
 */
export interface AiSeoAnalysis {
  /** Overall SEO score (0-100) */
  overallScore: number;
  /** Main issues summary */
  summary: string;
  /** Priority recommendations */
  topRecommendations: string[];
  /** Grouped suggestions */
  suggestionGroups: AiSeoSuggestionGroup[];
  /** All suggestions (flat list) */
  allSuggestions: AiSeoSuggestion[];
  /** Analysis metadata */
  meta: {
    /** AI provider used */
    provider: string;
    /** Model used */
    model: string;
    /** Analysis timestamp */
    analyzedAt: Date;
    /** Processing time in milliseconds */
    processingTime: number;
    /** Total suggestions count */
    suggestionCount: number;
    /** Cached result indicator */
    fromCache?: boolean;
  };
}

/**
 * AI SEO analysis request context
 */
export interface AiSeoAnalysisContext extends AiContext {
  /** Original content analysis result */
  contentAnalysis: ContentAnalysis;
  /** Original SEO result */
  seoResult: SeoResult;
  /** Specific analysis focus areas */
  focusAreas?: AiSeoSuggestionType[];
  /** Current SEO score (0-100) */
  currentScore?: number;
  /** Target audience information */
  targetAudience?: string;
  /** Business context */
  businessContext?: string;
  /** Competitor information */
  competitors?: string[];
  /** Current rankings info */
  currentRankings?: Array<{
    keyword: string;
    position: number;
    url: string;
  }>;
}

/**
 * AI prompt template configuration
 */
export interface AiSeoPromptTemplate {
  /** Template name */
  name: string;
  /** Suggestion type this template handles */
  type: AiSeoSuggestionType;
  /** Base prompt template */
  template: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Temperature setting */
  temperature: number;
  /** Examples for few-shot prompting */
  examples?: Array<{
    input: string;
    output: string;
  }>;
}

/**
 * AI SEO provider configuration
 */
export interface AiSeoConfig {
  /** Preferred AI provider */
  preferredProvider?: string;
  /** Enable caching */
  enableCaching?: boolean;
  /** Cache TTL in milliseconds */
  cacheTtl?: number;
  /** Maximum suggestions per type */
  maxSuggestionsPerType?: number;
  /** Include code examples */
  includeCodeExamples?: boolean;
  /** Analysis timeout in milliseconds */
  timeout?: number;
  /** Custom prompt templates */
  customTemplates?: AiSeoPromptTemplate[];
}

/**
 * AI SEO cache entry
 */
export interface AiSeoCacheEntry {
  /** Content hash for cache key */
  contentHash: string;
  /** Cached analysis result */
  analysis: AiSeoAnalysis;
  /** Cache timestamp */
  cachedAt: Date;
  /** Cache expiry timestamp */
  expiresAt: Date;
  /** Analysis context hash */
  contextHash: string;
}

/**
 * AI SEO analysis progress callback
 */
export type AiSeoProgressCallback = (progress: {
  /** Current step being processed */
  currentStep: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current suggestion type being analyzed */
  currentType?: AiSeoSuggestionType;
  /** Completed types */
  completedTypes: AiSeoSuggestionType[];
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
}) => void;

/**
 * AI SEO batch analysis request
 */
export interface AiBatchSeoAnalysisRequest {
  /** Array of analysis contexts */
  contexts: AiSeoAnalysisContext[];
  /** Shared configuration */
  config?: AiSeoConfig;
  /** Progress callback */
  onProgress?: AiSeoProgressCallback;
  /** Batch processing options */
  batchOptions?: {
    /** Concurrent analysis limit */
    concurrency?: number;
    /** Delay between requests in milliseconds */
    delayBetweenRequests?: number;
    /** Continue on individual failures */
    continueOnError?: boolean;
  };
}

/**
 * AI SEO batch analysis result
 */
export interface AiBatchSeoAnalysisResult {
  /** Successful analyses */
  successful: Array<{
    context: AiSeoAnalysisContext;
    result: AiSeoAnalysis;
  }>;
  /** Failed analyses */
  failed: Array<{
    context: AiSeoAnalysisContext;
    error: Error;
  }>;
  /** Overall batch statistics */
  stats: {
    /** Total processed */
    total: number;
    /** Successful count */
    successful: number;
    /** Failed count */
    failed: number;
    /** Total processing time */
    totalTime: number;
    /** Average time per analysis */
    averageTime: number;
  };
}
