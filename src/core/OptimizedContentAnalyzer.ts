/**
 * Performance-optimized ContentAnalyzer with caching and batch processing
 */

import type {
  ContentAnalysis,
  ContentMetadata,
  ContentStructure,
  HeadingAnalysis,
  ImageAnalysis,
  LinkAnalysis,
  SeoMetrics,
} from '../types/ContentTypes';
import {
  extractTextContentOptimized,
  extractHeadingsOptimized,
  extractImagesOptimized,
  extractLinksOptimized,
  extractSeoMetricsOptimized,
  extractKeywordsOptimized,
  calculateKeywordDensityOptimized,
  clearOptimizedCaches,
  getCacheStats,
} from '../utils/OptimizedHtmlParser';
import {
  calculateReadingTime,
  countSentences,
  countParagraphs,
  getFrequentWords,
} from '../utils/HtmlParser';

/**
 * Result cache for complete analysis
 */
const analysisCache = new Map<string, { result: ContentAnalysis; timestamp: number }>();
const ANALYSIS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ANALYSIS_CACHE_SIZE = 50;

/**
 * Performance-optimized content analyzer
 */
export class OptimizedContentAnalyzer {
  private baseUrl?: string;
  private enableCaching: boolean;

  constructor(baseUrl?: string, enableCaching: boolean = true) {
    if (baseUrl !== undefined) {
      this.baseUrl = baseUrl;
    }
    this.enableCaching = enableCaching;
  }

  /**
   * High-performance content analysis with intelligent caching
   */
  analyze(content: string, metadata: ContentMetadata = {}): ContentAnalysis {
    const startTime = performance.now();

    // Check cache if enabled
    if (this.enableCaching) {
      const cacheKey = this.createAnalysisKey(content, metadata);
      const cached = analysisCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < ANALYSIS_CACHE_TTL) {
        return cached.result;
      }
    }

    // Batch extract all HTML-based data in parallel
    const [textContent, headings, images, links, seoMetrics] = this.batchExtractHtmlData(content);

    // Process text-based analysis
    const textAnalysis = this.analyzeTextContent(textContent);

    // Build content structure
    const structure: ContentStructure = {
      headings,
      images,
      links,
      sections: this.extractSectionsOptimized(content),
    };

    const processingTime = performance.now() - startTime;

    const result: ContentAnalysis = {
      rawContent: content,
      textContent,
      language: this.detectLanguageOptimized(textContent) ?? metadata.language ?? 'en',
      wordCount: textAnalysis.wordCount,
      characterCount: textAnalysis.characterCount,
      sentenceCount: textAnalysis.sentenceCount,
      paragraphCount: countParagraphs(content),
      readingTime: textAnalysis.readingTime,
      keywords: textAnalysis.keywords,
      keywordDensity: textAnalysis.keywordDensity,
      frequentWords: textAnalysis.frequentWords,
      structure,
      seoMetrics,
      meta: {
        version: '1.0.0',
        analyzedAt: new Date(),
        processingTime: Math.round(processingTime * 100) / 100, // Round to 2 decimal places
        mode: 'full',
      },
    };

    // Cache result if enabled
    if (this.enableCaching) {
      this.cacheAnalysisResult(content, metadata, result);
    }

