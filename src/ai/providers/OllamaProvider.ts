import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  OllamaConfig,
} from '../../types/AiTypes';

/**
 * Ollama provider implementation
 * Currently uses mock responses for development
 */
export class OllamaProvider extends BaseAiProvider {
  public readonly name = 'ollama';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 2048,
    maxOutputTokens: 1024,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: false,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    rateLimits: {
      requestsPerMinute: 100,
      tokensPerMinute: 10000,
    },
  };
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    super();
    this.config = config;
  }

  /**
   * Get the model name for this provider
   */
  protected getModelName(): string {
    return this.config.model;
  }

  /**
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
  }

  /**
   * Check if Ollama is available
   */
  isAvailable(): Promise<boolean> {
    // For mock implementation, check if URL and model are configured
    return Promise.resolve(Boolean(this.config.apiUrl && this.config.model));
  }

  /**
   * Generate content using Ollama
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
      available: Boolean(this.config.apiUrl && this.config.model),
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
      return 'Local SEO Excellence: Complete Guide to Regional Search Success';
    }
    if (request.prompt.includes('description')) {
      return 'Achieve local SEO excellence with this complete guide to regional search success. Learn location-based optimization strategies and community engagement tactics.';
    }
    if (request.prompt.includes('keywords')) {
      return 'local SEO, regional search, location optimization, community engagement, local business, geographical targeting';
    }
    return 'Mock Ollama-generated content for SEO optimization';
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
