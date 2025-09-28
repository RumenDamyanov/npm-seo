/**
 * Content analysis type definitions for @rumenx/seo
 */

import type { JsonLdData } from './SeoTypes';

/**
 * Content metadata provided by user
 */
export interface ContentMetadata {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Page URL */
  url?: string;
  /** Page author */
  author?: string;
  /** Publication date */
  publishedAt?: Date | string;
  /** Last modified date */
  modifiedAt?: Date | string;
  /** Page category/tags */
  category?: string | string[];
  /** Page type */
  type?: string;
  /** Language code */
  language?: string;
  /** Featured image */
  image?: string;
  /** Custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Image analysis result
 */
export interface ImageAnalysis {
  /** Image URL */
  url: string;
  /** Current alt text (if any) */
  currentAlt?: string | undefined;
  /** Generated alt text */
  generatedAlt?: string | undefined;
  /** Image width */
  width?: number | undefined;
  /** Image height */
  height?: number | undefined;
  /** Image format */
  format?: string | undefined;
  /** Image size in bytes */
  size?: number | undefined;
  /** Whether image is decorative */
  isDecorative?: boolean | undefined;
  /** Image context (surrounding text) */
  context?: string | undefined;
  /** Image caption */
  caption?: string | undefined;
  /** Image title */
  title?: string | undefined;
}

/**
 * Link analysis result
 */
export interface LinkAnalysis {
  /** Link URL */
  url: string;
  /** Link text */
  text: string;
  /** Link title attribute */
  title?: string | undefined;
  /** Whether link is internal */
  isInternal: boolean;
  /** Whether link is external */
  isExternal: boolean;
  /** Link relationship */
  rel?: string | undefined;
  /** Target attribute */
  target?: string | undefined;
}

/**
 * Heading structure analysis
 */
export interface HeadingAnalysis {
  /** Heading level (1-6) */
  level: number;
  /** Heading text */
  text: string;
  /** Heading ID */
  id?: string | undefined;
  /** Position in document */
  position: number;
  /** Parent heading (for hierarchical structure) */
  parent?: HeadingAnalysis | undefined;
  /** Child headings */
  children?: HeadingAnalysis[] | undefined;
}

/**
 * Content structure analysis
 */
export interface ContentStructure {
  /** Document headings */
  headings: HeadingAnalysis[];
  /** Document images */
  images: ImageAnalysis[];
  /** Document links */
  links: LinkAnalysis[];
  /** Main content area */
  mainContent?: string;
  /** Content sections */
  sections: {
    type: string;
    content: string;
    wordCount: number;
  }[];
}

/**
 * SEO-specific content metrics
 */
export interface SeoMetrics {
  /** Title tag content */
  titleTag?: string | undefined;
  /** Meta description content */
  metaDescription?: string | undefined;
  /** H1 tags */
  h1Tags: string[];
  /** Meta keywords */
  metaKeywords?: string[] | undefined;
  /** Canonical URL */
  canonicalUrl?: string | undefined;
  /** Robots meta tag */
  robotsTag?: string | undefined;
  /** Open Graph tags */
  openGraphTags: Record<string, string>;
  /** Twitter Card tags */
  twitterCardTags: Record<string, string>;
  /** Schema.org structured data */
  structuredData: JsonLdData[];
}

/**
 * Comprehensive content analysis result
 */
export interface ContentAnalysis {
  /** Raw HTML content */
  rawContent: string;
  /** Cleaned text content */
  textContent: string;
  /** Content language */
  language?: string;
  /** Word count */
  wordCount: number;
  /** Character count */
  characterCount: number;
  /** Sentence count */
  sentenceCount: number;
  /** Paragraph count */
  paragraphCount: number;
  /** Reading time in minutes */
  readingTime: number;
  /** Reading level/score */
  readingLevel?: number;
  /** Extracted keywords */
  keywords: string[];
  /** Keyword density */
  keywordDensity: Record<string, number>;
  /** Most frequent words */
  frequentWords: { word: string; count: number; percentage: number }[];
  /** Content structure */
  structure: ContentStructure;
  /** SEO metrics */
  seoMetrics: SeoMetrics;
  /** Content sentiment (if available) */
  sentiment?: {
    score: number; // -1 to 1
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  /** Content topics/entities */
  topics?: string[];
  /** Analysis metadata */
  meta: {
    /** Analysis timestamp */
    analyzedAt: Date;
    /** Processing time in milliseconds */
    processingTime: number;
    /** Analyzer version */
    version: string;
    /** Analysis mode */
    mode: 'full' | 'fast' | 'minimal';
  };
}

/**
 * AI generation context
 */
export interface AiContext {
  /** Content analysis */
  analysis: ContentAnalysis;
  /** User-provided metadata */
  metadata: ContentMetadata;
  /** Generation target */
  target: 'title' | 'description' | 'keywords' | 'altText';
  /** Additional context */
  context?: {
    /** Target audience */
    audience?: string;
    /** Content purpose */
    purpose?: string;
    /** Brand voice */
    brandVoice?: string;
    /** Industry/domain */
    industry?: string;
    /** Competitors */
    competitors?: string[];
  };
}

/**
 * Image context for AI alt text generation
 */
export interface ImageContext {
  /** Image URL */
  url: string;
  /** Image analysis */
  analysis: ImageAnalysis;
  /** Surrounding text context */
  textContext: string;
  /** Page context */
  pageContext: {
    title?: string;
    description?: string;
    topic?: string;
  };
  /** Image purpose */
  purpose?: 'decorative' | 'informative' | 'functional' | 'complex';
}