    return result;
  }

  /**
   * Ultra-fast analysis with minimal processing for performance-critical scenarios
   */
  analyzeFast(content: string, metadata: ContentMetadata = {}): ContentAnalysis {
    const startTime = performance.now();

    // Extract only essential data
    const textContent = extractTextContentOptimized(content);
    const wordCount = this.countWordsOptimized(textContent);
    const characterCount = textContent.length;
    const readingTime = calculateReadingTime(textContent);

    // Minimal structure extraction
    const headings = extractHeadingsOptimized(content);
    const seoMetrics = extractSeoMetricsOptimized(content);

    // Basic keywords (top 10 only)
    const keywords = extractKeywordsOptimized(textContent, 3, 10);

    const processingTime = performance.now() - startTime;

    return {
      rawContent: content,
      textContent,
      language: metadata.language ?? 'en',
      wordCount,
      characterCount,
      sentenceCount: 0, // Skip for performance
      paragraphCount: 0, // Skip for performance
      readingTime,
      keywords,
      keywordDensity: {}, // Skip for performance
      frequentWords: [], // Skip for performance
      structure: {
        headings,
        images: [], // Skip for performance
        links: [], // Skip for performance
        sections: [], // Skip for performance
      },
      seoMetrics,
      meta: {
        version: '1.0.0',
        analyzedAt: new Date(),
        processingTime: Math.round(processingTime * 100) / 100,
        mode: 'fast',
      },
    };
  }

  /**
   * Batch extract HTML data for optimal performance
   */
  private batchExtractHtmlData(content: string): [
    string, // textContent
    HeadingAnalysis[], // headings
    ImageAnalysis[], // images
    LinkAnalysis[], // links
    SeoMetrics, // seoMetrics
  ] {
    return [
      extractTextContentOptimized(content),
      extractHeadingsOptimized(content),
      extractImagesOptimized(content, this.baseUrl),
      extractLinksOptimized(content, this.baseUrl),
      extractSeoMetricsOptimized(content),
    ];
  }

  /**
   * Optimized text content analysis
   */
  private analyzeTextContent(textContent: string): {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    readingTime: number;
    keywords: string[];
    keywordDensity: Record<string, number>;
    frequentWords: { word: string; count: number; percentage: number }[];
  } {
    const wordCount = this.countWordsOptimized(textContent);
    const characterCount = textContent.length;
    const sentenceCount = countSentences(textContent);
    const readingTime = calculateReadingTime(textContent);

    // Parallel keyword processing
    const keywords = extractKeywordsOptimized(textContent);
    const keywordDensity = calculateKeywordDensityOptimized(textContent, keywords);
    const frequentWords = getFrequentWords(textContent);

    return {
      wordCount,
      characterCount,
      sentenceCount,
      readingTime,
      keywords,
      keywordDensity,
      frequentWords,
    };
  }

  /**
   * Optimized word counting
   */
  private countWordsOptimized(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Optimized section extraction with better regex patterns
   */
  private extractSectionsOptimized(content: string): Array<{
    type: string;
    content: string;
    wordCount: number;
  }> {
    const sections: Array<{ type: string; content: string; wordCount: number }> = [];

    // Pre-compiled regex patterns for better performance
    const sectionPatterns = [
      { type: 'header', pattern: /<header[^>]*>([\s\S]*?)<\/header>/gi },
      { type: 'nav', pattern: /<nav[^>]*>([\s\S]*?)<\/nav>/gi },
      { type: 'main', pattern: /<main[^>]*>([\s\S]*?)<\/main>/gi },
      { type: 'article', pattern: /<article[^>]*>([\s\S]*?)<\/article>/gi },
      { type: 'section', pattern: /<section[^>]*>([\s\S]*?)<\/section>/gi },
      { type: 'aside', pattern: /<aside[^>]*>([\s\S]*?)<\/aside>/gi },
      { type: 'footer', pattern: /<footer[^>]*>([\s\S]*?)<\/footer>/gi },
    ];

    sectionPatterns.forEach(({ type, pattern }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const sectionContent = match[1];
        if (!sectionContent) continue;
        const textContent = extractTextContentOptimized(sectionContent);
        const wordCount = this.countWordsOptimized(textContent);

        if (wordCount > 0) {
          sections.push({
            type,
            content: textContent,
            wordCount,
          });
        }
      }
    });

    return sections;
  }

  /**
   * Optimized language detection with caching
   */
  private languageCache = new Map<string, string>();

  private detectLanguageOptimized(text: string): string | null {
    if (!text || text.length < 10) return null;

    // Use first 200 characters for language detection
    const sample = text.substring(0, 200).toLowerCase();
    const cached = this.languageCache.get(sample);
    if (cached) return cached;

    // Simple language detection based on common words
    const languageIndicators = {
      en: ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but'],
      es: ['que', 'del', 'con', 'una', 'por', 'para', 'como', 'más', 'todo', 'cuando'],
      fr: ['que', 'des', 'avec', 'une', 'pour', 'dans', 'comme', 'plus', 'tout', 'quand'],
      de: ['der', 'und', 'mit', 'eine', 'für', 'nicht', 'wie', 'mehr', 'alle', 'wenn'],
      it: ['che', 'del', 'con', 'una', 'per', 'non', 'come', 'più', 'tutto', 'quando'],
    };

    let maxScore = 0;
    let detectedLanguage = 'en';

    Object.entries(languageIndicators).forEach(([lang, indicators]) => {
      const score = indicators.reduce((count, indicator) => {
        return count + (sample.includes(indicator) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    });

    // Cache result
    if (this.languageCache.size >= 100) {
      const [firstKey] = this.languageCache.keys();
      if (firstKey) {
        this.languageCache.delete(firstKey);
      }
    }
    this.languageCache.set(sample, detectedLanguage);

    return maxScore > 0 ? detectedLanguage : null;
  }

  /**
   * Create cache key for analysis
   */
  private createAnalysisKey(content: string, metadata: ContentMetadata): string {
    const contentHash = this.simpleHash(content);
    const metadataHash = this.simpleHash(JSON.stringify(metadata));
    return `${contentHash}:${metadataHash}`;
  }

  /**
   * Simple hash function for caching
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Cache analysis result
   */
  private cacheAnalysisResult(
    content: string,
    metadata: ContentMetadata,
    result: ContentAnalysis
  ): void {
    const cacheKey = this.createAnalysisKey(content, metadata);

    // Manage cache size
    if (analysisCache.size >= MAX_ANALYSIS_CACHE_SIZE) {
      const [oldestKey] = analysisCache.keys();
      if (oldestKey) {
        analysisCache.delete(oldestKey);
      }
    }

    analysisCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    analysisCache.clear();
    this.languageCache.clear();
    clearOptimizedCaches();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    analysisCache: { size: number; maxSize: number };
    languageCache: { size: number; maxSize: number };
    htmlParserCache: ReturnType<typeof getCacheStats>;
  } {
    return {
      analysisCache: {
        size: analysisCache.size,
        maxSize: MAX_ANALYSIS_CACHE_SIZE,
      },
      languageCache: {
        size: this.languageCache.size,
        maxSize: 100,
      },
      htmlParserCache: getCacheStats(),
    };
  }

  /**
   * Enable or disable caching
   */
  setCachingEnabled(enabled: boolean): void {
    this.enableCaching = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }
}
