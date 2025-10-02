import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  OpenAiConfig,
} from '../../types/AiTypes';

/**
 * OpenAI provider implementation
 * Currently uses mock responses for development
 */
export class OpenAiProvider extends BaseAiProvider {
  public readonly name = 'openai';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: true,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 150000,
      requestsPerDay: 1000,
    },
  };
  private config: OpenAiConfig;

  constructor(config: OpenAiConfig) {
    super();
    this.config = config;
  }

  /**
   * Get the model name for this provider
   * Updated to GPT-4.1 Turbo (2025) - best balance of performance and cost
   * Alternatives: gpt-4.1 (standard), gpt-4o-mini (cost-effective)
   */
  protected getModelName(): string {
    return this.config.model ?? 'gpt-4.1-turbo';
  }

  /**
   * Check if OpenAI is available
   */
  isAvailable(): Promise<boolean> {
    return Promise.resolve(Boolean(this.config.apiKey));
  }

  /**
   * Generate content using OpenAI
   */
  generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const startTime = Date.now();

    const content = this.generateMockResponse(request);
    const processingTime = Date.now() - startTime;
    const alternatives = this.extractAlternatives(content);

    return Promise.resolve({
      content,
      alternatives: alternatives ?? [],
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((request.prompt.length + content.length) / 4),
      },
      meta: {
        model: this.getModelName(),
        provider: this.name,
        generatedAt: new Date(),
        processingTime,
      },
    });
  }

  /**
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get provider status and health
   */
  override getStatus(): Promise<{
    available: boolean;
    model: string;
    version?: string;
    usage?: {
      current: number;
      limit: number;
      resetAt?: Date;
    };
  }> {
    return Promise.resolve({
      available: Boolean(this.config.apiKey),
      model: this.getModelName(),
      version: '1.0.0',
    });
  }

  /**
   * Generate mock response for development/testing
   */
  private generateMockResponse(request: AiGenerationRequest): string {
    // Generate appropriate mock content based on prompt
    if (request.prompt.includes('title')) {
      return 'Optimize Your Website SEO: Complete Guide to Higher Rankings';
    }
    if (request.prompt.includes('description')) {
      return 'Learn how to improve your website SEO with proven strategies, technical optimization, and content best practices for better search engine rankings.';
    }
    if (request.prompt.includes('keywords')) {
      return 'SEO optimization, search engine rankings, website optimization, technical SEO, content marketing, keyword research';
    }
    return 'Mock AI-generated content for SEO optimization';
  }

  /**
   * Extract alternatives from response content
   */
  protected extractAlternatives(content: string): string[] | undefined {
    // Look for numbered lists
    const numberedMatches = content.match(/^\d+\.\s+(.+)$/gm);
    if (numberedMatches && numberedMatches.length > 1) {
      return numberedMatches.map(match => match.replace(/^\d+\.\s+/, '').trim());
    }

    // Look for bullet points
    const bulletMatches = content.match(/^[-*•]\s+(.+)$/gm);
    if (bulletMatches && bulletMatches.length > 1) {
      return bulletMatches.map(match => match.replace(/^[-*•]\s+/, '').trim());
    }

    // Look for comma-separated items (keywords)
    if (content.includes(',') && content.length < 200) {
      const items = content
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      if (items.length > 1) {
        return items;
      }
    }

    return undefined;
  }
}
