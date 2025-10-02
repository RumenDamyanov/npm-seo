import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  AnthropicConfig,
} from '../../types/AiTypes';

/**
 * Anthropic AI provider implementation
 * Currently uses mock responses for development
 */
export class AnthropicProvider extends BaseAiProvider {
  public readonly name = 'anthropic';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 200000,
    maxOutputTokens: 8192,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: true,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    rateLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
      requestsPerDay: 1000,
    },
  };
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    super();
    this.config = config;
  }

  /**
   * Get the model name for this provider
   * Updated to Claude 4 Sonnet (2025) - balanced performance and cost
   * Alternatives: claude-4-opus-20250101 (most capable), claude-4-haiku-20250101 (fastest)
   */
  protected getModelName(): string {
    return this.config.model ?? 'claude-4-sonnet-20250101';
  }

  /**
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
  }

  /**
   * Check if Anthropic is available
   */
  isAvailable(): Promise<boolean> {
    return Promise.resolve(Boolean(this.config.apiKey));
  }

  /**
   * Generate content using Anthropic
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
      version: this.getVersion(),
    });
  }

  /**
   * Generate mock response for development/testing
   */
  private generateMockResponse(request: AiGenerationRequest): string {
    // Generate appropriate mock content based on prompt
    if (request.prompt.includes('title')) {
      return 'Advanced SEO Strategies: Complete Guide to Search Engine Dominance';
    }
    if (request.prompt.includes('description')) {
      return 'Master advanced SEO techniques with our comprehensive guide covering technical optimization, content strategy, and proven tactics for achieving search engine dominance.';
    }
    if (request.prompt.includes('keywords')) {
      return 'advanced SEO, search engine optimization, technical SEO, content strategy, search rankings, organic traffic';
    }
    return 'Mock Claude-generated content for SEO optimization';
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
