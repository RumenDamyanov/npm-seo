/**
 * Main SEO manager class that coordinates content analysis, generation, and optimization
 */

import { ContentAnalyzer } from './ContentAnalyzer';
import type { SeoConfig } from '../types/SeoTypes';
import type { ContentAnalysis, ContentMetadata, AiContext } from '../types/ContentTypes';
import type { IAiProvider } from '../types/AiTypes';

interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  contentLength?: string;
}

interface SeoRecommendation {
  type: 'title' | 'description' | 'keywords' | 'content' | 'structure' | 'images';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  currentValue: string | null;
  recommendedValue: string;
}

interface SeoResult {
  analysis: ContentAnalysis;
  recommendations: SeoRecommendation[];
  score: {
    overall: number;
    breakdown: Record<string, number>;
  };
  meta: {
    analyzedAt: Date;
    processingTime: number;
    version: string;
    config: SeoConfig;
  };
}

/**
 * Main SEO manager for content analysis and optimization
 *
 * Supports fluent interface for method chaining
 *
 * @example
 * ```typescript
 * // Fluent interface usage
 * const seo = new SeoManager(config);
 * const title = seo.analyze(content).generateTitle();
 *
 * // Generate all SEO data at once
 * const seoData = seo.analyze(content).generateAll();
 * ```
 */
export class SeoManager {
  private config: SeoConfig;
  private contentAnalyzer: ContentAnalyzer;
  private aiProvider: IAiProvider | undefined;
  private lastAnalysis: ContentAnalysis | null = null;
  private lastSeoResult: SeoResult | null = null;

  constructor(config: SeoConfig, aiProvider?: IAiProvider) {
    this.config = config;
    this.contentAnalyzer = new ContentAnalyzer(config.baseUrl);
    this.aiProvider = aiProvider;
  }

  /**
   * Analyze content and generate SEO recommendations
   *
   * Stores analysis result for use with fluent interface methods
   *
   * @param content - HTML content to analyze
   * @param metadata - Additional metadata
   * @param options - Analysis options
   * @returns This instance for chaining (fluent interface)
   */
  analyze(content: string, metadata: ContentMetadata = {}, options: { fast?: boolean } = {}): this {
    const startTime = Date.now();

    // Analyze content
    const analysis = options.fast
      ? this.contentAnalyzer.analyzeFast(content, metadata)
      : this.contentAnalyzer.analyze(content, metadata);

    // Store analysis for fluent interface
    this.lastAnalysis = analysis;

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis, metadata);

    // Calculate SEO score
    const score = this.calculateSeoScore(analysis, recommendations);

    const processingTime = Date.now() - startTime;

    // Store result
    this.lastSeoResult = {
      analysis,
      recommendations,
      score,
      meta: {
        analyzedAt: new Date(),
        processingTime,
        version: '1.0.0',
        config: this.config,
      },
    };

