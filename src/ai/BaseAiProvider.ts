/**
 * Abstract base class for AI providers
 */

import type {
  IAiProvider,
  AiProviderCapabilities,
  AiGenerationRequest,
  AiGenerationResponse,
} from '../types/AiTypes';
import type { AiContext, ImageContext } from '../types/ContentTypes';

/**
 * Abstract base AI provider implementation
 */
export abstract class BaseAiProvider implements IAiProvider {
  abstract readonly name: string;
  abstract readonly capabilities: AiProviderCapabilities;

  /**
   * Check if the provider is available and properly configured
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Generate title suggestions
   */
  async generateTitle(context: AiContext): Promise<AiGenerationResponse> {
    const prompt = this.buildTitlePrompt(context);
    const request: AiGenerationRequest = {
      prompt,
      context,
      maxTokens: 100,
      temperature: 0.7,
    };
    return this.generate(request);
  }

  /**
   * Generate description suggestions
   */
  async generateDescription(context: AiContext): Promise<AiGenerationResponse> {
    const prompt = this.buildDescriptionPrompt(context);
    const request: AiGenerationRequest = {
      prompt,
      context,
      maxTokens: 200,
      temperature: 0.7,
    };
    return this.generate(request);
  }

  /**
   * Generate keyword suggestions
   */
  async generateKeywords(context: AiContext): Promise<AiGenerationResponse> {
    const prompt = this.buildKeywordsPrompt(context);
    const request: AiGenerationRequest = {
      prompt,
      context,
      maxTokens: 150,
      temperature: 0.5,
    };
    return this.generate(request);
  }

  /**
   * Generate alt text for images
   */
  async generateAltText(context: ImageContext): Promise<AiGenerationResponse> {
    const prompt = this.buildAltTextPrompt(context);
    const request: AiGenerationRequest = {
      prompt,
      context,
      maxTokens: 50,
      temperature: 0.5,
    };
    return this.generate(request);
  }

  /**
   * Custom generation with prompt
   */
  abstract generate(request: AiGenerationRequest): Promise<AiGenerationResponse>;

  /**
   * Get provider status
   */
  async getStatus(): Promise<{
    available: boolean;
    model: string;
    version?: string;
    usage?: {
      current: number;
      limit: number;
      resetAt?: Date;
    };
  }> {
    const available = await this.isAvailable();
    return {
      available,
      model: this.getModelName(),
      version: this.getVersion(),
    };
  }

  /**
   * Get the current model name
   */
  protected abstract getModelName(): string;

  /**
   * Get the provider version
   */
  protected abstract getVersion(): string;

  /**
   * Build title generation prompt
   */
  protected buildTitlePrompt(context: AiContext): string {
    const analysis = context.analysis;
    const currentTitle = analysis.seoMetrics.titleTag;
    const keywords = analysis.keywords.slice(0, 5).join(', ');

    return `Generate an SEO-optimized title for web content.

Content Analysis:
- Word Count: ${analysis.wordCount}
- Language: ${analysis.language}
- Keywords: ${keywords}
- Current Title: ${currentTitle ?? 'None'}

Requirements:
- 50-60 characters long
- Include primary keywords naturally
- Engaging and click-worthy
- Accurately describe the content

Generate only the title text, no additional formatting or explanations.`;
  }

  /**
   * Build description generation prompt
   */
  protected buildDescriptionPrompt(context: AiContext): string {
    const analysis = context.analysis;
    const currentDescription = analysis.seoMetrics.metaDescription;
    const keywords = analysis.keywords.slice(0, 3).join(', ');
    const contentSample = `${analysis.textContent.substring(0, 300)}...`;

    return `Generate an SEO-optimized meta description for web content.

Content Analysis:
- Word Count: ${analysis.wordCount}
- Language: ${analysis.language}
- Keywords: ${keywords}
- Current Description: ${currentDescription ?? 'None'}
- Content Sample: ${contentSample}

Requirements:
- 150-160 characters long
- Compelling and informative
- Include main keywords naturally
- Include a call-to-action if appropriate

Generate only the description text, no additional formatting or explanations.`;
  }

  /**
   * Build keywords generation prompt
   */
  protected buildKeywordsPrompt(context: AiContext): string {
    const analysis = context.analysis;
    const currentKeywords = analysis.keywords.slice(0, 10).join(', ');
    const contentSample = `${analysis.textContent.substring(0, 500)}...`;

    return `Extract and suggest relevant SEO keywords for web content.

Content Analysis:
- Word Count: ${analysis.wordCount}
- Language: ${analysis.language}
- Current Keywords: ${currentKeywords}
- Content Sample: ${contentSample}

Requirements:
- Provide 8-12 relevant keywords
- Focus on search intent
- Include long-tail keywords
- Consider semantic variations

Return keywords as a comma-separated list, no additional formatting or explanations.`;
  }

  /**
   * Build alt text generation prompt
   */
  protected buildAltTextPrompt(context: ImageContext): string {
    const url = context.url;
    const textContext = context.textContext;
    const pageContext = context.pageContext;

    return `Generate descriptive alt text for an image.

Image Context:
- Image URL: ${url}
- Page Context: ${pageContext?.title ?? 'Web page content'}
- Surrounding Text: ${textContext ?? 'No surrounding text available'}

Requirements:
- Concise but descriptive
- Under 125 characters
- Relevant to page context
- Accessible for screen readers
- Avoid "image of" or "picture of" phrases

Generate only the alt text, no additional formatting or explanations.`;
  }

  /**
   * Parse response and extract content
   */
  protected parseResponse(response: string): AiGenerationResponse {
    const content = response.trim();

    // For comma-separated responses (like keywords), split into alternatives
    const alternatives =
      content.includes(',') && content.length < 200
        ? content
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        : [];

    const result: AiGenerationResponse = {
      content,
      usage: {
        promptTokens: Math.ceil(content.length / 4), // Rough estimate
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil(content.length / 2),
      },
      meta: {
        model: this.getModelName(),
        provider: this.name,
        generatedAt: new Date(),
        processingTime: 0, // To be filled by concrete implementations
      },
    };

    // Add alternatives if they exist
    if (alternatives.length > 1) {
      result.alternatives = alternatives;
    }

    return result;
  }

  /**
   * Handle provider errors
   */
  protected handleError(error: unknown, operation: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`${this.name} AI Provider - ${operation}: ${message}`);
  }
}
