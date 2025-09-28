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
 */
export class SeoManager {
  private config: SeoConfig;
  private contentAnalyzer: ContentAnalyzer;
  private aiProvider: IAiProvider | undefined;

  constructor(config: SeoConfig, aiProvider?: IAiProvider) {
    this.config = config;
    this.contentAnalyzer = new ContentAnalyzer(config.baseUrl);
    this.aiProvider = aiProvider;
  }

  /**
   * Analyze content and generate SEO recommendations
   */
  analyze(
    content: string,
    metadata: ContentMetadata = {},
    options: { fast?: boolean } = {}
  ): SeoResult {
    const startTime = Date.now();

    // Analyze content
    const analysis = options.fast
      ? this.contentAnalyzer.analyzeFast(content, metadata)
      : this.contentAnalyzer.analyze(content, metadata);

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis, metadata);

    // Calculate SEO score
    const score = this.calculateSeoScore(analysis, recommendations);

    const processingTime = Date.now() - startTime;

    return {
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
   * Update configuration
   */
  updateConfig(newConfig: Partial<SeoConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.contentAnalyzer = new ContentAnalyzer(this.config.baseUrl);
  }

  /**
   * Set AI provider
   */
  setAiProvider(provider: IAiProvider): void {
    this.aiProvider = provider;
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
}
