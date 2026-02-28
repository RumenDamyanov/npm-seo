import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  XAiConfig,
} from '../../types/AiTypes';

/**
 * Minimal type surface for the OpenAI-compatible SDK used by xAI.
 */
interface XAiChatCompletion {
  model: string;
  choices: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface XAiChatCompletions {
  create(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
    n?: number;
  }): Promise<XAiChatCompletion>;
}

interface XAiModels {
  list(): Promise<unknown>;
}

interface XAiClient {
  chat: { completions: XAiChatCompletions };
  models: XAiModels;
}

interface XAiApiError {
  status?: number;
  message?: string;
}

interface XAiConstructor {
  new (params: { apiKey: string; baseURL?: string }): XAiClient;
}

// Lazy import for xAI SDK (when available)
// Currently xAI uses OpenAI-compatible API
let OpenAI: XAiConstructor | null = null;
try {
  const mod = require('openai') as { default?: XAiConstructor } & XAiConstructor;
  OpenAI = mod.default ?? mod;
} catch {
  // OpenAI SDK not installed, will use mock mode
  OpenAI = null;
}

/**
 * xAI provider implementation for Grok models
 *
 * xAI uses an OpenAI-compatible API, so we use the OpenAI SDK
 * with a custom base URL
 *
 * @example
 * ```typescript
 * // Real API mode
 * const provider = new XAiProvider({
 *   apiKey: process.env.XAI_API_KEY,
 *   model: 'grok-2-latest',
 * });
 *
 * // Mock mode (for testing)
 * const provider = new XAiProvider({
 *   apiKey: 'mock-key',
 *   mockMode: true,
 * });
 * ```
 */
export class XAiProvider extends BaseAiProvider {
  public readonly name = 'xai';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: false, // Grok doesn't support images yet
    supportsStreaming: true,
    supportsFunctionCalling: true,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 150000,
      requestsPerDay: 1000,
    },
  };

  private config: XAiConfig;
  private client: XAiClient | null = null;
  private mockMode: boolean;

  constructor(config: XAiConfig) {
    super();
    this.config = config;
    // Only enable mock mode if explicitly requested or if OpenAI SDK is not available
    this.mockMode = config.mockMode === true || config.mock === true || (config.mockMode !== false && config.mock !== false && !OpenAI);

    // Initialize xAI client (using OpenAI SDK with custom base URL)
    if (!this.mockMode && OpenAI && config.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseUrl ?? 'https://api.x.ai/v1',
        });
      } catch {
        this.client = null;
      }
    }
  }

  /**
   * Get the model name for this provider
   * Default to Grok-2 (latest stable model)
   * Alternatives: grok-2-mini (faster, cheaper)
   */
  public getModelName(): string {
    return this.config.model ?? 'grok-2-latest';
  }

  /**
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
  }

  /**
   * Check if xAI is available
   */
  async isAvailable(): Promise<boolean> {
    if (this.mockMode) {
      return true; // Mock mode is always available
    }

    if (!this.client) {
      return false;
    }

    try {
      // Test API by listing models
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate content using xAI Grok
   *
   * Automatically uses mock mode if:
   * - OpenAI SDK not installed
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
      // Real xAI API call (using OpenAI-compatible endpoint)
      const completion = await this.client.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: 'system',
            content:
              'You are Grok, an AI assistant by xAI. You are helpful, witty, and provide excellent SEO advice.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens ?? 500,
        temperature: request.temperature ?? 0.7,
        n: 1,
      });

      const processingTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content ?? '';
      const alternatives = this.extractAlternatives(content);

      return {
        content,
        alternatives: alternatives ?? [],
        usage: {
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
          totalTokens: completion.usage?.total_tokens ?? 0,
        },
        meta: {
          model: completion.model,
          provider: this.name,
          generatedAt: new Date(),
          processingTime,
        },
      };
    } catch (error: unknown) {
      const err = error as XAiApiError;
      // Handle specific xAI errors
      if (err.status === 401) {
        throw new Error('xAI API key is invalid');
      } else if (err.status === 429) {
        throw new Error('xAI rate limit exceeded. Please try again later.');
      } else if (err.status === 500 || err.status === 503) {
        throw new Error('xAI service is temporarily unavailable');
      }

      throw new Error(`xAI API error: ${err.message ?? 'Unknown error'}`);
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
   * @private
   */
  private generateMockResponse(request: AiGenerationRequest): string {
    // Generate appropriate mock content based on prompt
    if (request.prompt.includes('title')) {
      return "Grok's Guide to SEO: Witty Strategies for Search Domination";
    }
    if (request.prompt.includes('description')) {
      return "Discover Grok's unique take on SEO optimization. Learn witty, effective strategies that actually work for improving your search engine rankings.";
    }
    if (request.prompt.includes('keywords')) {
      return 'SEO strategies, search domination, Grok AI, witty optimization, search rankings, xAI';
    }
    return 'Mock Grok-generated content for SEO optimization';
  }

  /**
   * Extract alternatives from response content
   * @protected
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
