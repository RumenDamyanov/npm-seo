/**
 * AI-powered SEO analysis and suggestions (Rule-based Implementation)
 */

import type { ContentAnalysis } from '../types/ContentTypes';
import type { SeoResult } from '../types/SeoTypes';
import type {
  AiSeoAnalysis,
  AiSeoConfig,
  AiSeoSuggestion,
  AiSeoSuggestionGroup,
  AiSeoSuggestionType,
  AiSuggestionPriority,
} from '../types/AiSeoTypes';

/**
 * AI-powered SEO analyzer using rule-based intelligence
 */
export class AiSeoAnalyzer {
  private config: Required<AiSeoConfig>;
  private processingStats = {
    totalAnalyses: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
  };

  constructor(config: AiSeoConfig = {}) {
    this.config = {
      preferredProvider: config.preferredProvider ?? 'rules-based',
      enableCaching: config.enableCaching ?? true,
      cacheTtl: config.cacheTtl ?? 24 * 60 * 60 * 1000, // 24 hours
      maxSuggestionsPerType: config.maxSuggestionsPerType ?? 5,
      includeCodeExamples: config.includeCodeExamples ?? true,
      timeout: config.timeout ?? 30000,
      customTemplates: config.customTemplates ?? [],
    };
  }

  /**
   * Analyze SEO and generate AI-powered suggestions
   */
  analyzeSeo(
    contentAnalysis: ContentAnalysis,
    seoResult: SeoResult,
    options: { focusAreas?: AiSeoSuggestionType[] } = {}
  ): AiSeoAnalysis {
    const startTime = Date.now();

    // Determine focus areas based on analysis
    const focusAreas = options.focusAreas ?? this.determineFocusAreas(contentAnalysis, seoResult);

    // Generate suggestions for each focus area
    const suggestionGroups: AiSeoSuggestionGroup[] = [];
    const allSuggestions: AiSeoSuggestion[] = [];

    for (const focusArea of focusAreas) {
      const suggestions = this.generateSuggestionsByType(contentAnalysis, seoResult, focusArea);
      if (suggestions.length > 0) {
        const group: AiSeoSuggestionGroup = {
          type: focusArea,
          typeName: this.getTypeDisplayName(focusArea),
          suggestions,
          overallPriority: this.calculateOverallPriority(suggestions),
          totalImpact: this.calculateTotalImpact(suggestions),
        };
        suggestionGroups.push(group);
        allSuggestions.push(...suggestions);
      }
    }

    // Generate overall analysis
    const overallScore = this.calculateOverallScore(allSuggestions, seoResult);
    const summary = this.generateSummary(allSuggestions);
    const topRecommendations = this.extractTopRecommendations(allSuggestions);

    const processingTime = Date.now() - startTime;
    const analysis: AiSeoAnalysis = {
      overallScore,
      summary,
      topRecommendations,
      suggestionGroups,
      allSuggestions,
      meta: {
        provider: this.config.preferredProvider,
        model: 'seo-analyzer-v1',
        analyzedAt: new Date(),
        processingTime,
        suggestionCount: allSuggestions.length,
      },
    };

    // Update stats
    this.updateProcessingStats(processingTime);

    return analysis;
  }

  /**
   * Determine focus areas based on SEO analysis
   */
  private determineFocusAreas(
    contentAnalysis: ContentAnalysis,
    seoResult: SeoResult
  ): AiSeoSuggestionType[] {
    const focusAreas: AiSeoSuggestionType[] = [];

    // Content issues
    if (contentAnalysis.wordCount < 300) {
      focusAreas.push('content');
    }

    // Meta tags - check for title and description
    if (!seoResult.title || !seoResult.description) {
      focusAreas.push('meta');
    }

    // Structure - check if we have headings
    if (!contentAnalysis.structure.headings || contentAnalysis.structure.headings.length === 0) {
      focusAreas.push('structure');
    }

    // Images - check for images without alt text
    if (contentAnalysis.structure.images?.some(img => !img.currentAlt)) {
      focusAreas.push('images');
    }

    // Technical
    focusAreas.push('technical');

    // Keywords
    if (!seoResult.keywords || seoResult.keywords.length < 5) {
      focusAreas.push('keywords');
    }

    // Default to content and technical if nothing specific found
    if (focusAreas.length === 0) {
      focusAreas.push('content', 'technical');
    }

    return focusAreas.slice(0, 5); // Limit to 5 focus areas
  }

  /**
   * Generate suggestions for a specific type
   */
  private generateSuggestionsByType(
    contentAnalysis: ContentAnalysis,
    seoResult: SeoResult,
    type: AiSeoSuggestionType
  ): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    switch (type) {
      case 'technical':
        suggestions.push(...this.generateTechnicalSuggestions(seoResult));
        break;
      case 'content':
        suggestions.push(...this.generateContentSuggestions(contentAnalysis, seoResult));
        break;
      case 'keywords':
        suggestions.push(...this.generateKeywordSuggestions(seoResult));
        break;
      case 'structure':
        suggestions.push(...this.generateStructureSuggestions(contentAnalysis));
        break;
      case 'meta':
        suggestions.push(...this.generateMetaSuggestions(seoResult));
        break;
      case 'images':
        suggestions.push(...this.generateImageSuggestions(contentAnalysis));
        break;
      case 'links':
        suggestions.push(...this.generateLinkSuggestions(contentAnalysis));
        break;
      default:
        break;
    }