    return this; // Return this for chaining
  }

  /**
   * Get the last analysis result
   *
   * @returns Last SEO result or null if no analysis performed
   */
  getResult(): SeoResult | null {
    return this.lastSeoResult;
  }

  /**
   * Get the last content analysis
   *
   * @returns Last content analysis or null
   */
  getAnalysis(): ContentAnalysis | null {
    return this.lastAnalysis;
  }

  /**
   * Generate AI-powered content suggestions
   */
  async generateSuggestions(
    analysis: ContentAnalysis,
    type: 'title' | 'description' | 'keywords' | 'content',
    options: GenerationOptions = {}
  ): Promise<string[]> {
    if (!this.aiProvider) {
      throw new Error('AI provider not configured');
    }

    const context = this.buildAiContext(analysis, type);
    const prompt = this.buildAiPrompt(analysis, type, options);

    try {
      const response = await this.aiProvider.generate({
        prompt,
        context,
        maxTokens: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0.7,
      });

      return this.parseAiResponse(response.content, type);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('AI generation failed:', error);
      return this.generateFallbackSuggestions(analysis, type);
    }
  }

  /**
   * Generate optimized title based on analysis
   *
   * @param maxLength - Maximum title length (default: 60)
   * @returns Generated title
   * @throws {Error} If no analysis has been performed
   */
  generateTitle(maxLength: number = 60): string {
    if (!this.lastAnalysis) {
      throw new Error('Must call analyze() before generating title');
    }

    const { keywords, seoMetrics } = this.lastAnalysis;
    const currentTitle = seoMetrics.titleTag;

    // If current title is good, optimize it
    if (currentTitle && currentTitle.length >= 30 && currentTitle.length <= 60) {
      return currentTitle;
    }

    // Generate title from keywords
    const topKeywords = keywords.slice(0, 3);
    let title = topKeywords.join(' | ');

    // Truncate if too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return title;
  }

  /**
   * Generate optimized meta description based on analysis
   *
   * @param maxLength - Maximum description length (default: 160)
   * @returns Generated description
   * @throws {Error} If no analysis has been performed
   */
  generateDescription(maxLength: number = 160): string {
    if (!this.lastAnalysis) {
      throw new Error('Must call analyze() before generating description');
    }

    const { textContent, keywords, seoMetrics } = this.lastAnalysis;
    const currentDescription = seoMetrics.metaDescription;

    // If current description is good, use it
    if (
      currentDescription &&
      currentDescription.length >= 120 &&
      currentDescription.length <= 160
    ) {
      return currentDescription;
    }

    // Generate from content
    let description = textContent.substring(0, maxLength - 3) + '...';

    // Try to end at a sentence
    const lastPeriod = description.lastIndexOf('.');
    if (lastPeriod > maxLength / 2) {
      description = description.substring(0, lastPeriod + 1);
    }

    // Add keywords if space allows
    if (description.length < maxLength - 20) {
      const keywordPhrase = ` Keywords: ${keywords.slice(0, 2).join(', ')}.`;
      if (description.length + keywordPhrase.length <= maxLength) {
        description += keywordPhrase;
      }
    }

    return description;
  }

  /**
   * Generate keywords array based on analysis
   *
   * @param maxKeywords - Maximum number of keywords (default: 10)
   * @returns Array of keywords
   * @throws {Error} If no analysis has been performed
   */
  generateKeywords(maxKeywords: number = 10): string[] {
    if (!this.lastAnalysis) {
      throw new Error('Must call analyze() before generating keywords');
    }

    return this.lastAnalysis.keywords.slice(0, maxKeywords);
  }

  /**
   * Generate all SEO data at once
   *
   * Generates title, description, keywords, and returns recommendations and score
   *
   * @returns Complete SEO data
   * @throws {Error} If no analysis has been performed
   *
   * @example
   * ```typescript
   * const seo = new SeoManager(config);
   * const seoData = seo.analyze(content).generateAll();
   *
   * console.log(seoData.title);
   * console.log(seoData.description);
   * console.log(seoData.keywords);
   * ```
   */
  generateAll(): {
    title: string;
    description: string;
    keywords: string[];
    recommendations: SeoRecommendation[];
    score: {
      overall: number;
      breakdown: Record<string, number>;
    };
    analysis: ContentAnalysis;
    meta: {
      analyzedAt: Date;
      processingTime: number;
      version: string;
    };
  } {
    if (!this.lastSeoResult || !this.lastAnalysis) {
      throw new Error('Must call analyze() before generateAll()');
    }

    return {
      title: this.generateTitle(),
      description: this.generateDescription(),
      keywords: this.generateKeywords(),
      recommendations: this.lastSeoResult.recommendations,
      score: this.lastSeoResult.score,
      analysis: this.lastAnalysis,
      meta: this.lastSeoResult.meta,
    };
  }

  /**
   * Update configuration (fluent interface)
   *
   * @param newConfig - Partial configuration to merge
   * @returns This instance for chaining
   */
  updateConfig(newConfig: Partial<SeoConfig>): this {
    this.config = { ...this.config, ...newConfig };
    this.contentAnalyzer = new ContentAnalyzer(this.config.baseUrl);
    return this;
  }

  /**
   * Set AI provider (fluent interface)
   *
   * @param provider - AI provider instance
   * @returns This instance for chaining
   */
  setAiProvider(provider: IAiProvider): this {
    this.aiProvider = provider;
    return this;
  }

  /**
   * Generate SEO recommendations based on analysis
   */
  private generateRecommendations(
    analysis: ContentAnalysis,
    _metadata: ContentMetadata
  ): SeoRecommendation[] {
    const recommendations: SeoRecommendation[] = [];

    // Check title
    if (!analysis.seoMetrics.titleTag || analysis.seoMetrics.titleTag.length === 0) {
      recommendations.push({
        type: 'title',
        severity: 'high',
        message: 'Missing page title',
        suggestion: 'Add a descriptive title tag to improve SEO',
        currentValue: null,
        recommendedValue: `Title based on: "${analysis.keywords.slice(0, 3).join(', ')}"`,
      });
    } else if (
      analysis.seoMetrics.titleTag.length < 30 ||
      analysis.seoMetrics.titleTag.length > 60
    ) {
      recommendations.push({
        type: 'title',
        severity: 'medium',
        message: `Title length is ${analysis.seoMetrics.titleTag.length} characters`,
        suggestion: 'Keep title between 30-60 characters for optimal display',
        currentValue: analysis.seoMetrics.titleTag,
        recommendedValue: 'Optimize title length',
      });
    }

    // Check meta description
    if (!analysis.seoMetrics.metaDescription || analysis.seoMetrics.metaDescription.length === 0) {
      recommendations.push({
        type: 'description',
        severity: 'high',
        message: 'Missing meta description',
        suggestion: 'Add a compelling meta description to improve click-through rates',
        currentValue: null,
        recommendedValue: 'Description based on content summary',
      });
    } else if (
      analysis.seoMetrics.metaDescription.length < 120 ||
      analysis.seoMetrics.metaDescription.length > 160
    ) {
      recommendations.push({
        type: 'description',
        severity: 'medium',
        message: `Meta description length is ${analysis.seoMetrics.metaDescription.length} characters`,
        suggestion: 'Keep meta description between 120-160 characters',
        currentValue: analysis.seoMetrics.metaDescription,
        recommendedValue: 'Optimize description length',
      });
    }

    // Check headings structure
    if (analysis.structure.headings.length === 0) {
      recommendations.push({
        type: 'structure',
        severity: 'high',
        message: 'No headings found',
        suggestion: 'Add proper heading structure (H1, H2, H3) for better content organization',
        currentValue: null,
        recommendedValue: 'Add heading hierarchy',
      });
    } else {
      const h1Count = analysis.structure.headings.filter(h => h.level === 1).length;
      if (h1Count === 0) {
        recommendations.push({
          type: 'structure',
          severity: 'high',
          message: 'Missing H1 tag',
          suggestion: 'Add exactly one H1 tag as the main page heading',
          currentValue: '0 H1 tags',
          recommendedValue: '1 H1 tag',
        });
      } else if (h1Count > 1) {
        recommendations.push({
          type: 'structure',
          severity: 'medium',
          message: `Multiple H1 tags found (${h1Count})`,
          suggestion: 'Use only one H1 tag per page',
          currentValue: `${h1Count} H1 tags`,
          recommendedValue: '1 H1 tag',
        });
      }
    }

    // Check content length
    if (analysis.wordCount < 300) {
      recommendations.push({
        type: 'content',
        severity: 'medium',
        message: `Content is short (${analysis.wordCount} words)`,
        suggestion: 'Consider adding more comprehensive content (300+ words)',
        currentValue: `${analysis.wordCount} words`,
        recommendedValue: '300+ words',
      });
    }

    // Check images
    const imagesWithoutAlt = analysis.structure.images.filter(
      img => !img.currentAlt || img.currentAlt.length === 0
    );
    if (imagesWithoutAlt.length > 0) {
      recommendations.push({
        type: 'images',
        severity: 'medium',
        message: `${imagesWithoutAlt.length} images without alt text`,
        suggestion: 'Add descriptive alt text to all images for accessibility and SEO',
        currentValue: `${imagesWithoutAlt.length} images missing alt`,
        recommendedValue: 'Alt text for all images',
      });
    }

    // Check keyword usage
    if (analysis.keywords.length === 0) {
      recommendations.push({
        type: 'keywords',
        severity: 'medium',
        message: 'No significant keywords identified',
        suggestion: 'Ensure content includes relevant keywords for your target audience',
        currentValue: '0 keywords',
        recommendedValue: 'Include relevant keywords',
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall SEO score
   */
  private calculateSeoScore(
    analysis: ContentAnalysis,
    _recommendations: SeoRecommendation[]
  ): {
    overall: number;
    breakdown: Record<string, number>;
  } {
    const breakdown: Record<string, number> = {};

    // Title score (0-20 points)
    let titleScore = 0;
    if (analysis.seoMetrics.titleTag) {
      titleScore = 10;
      const length = analysis.seoMetrics.titleTag.length;
      if (length >= 30 && length <= 60) {
        titleScore = 20;
      } else if (length >= 20 && length <= 70) {
        titleScore = 15;
      }
    }
    breakdown.title = titleScore;

    // Description score (0-20 points)
    let descriptionScore = 0;
    if (analysis.seoMetrics.metaDescription) {
      descriptionScore = 10;
      const length = analysis.seoMetrics.metaDescription.length;
      if (length >= 120 && length <= 160) {
        descriptionScore = 20;
      } else if (length >= 100 && length <= 180) {
        descriptionScore = 15;
      }
    }
    breakdown.description = descriptionScore;

    // Content score (0-25 points)
    let contentScore = 0;
    if (analysis.wordCount > 0) {
      contentScore = Math.min(25, Math.floor(analysis.wordCount / 50));
      if (analysis.wordCount >= 300) {
        contentScore = Math.min(25, contentScore + 5);
      }
    }
    breakdown.content = contentScore;

    // Structure score (0-20 points)
    let structureScore = 0;
    const h1Count = analysis.structure.headings.filter(h => h.level === 1).length;
    if (h1Count === 1) {
      structureScore += 10;
    }
    if (analysis.structure.headings.length > 1) {
      structureScore += 5;
    }
    if (analysis.structure.headings.length > 3) {
      structureScore += 5;
    }
    breakdown.structure = structureScore;

    // Technical score (0-15 points)
    let technicalScore = 0;
    const imagesWithAlt = analysis.structure.images.filter(
      img => img.currentAlt && img.currentAlt.length > 0
    );
    const imageAltRatio =
      analysis.structure.images.length > 0
        ? imagesWithAlt.length / analysis.structure.images.length
        : 1;
    technicalScore += Math.floor(imageAltRatio * 10);

    if (analysis.keywords.length > 0) {
      technicalScore += 5;
    }
    breakdown.technical = technicalScore;

    const overall = titleScore + descriptionScore + contentScore + structureScore + technicalScore;

    return { overall, breakdown };
  }

  /**
   * Build AI context for content generation
   */
  private buildAiContext(analysis: ContentAnalysis, type: string): AiContext {
    return {
      analysis,
      metadata: {},
      target: type as 'title' | 'description' | 'keywords' | 'altText',
      context: {
        audience: 'general',
        purpose: 'seo',
      },
    };
  }

  /**
   * Build AI prompt for content generation
   */
  private buildAiPrompt(
    analysis: ContentAnalysis,
    type: 'title' | 'description' | 'keywords' | 'content',
    options: GenerationOptions
  ): string {
    const basePrompt = `Generate SEO-optimized ${type} for content with ${analysis.wordCount} words in ${analysis.language}.`;

    switch (type) {
      case 'title':
        return `${basePrompt}
        
Keywords: ${analysis.keywords.slice(0, 5).join(', ')}
Current title: ${analysis.seoMetrics.titleTag ?? 'None'}

Generate 3-5 compelling, SEO-friendly titles (30-60 characters each) that incorporate the main keywords.`;

      case 'description':
        return `${basePrompt}
        
Keywords: ${analysis.keywords.slice(0, 5).join(', ')}
Current description: ${analysis.seoMetrics.metaDescription ?? 'None'}
Content summary: ${analysis.textContent.substring(0, 200)}...

Generate 3-5 engaging meta descriptions (120-160 characters each) that summarize the content and encourage clicks.`;

      case 'keywords':
        return `${basePrompt}
        
Current keywords: ${analysis.keywords.join(', ')}
Content: ${analysis.textContent.substring(0, 500)}...

Generate 10-15 relevant SEO keywords and phrases that would help this content rank better.`;

      case 'content':
        return `${basePrompt}
        
Title: ${analysis.seoMetrics.titleTag}
Keywords: ${analysis.keywords.slice(0, 5).join(', ')}
Current headings: ${analysis.structure.headings.map(h => h.text).join(', ')}

Generate ${options.contentLength ?? 'additional'} content suggestions that would improve the SEO value of this page.`;

      default:
        return basePrompt;
    }
  }

  /**
   * Parse AI response into structured suggestions
   */
  private parseAiResponse(response: string, _type: string): string[] {
    // Simple parsing - split by newlines and clean up
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*/))
      .filter(line => line.length > 10) // Filter out very short responses
      .slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Generate fallback suggestions when AI is not available
   */
  private generateFallbackSuggestions(
    analysis: ContentAnalysis,
    type: 'title' | 'description' | 'keywords' | 'content'
  ): string[] {
    switch (type) {
      case 'title':
        return [
          `${analysis.keywords[0] ?? 'Guide'}: Complete Guide`,
          `How to ${analysis.keywords[0] ?? 'Succeed'} - Expert Tips`,
          `${analysis.keywords[0] ?? 'Ultimate'} ${analysis.keywords[1] ?? 'Resource'}`,
        ];

      case 'description':
        return [
          `Learn about ${analysis.keywords.slice(0, 2).join(' and ')} in this comprehensive guide.`,
          `Discover everything you need to know about ${analysis.keywords[0] ?? 'this topic'}.`,
        ];

      case 'keywords':
        return analysis.frequentWords.slice(0, 10).map(item => item.word);

      case 'content':
        return [
          'Add more detailed explanations of key concepts',
          'Include relevant examples and case studies',
          'Add frequently asked questions section',
        ];

      default:
        return [];
    }
  }

  /**
   * Analyze multiple documents in batch
   *
   * Efficiently processes multiple HTML documents and returns SEO analysis for each
   *
   * @param documents - Array of documents to analyze
   * @param options - Batch processing options
   * @returns Array of SEO results
   *
   * @example
   * ```typescript
   * const seoManager = new SeoManager(config);
   * const documents = [
   *   { id: '1', content: htmlContent1, metadata: { title: 'Page 1' } },
   *   { id: '2', content: htmlContent2, metadata: { title: 'Page 2' } }
   * ];
   * const results = await seoManager.analyzeBatch(documents);
   * ```
   */
  async analyzeBatch(
    documents: Array<{
      id: string;
      content: string;
      metadata?: ContentMetadata;
    }>,
    options: {
      fast?: boolean;
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<
    Array<{
      id: string;
      result: SeoResult;
      error?: Error;
    }>
  > {
    const concurrency = options.concurrency ?? 5;
    const results: Array<{
      id: string;
      result: SeoResult;
      error?: Error;
    }> = [];
    let completed = 0;

    // Process in chunks
    for (let i = 0; i < documents.length; i += concurrency) {
      const chunk = documents.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async doc => {
        try {
          // Analyze document
          const analyzeOptions = options.fast !== undefined ? { fast: options.fast } : {};
          this.analyze(doc.content, doc.metadata, analyzeOptions);
          const result = this.getResult();

          if (!result) {
            throw new Error('Analysis failed to produce result');
          }

          completed++;
          if (options.onProgress) {
            options.onProgress(completed, documents.length);
          }

          return {
            id: doc.id,
            result,
          };
        } catch (error) {
          completed++;
          if (options.onProgress) {
            options.onProgress(completed, documents.length);
          }

          return {
            id: doc.id,
            result: {
              analysis: this.contentAnalyzer.analyze('', {}),
              recommendations: [],
              score: { overall: 0, breakdown: {} },
              meta: {
                analyzedAt: new Date(),
                processingTime: 0,
                version: '1.0.0',
                config: this.config,
              },
            },
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Generate SEO data for multiple documents using AI
   *
   * Batch processes multiple documents and generates titles, descriptions, keywords for each
   *
   * @param documents - Array of analyzed documents
   * @param options - Generation options
   * @returns Map of document ID to generated SEO data
   *
   * @example
   * ```typescript
   * const seoManager = new SeoManager(config, aiProvider);
   * const seoData = await seoManager.generateBatch(
   *   [{ id: '1', analysis: analysis1 }, { id: '2', analysis: analysis2 }],
   *   { types: ['title', 'description'] }
   * );
   * ```
   */
  async generateBatch(
    documents: Array<{
      id: string;
      analysis: ContentAnalysis;
    }>,
    options: {
      types?: Array<'title' | 'description' | 'keywords'>;
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<
    Map<
      string,
      {
        title?: string[];
        description?: string[];
        keywords?: string[];
        error?: Error;
      }
    >
  > {
    if (!this.aiProvider) {
      throw new Error('AI provider required for batch generation');
    }

    const types = options.types ?? ['title', 'description', 'keywords'];
    const concurrency = options.concurrency ?? 3;
    const results = new Map<
      string,
      {
        title?: string[];
        description?: string[];
        keywords?: string[];
        error?: Error;
      }
    >();

    let completed = 0;

    // Process in chunks
    for (let i = 0; i < documents.length; i += concurrency) {
      const chunk = documents.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async doc => {
        const generatedData: {
          title?: string[];
          description?: string[];
          keywords?: string[];
          error?: Error;
        } = {};

        try {
          // Generate for each type
          for (const type of types) {
            const suggestions = await this.generateSuggestions(doc.analysis, type);
            generatedData[type] = suggestions;
          }

          completed++;
          if (options.onProgress) {
            options.onProgress(completed, documents.length);
          }
        } catch (error) {
          generatedData.error = error instanceof Error ? error : new Error(String(error));
          completed++;
          if (options.onProgress) {
            options.onProgress(completed, documents.length);
          }
        }

        return { id: doc.id, data: generatedData };
      });

      const chunkResults = await Promise.all(chunkPromises);
      for (const { id, data } of chunkResults) {
        results.set(id, data);
      }
    }

    return results;
  }
}
