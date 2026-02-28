import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  AnthropicConfig,
} from '../../types/AiTypes';

/**
 * Minimal type surface for the Anthropic SDK.
 */
interface AnthropicMessage {
  id: string;
  model: string;
  content: Array<{ text: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface AnthropicMessages {
  create(params: {
    model: string;
    max_tokens: number;
    temperature?: number;
    messages: Array<{ role: string; content: string }>;
  }): Promise<AnthropicMessage>;
}

interface AnthropicClient {
  messages: AnthropicMessages;
}

interface AnthropicApiError {
  status?: number;
  message?: string;
}

interface AnthropicConstructor {
  new (params: { apiKey: string }): AnthropicClient;
}

// Lazy import Anthropic to avoid requiring it when not needed
let Anthropic: AnthropicConstructor | null = null;
try {
  const mod = require('@anthropic-ai/sdk') as {
    default?: AnthropicConstructor;
  } & AnthropicConstructor;
  Anthropic = mod.default ?? mod;
} catch {
  // Anthropic SDK not installed, will use mock mode
  Anthropic = null;
}

/**
 * Anthropic AI provider implementation with real API integration
 *
 * Supports Claude 4 models with real API calls and mock mode for testing
 *
 * @example
 * ```typescript
 * // Real API mode
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-4-sonnet-20250101',
 * });
 *
 * // Mock mode (for testing)
 * const provider = new AnthropicProvider({
 *   apiKey: 'mock-key',
 *   mockMode: true,
 * });
 * ```
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
  private client: AnthropicClient | null = null;
  private mockMode: boolean;

  constructor(config: AnthropicConfig) {
    super();
    this.config = config;

    // Only enable mock mode if explicitly requested or if Anthropic SDK is not available
    this.mockMode = config.mockMode === true || config.mock === true || (config.mockMode !== false && config.mock !== false && !Anthropic);

    // Initialize Anthropic client if not in mock mode
    if (!this.mockMode && Anthropic && config.apiKey) {
      try {
        this.client = new Anthropic({
          apiKey: config.apiKey,
        });
      } catch {
        this.client = null;
      }
    }
  }

  /**
   * Get the model name for this provider
   * Updated to Claude 4 Sonnet (2025) - balanced performance and cost
   * Alternatives: claude-4-opus-20250101 (most capable), claude-4-haiku-20250101 (fastest)
   */
  public getModelName(): string {
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
  async isAvailable(): Promise<boolean> {
    if (this.mockMode) {
      return true; // Mock mode is always available
    }

    if (!this.client) {
      return false;
    }

    // Anthropic doesn't have a simple health check, so we just verify client exists
    return true;
  }

  /**
   * Generate content using Anthropic Claude
   *
   * Automatically uses mock mode if:
   * - Anthropic SDK not installed
   * - No API key provided
   * - mockMode explicitly enabled
   *
   * @throws {Error} If API call fails (not in mock mode)
   */
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const startTime = Date.now();

    // Use mock mode if configured or client not available
    if (this.mockMode || !this.client) {
      return this.generateMock(request, startTime);
    }

    try {
      // Real Anthropic API call
      const message = await this.client.messages.create({
        model: this.getModelName(),
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      });

      const processingTime = Date.now() - startTime;
      const content = message.content[0]?.text ?? '';
      const alternatives = this.extractAlternatives(content);

      return {
        content,
        alternatives: alternatives ?? [],
        usage: {
          promptTokens: message.usage?.input_tokens ?? 0,
          completionTokens: message.usage?.output_tokens ?? 0,
          totalTokens: (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0),
        },
        meta: {
          model: message.model,
          provider: this.name,
          generatedAt: new Date(),
          processingTime,
          requestId: message.id,
        },
      };
    } catch (error: unknown) {
      const err = error as AnthropicApiError;
      // Handle specific Anthropic errors
      if (err.status === 401) {
        throw new Error('Anthropic API key is invalid');
      } else if (err.status === 429) {
        throw new Error('Anthropic rate limit exceeded. Please try again later.');
      } else if (err.status === 500 || err.status === 529) {
        throw new Error('Anthropic service is temporarily unavailable');
      }

      throw new Error(`Anthropic API error: ${err.message ?? 'Unknown error'}`);
    }
  }

  /**
   * Generate mock response for testing
   * @private
   */
  private generateMock(request: AiGenerationRequest, startTime: number): AiGenerationResponse {
    const content = this.generateMockResponse(request);
    const processingTime = Date.now() - startTime;
    const alternatives = this.extractAlternatives(content);

    return {
      content,
      alternatives: alternatives ?? [],
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((request.prompt.length + content.length) / 4),
      },
      meta: {
        model: `${this.getModelName()} (mock)`,
        provider: this.name,
        generatedAt: new Date(),
        processingTime,
      },
    };
  }

  /**
   * Get provider status and health
   */
  override async getStatus(): Promise<{
    available: boolean;
    model: string;
    version?: string;
    mockMode?: boolean;
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
      mockMode: this.mockMode,
    };
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
