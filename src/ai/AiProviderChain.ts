/**
 * AI Provider Fallback Chain
 *
 * Implements multi-provider fallback with automatic retry
 *
 * @packageDocumentation
 */

import type { IAiProvider, AiGenerationResponse } from '../types/AiTypes';
import type { ContentAnalysis } from '../types/ContentTypes';

/**
 * Provider chain configuration
 */
export interface ProviderChainConfig {
  /**
   * List of providers in priority order
   */
  providers: IAiProvider[];

  /**
   * Maximum retry attempts per provider
   */
  maxRetries?: number;

  /**
   * Timeout per provider in milliseconds
   */
  timeout?: number;

  /**
   * Whether to try all providers or stop at first success
   */
  tryAll?: boolean;

  /**
   * Callback for provider failures
   */
  onProviderFailed?: (provider: string, error: Error) => void;

  /**
   * Callback for provider success
   */
  onProviderSuccess?: (provider: string, response: AiGenerationResponse) => void;
}

/**
 * Provider chain statistics
 */
export interface ProviderChainStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  providerUsage: Map<string, number>;
  providerFailures: Map<string, number>;
  averageResponseTime: number;
}

/**
 * AI provider fallback chain
 *
 * Automatically tries multiple providers until one succeeds
 *
 * @example
 * ```typescript
 * const chain = new AiProviderChain({
 *   providers: [openaiProvider, claudeProvider, geminiProvider],
 *   maxRetries: 2,
 *   timeout: 30000
 * });
 *
 * const response = await chain.generate('Generate a title');
 * ```
 */
export class AiProviderChain {
  private config: Required<ProviderChainConfig>;
  private stats: ProviderChainStats;

  constructor(config: ProviderChainConfig) {
    this.config = {
      providers: config.providers,
      maxRetries: config.maxRetries ?? 2,
      timeout: config.timeout ?? 30000,
      tryAll: config.tryAll ?? false,
      onProviderFailed: config.onProviderFailed ?? ((): void => {}),
      onProviderSuccess: config.onProviderSuccess ?? ((): void => {}),
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      providerUsage: new Map(),
      providerFailures: new Map(),
      averageResponseTime: 0,
    };
  }

  /**
   * Generate content with automatic fallback
   *
   * @param prompt - Generation prompt
   * @param options - Additional options for providers
   * @returns AI generation response
   * @throws Error if all providers fail
   */
  async generate(prompt: string, options?: Record<string, unknown>): Promise<AiGenerationResponse> {
    this.stats.totalRequests++;
    const startTime = Date.now();
    const errors: Array<{ provider: string; error: Error }> = [];

    // Filter available providers
    const availabilityChecks = await Promise.all(
      this.config.providers.map(async p => ({
        provider: p,
        available: await p.isAvailable(),
      }))
    );
    const availableProviders = availabilityChecks
      .filter(({ available }) => available)
      .map(({ provider }) => provider);

    if (availableProviders.length === 0) {
      this.stats.failedRequests++;
      throw new Error('No available AI providers');
    }

    // Try each provider in order
    for (const provider of availableProviders) {
      const providerName = provider.name;
      let attempts = 0;

      while (attempts < this.config.maxRetries) {
        attempts++;

        try {
          // Try to generate with timeout
          const response = await this.generateWithTimeout(provider, prompt, options);

          // Success!
          this.stats.successfulRequests++;
          this.updateProviderUsage(providerName);
          this.updateAverageResponseTime(Date.now() - startTime);
          this.config.onProviderSuccess(providerName, response);

          return response;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          errors.push({ provider: providerName, error: err });
          this.updateProviderFailures(providerName);
          this.config.onProviderFailed(providerName, err);

          // If last attempt with this provider, break to try next
          if (attempts >= this.config.maxRetries) {
            break;
          }

          // Wait before retry (exponential backoff)
          await this.sleep(Math.min(1000 * 2 ** (attempts - 1), 10000));
        }
      }
    }

    // All providers failed
    this.stats.failedRequests++;
    const errorMessages = errors.map(e => `${e.provider}: ${e.error.message}`).join('; ');
    throw new Error(`All AI providers failed. Errors: ${errorMessages}`);
  }

  /**
   * Generate with timeout
   */
  private async generateWithTimeout(
    provider: IAiProvider,
    prompt: string,
    options?: Record<string, unknown>
  ): Promise<AiGenerationResponse> {
    // Create minimal valid context for AI generation
    const emptyAnalysis: ContentAnalysis = {
      rawContent: '',
      textContent: '',
      language: 'en',
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime: 0,
      keywords: [],
      keywordDensity: {},
      frequentWords: [],
      structure: {
        headings: [],
        images: [],
        links: [],
        sections: [],
      },
      seoMetrics: {
        h1Tags: [],
        openGraphTags: {},
        twitterCardTags: {},
        structuredData: [],
      },
      meta: {
        analyzedAt: new Date(),
        processingTime: 0,
        version: '1.0.0',
        mode: 'minimal',
      },
    };

    const request = {
      prompt,
      context: {
        analysis: emptyAnalysis,
        metadata: {},
        target: 'title' as const,
      },
      ...options,
    };

    return Promise.race([provider.generate(request), this.timeoutPromise(this.config.timeout)]);
  }

  /**
   * Create a timeout promise
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Provider timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update provider usage stats
   */
  private updateProviderUsage(provider: string): void {
    const current = this.stats.providerUsage.get(provider) ?? 0;
    this.stats.providerUsage.set(provider, current + 1);
  }

  /**
   * Update provider failure stats
   */
  private updateProviderFailures(provider: string): void {
    const current = this.stats.providerFailures.get(provider) ?? 0;
    this.stats.providerFailures.set(provider, current + 1);
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const total = this.stats.successfulRequests;
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (total - 1) + responseTime) / total;
  }

  /**
   * Get chain statistics
   */
  getStats(): ProviderChainStats {
    return {
      ...this.stats,
      providerUsage: new Map(this.stats.providerUsage),
      providerFailures: new Map(this.stats.providerFailures),
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      providerUsage: new Map(),
      providerFailures: new Map(),
      averageResponseTime: 0,
    };
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): string[] {
    return this.config.providers.filter(p => p.isAvailable()).map(p => p.name);
  }

  /**
   * Add a provider to the chain
   */
  addProvider(provider: IAiProvider, priority?: number): void {
    if (priority !== undefined && priority >= 0) {
      this.config.providers.splice(priority, 0, provider);
    } else {
      this.config.providers.push(provider);
    }
  }

  /**
   * Remove a provider from the chain
   */
  removeProvider(providerName: string): boolean {
    const index = this.config.providers.findIndex(p => p.name === providerName);
    if (index !== -1) {
      this.config.providers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): IAiProvider | undefined {
    return this.config.providers.find(p => p.name === name);
  }

  /**
   * Set provider priority
   */
  setProviderPriority(providerName: string, priority: number): boolean {
    const provider = this.getProvider(providerName);
    if (!provider) {
      return false;
    }

    this.removeProvider(providerName);
    this.addProvider(provider, priority);
    return true;
  }
}
