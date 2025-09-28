import type {
  IAiProvider,
  AiProviderFactoryConfig,
  AiGenerationRequest,
  AiGenerationResponse,
} from '../types/AiTypes';
import type { AiContext, ImageContext } from '../types/ContentTypes';
import { OpenAiProvider } from './providers/OpenAiProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GoogleAiProvider } from './providers/GoogleAiProvider';
import { OllamaProvider } from './providers/OllamaProvider';

/**
 * AI provider factory with fallback support
 */
export class AiProviderFactory {
  private primaryProvider: IAiProvider;
  private fallbackProviders: IAiProvider[] = [];
  private config: AiProviderFactoryConfig;

  constructor(config: AiProviderFactoryConfig) {
    this.config = config;
    this.primaryProvider = this.createProvider(config.primary);

    if (config.fallbacks) {
      this.fallbackProviders = config.fallbacks.map(fallback => this.createProvider(fallback));
    }
  }

  /**
   * Create provider instance based on configuration
   */
  private createProvider(providerConfig: AiProviderFactoryConfig['primary']): IAiProvider {
    switch (providerConfig.provider) {
      case 'openai':
        return new OpenAiProvider(providerConfig.config);
      case 'anthropic':
        return new AnthropicProvider(providerConfig.config);
      case 'google':
        return new GoogleAiProvider(providerConfig.config);
      case 'ollama':
        return new OllamaProvider(providerConfig.config);
      default:
        throw new Error('Unsupported provider configuration');
    }
  }

  /**
   * Get primary provider
   */
  getPrimaryProvider(): IAiProvider {
    return this.primaryProvider;
  }

  /**
   * Get all available providers
   */
  getAllProviders(): IAiProvider[] {
    return [this.primaryProvider, ...this.fallbackProviders];
  }

  /**
   * Execute with fallback strategy
   */
  private async executeWithFallback<T>(
    operation: (provider: IAiProvider) => Promise<T>
  ): Promise<T> {
    const providers = this.getAllProviders();
    let lastError: Error | undefined;

    for (const provider of providers) {
      try {
        return await operation(provider);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If auto-retry is disabled, don't continue with fallbacks
        if (!this.config.autoRetry) {
          break;
        }
      }
    }

    throw lastError ?? new Error('All providers failed');
  }

  /**
   * Generate title with fallback support
   */
  async generateTitle(context: AiContext): Promise<AiGenerationResponse> {
    return this.executeWithFallback(provider => provider.generateTitle(context));
  }

  /**
   * Generate description with fallback support
   */
  async generateDescription(context: AiContext): Promise<AiGenerationResponse> {
    return this.executeWithFallback(provider => provider.generateDescription(context));
  }

  /**
   * Generate keywords with fallback support
   */
  async generateKeywords(context: AiContext): Promise<AiGenerationResponse> {
    return this.executeWithFallback(provider => provider.generateKeywords(context));
  }

  /**
   * Generate alt text with fallback support
   */
  async generateAltText(context: ImageContext): Promise<AiGenerationResponse> {
    return this.executeWithFallback(provider => provider.generateAltText(context));
  }

  /**
   * Custom generation with fallback support
   */
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    return this.executeWithFallback(provider => provider.generate(request));
  }

  /**
   * Get factory status including all providers
   */
  async getStatus(): Promise<{
    primary: {
      name: string;
      available: boolean;
    };
    fallbacks: Array<{
      name: string;
      available: boolean;
    }>;
    healthy: number;
    total: number;
  }> {
    const primaryStatus = await this.primaryProvider.getStatus();

    const fallbackStatuses = await Promise.all(
      this.fallbackProviders.map(async provider => {
        const status = await provider.getStatus();
        return {
          name: provider.name,
          available: status.available,
        };
      })
    );

    const totalProviders = 1 + this.fallbackProviders.length;
    const healthyProviders =
      (primaryStatus.available ? 1 : 0) +
      fallbackStatuses.filter(status => status.available).length;

    return {
      primary: {
        name: this.primaryProvider.name,
        available: primaryStatus.available,
      },
      fallbacks: fallbackStatuses,
      healthy: healthyProviders,
      total: totalProviders,
    };
  }
}