    return suggestions.slice(0, this.config.maxSuggestionsPerType);
  }

  /**
   * Generate technical SEO suggestions
   */
  private generateTechnicalSuggestions(seoResult: SeoResult): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    // Check if viewport meta tag exists in meta tags
    const hasViewport = seoResult.metaTags.some(tag => tag.attributes?.name === 'viewport');

    if (!hasViewport) {
      suggestions.push({
        id: 'tech-viewport-1',
        type: 'technical',
        title: 'Add Viewport Meta Tag',
        description: 'Missing viewport meta tag for mobile responsiveness.',
        priority: 'high',
        actionSteps: ['Add viewport meta tag to head section'],
        impact: 'High - Essential for mobile SEO',
        effort: 'low',
        codeExample: '<meta name="viewport" content="width=device-width, initial-scale=1">',
        confidence: 0.9,
      });
    }

    return suggestions;
  }

  /**
   * Generate content SEO suggestions
   */
  private generateContentSuggestions(
    contentAnalysis: ContentAnalysis,
    _seoResult: SeoResult
  ): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    if (contentAnalysis.wordCount < 300) {
      suggestions.push({
        id: 'content-length-1',
        type: 'content',
        title: 'Increase Content Length',
        description: `Your content has only ${contentAnalysis.wordCount} words. Aim for at least 300 words for better SEO.`,
        priority: 'medium',
        actionSteps: [
          'Add more detailed explanations',
          'Include examples and use cases',
          'Expand on key topics',
          'Add relevant sections',
        ],
        impact: 'Medium - Longer content often ranks better',
        effort: 'high',
        confidence: 0.8,
      });
    }

    return suggestions;
  }

  /**
   * Generate keyword SEO suggestions
   */
  private generateKeywordSuggestions(seoResult: SeoResult): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    if (!seoResult.keywords || seoResult.keywords.length < 5) {
      suggestions.push({
        id: 'keywords-density-1',
        type: 'keywords',
        title: 'Optimize Keyword Usage',
        description:
          'Limited keyword presence detected. Focus on relevant keywords throughout your content.',
        priority: 'high',
        actionSteps: [
          'Research relevant keywords for your topic',
          'Include keywords naturally in content',
          'Use keywords in headings and subheadings',
          'Maintain 1-2% keyword density',
        ],
        impact: 'High - Keywords are essential for search visibility',
        effort: 'medium',
        confidence: 0.8,
      });
    }

    return suggestions;
  }

  /**
   * Generate structure SEO suggestions
   */
  private generateStructureSuggestions(contentAnalysis: ContentAnalysis): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    const h1Headings = contentAnalysis.structure.headings.filter(h => h.level === 1);

    if (h1Headings.length !== 1) {
      suggestions.push({
        id: 'structure-h1-1',
        type: 'structure',
        title: 'Fix H1 Heading Structure',
        description:
          h1Headings.length === 0
            ? 'Missing H1 heading.'
            : 'Multiple H1 headings found. Use only one H1 per page.',
        priority: 'high',
        actionSteps: [
          'Ensure exactly one H1 tag per page',
          'Make H1 descriptive and include main keyword',
          'Use H2-H6 for subheadings in hierarchical order',
        ],
        impact: 'High - Proper heading structure improves SEO',
        effort: 'low',
        codeExample: '<h1>Your Main Page Title</h1>',
        confidence: 0.9,
      });
    }

    return suggestions;
  }

  /**
   * Generate meta tag SEO suggestions
   */
  private generateMetaSuggestions(seoResult: SeoResult): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    if (!seoResult.title || seoResult.title.length < 10) {
      suggestions.push({
        id: 'meta-title-1',
        type: 'meta',
        title: 'Improve Page Title',
        description: 'Page title is missing or too short. Add a descriptive title tag.',
        priority: 'critical',
        actionSteps: ['Add title tag in head section'],
        impact: 'Critical - Title is the most important SEO element',
        effort: 'low',
        codeExample: '<title>Your Page Title - Brand Name</title>',
        confidence: 0.95,
      });
    }

    if (!seoResult.description || seoResult.description.length < 50) {
      suggestions.push({
        id: 'meta-description-1',
        type: 'meta',
        title: 'Improve Meta Description',
        description:
          'Meta description is missing or too short. Add a compelling description for search results.',
        priority: 'high',
        actionSteps: ['Add meta description tag with 150-160 characters'],
        impact: 'High - Meta description affects click-through rates',
        effort: 'low',
        codeExample: '<meta name="description" content="Your page description here">',
        confidence: 0.9,
      });
    }

    return suggestions;
  }

  /**
   * Generate image SEO suggestions
   */
  private generateImageSuggestions(contentAnalysis: ContentAnalysis): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    const imagesWithoutAlt = contentAnalysis.structure.images.filter(
      img => !img.currentAlt || img.currentAlt.trim() === ''
    );

    if (imagesWithoutAlt.length > 0) {
      suggestions.push({
        id: 'images-alt-1',
        type: 'images',
        title: 'Add Alt Text to Images',
        description: `${imagesWithoutAlt.length} images are missing alt text. Add descriptive alt attributes.`,
        priority: 'medium',
        actionSteps: [
          'Add alt attributes to all images',
          'Make alt text descriptive and concise',
          'Include keywords naturally when relevant',
        ],
        impact: 'Medium - Alt text improves accessibility and SEO',
        effort: 'low',
        codeExample: '<img src="image.jpg" alt="Descriptive text about the image">',
        confidence: 0.8,
      });
    }

    return suggestions;
  }

  /**
   * Generate link SEO suggestions
   */
  private generateLinkSuggestions(contentAnalysis: ContentAnalysis): AiSeoSuggestion[] {
    const suggestions: AiSeoSuggestion[] = [];

    const externalLinks = contentAnalysis.structure.links.filter(link => link.isExternal);

    if (externalLinks.length < 3) {
      suggestions.push({
        id: 'links-external-1',
        type: 'links',
        title: 'Add External Links',
        description: 'Consider adding relevant external links to authoritative sources.',
        priority: 'low',
        actionSteps: [
          'Link to authoritative sources',
          'Use descriptive anchor text',
          'Open external links in new tab',
        ],
        impact: 'Low - External links can add credibility',
        effort: 'low',
        confidence: 0.6,
      });
    }

    return suggestions;
  }

  /**
   * Calculate overall priority for a group of suggestions
   */
  private calculateOverallPriority(suggestions: AiSeoSuggestion[]): AiSuggestionPriority {
    if (suggestions.some(s => s.priority === 'critical')) return 'critical';
    if (suggestions.some(s => s.priority === 'high')) return 'high';
    if (suggestions.some(s => s.priority === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Calculate total impact for a group of suggestions
   */
  private calculateTotalImpact(suggestions: AiSeoSuggestion[]): string {
    const impacts = suggestions.map(s => s.impact);
    if (impacts.some(i => i.toLowerCase().includes('critical'))) return 'Critical impact';
    if (impacts.some(i => i.toLowerCase().includes('high'))) return 'High impact';
    if (impacts.some(i => i.toLowerCase().includes('medium'))) return 'Medium impact';
    return 'Low impact';
  }

  /**
   * Calculate overall SEO score
   */
  private calculateOverallScore(suggestions: AiSeoSuggestion[], _seoResult: SeoResult): number {
    const criticalIssues = suggestions.filter(s => s.priority === 'critical').length;
    const highIssues = suggestions.filter(s => s.priority === 'high').length;
    const mediumIssues = suggestions.filter(s => s.priority === 'medium').length;

    let baseScore = 100;
    baseScore -= criticalIssues * 20;
    baseScore -= highIssues * 10;
    baseScore -= mediumIssues * 5;

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  /**
   * Generate analysis summary
   */
  private generateSummary(suggestions: AiSeoSuggestion[]): string {
    const criticalCount = suggestions.filter(s => s.priority === 'critical').length;
    const highCount = suggestions.filter(s => s.priority === 'high').length;
    const totalCount = suggestions.length;

    if (criticalCount > 0) {
      return `Found ${totalCount} SEO improvement opportunities, including ${criticalCount} critical issues that need immediate attention.`;
    } else if (highCount > 0) {
      return `Found ${totalCount} SEO improvement opportunities, with ${highCount} high-priority issues to address.`;
    } else if (totalCount > 0) {
      return `Found ${totalCount} SEO improvement opportunities to enhance your page's search visibility.`;
    }

    return 'Your page has good SEO fundamentals. Consider advanced optimizations for further improvement.';
  }

  /**
   * Extract top recommendations
   */
  private extractTopRecommendations(suggestions: AiSeoSuggestion[]): string[] {
    return suggestions
      .filter(s => s.priority === 'critical' || s.priority === 'high')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3)
      .map(s => s.title);
  }

  /**
   * Get display name for suggestion type
   */
  private getTypeDisplayName(type: AiSeoSuggestionType): string {
    const names: Record<AiSeoSuggestionType, string> = {
      technical: 'Technical SEO',
      content: 'Content Optimization',
      keywords: 'Keyword Strategy',
      structure: 'HTML Structure',
      performance: 'Performance',
      accessibility: 'Accessibility',
      meta: 'Meta Tags',
      schema: 'Schema Markup',
      links: 'Link Building',
      images: 'Image Optimization',
    };
    return names[type] || type;
  }

  /**
   * Update processing statistics
   */
  private updateProcessingStats(processingTime: number): void {
    this.processingStats.totalAnalyses++;
    this.processingStats.totalProcessingTime += processingTime;
    this.processingStats.averageProcessingTime =
      this.processingStats.totalProcessingTime / this.processingStats.totalAnalyses;
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): typeof this.processingStats {
    return { ...this.processingStats };
  }
}
