import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  OpenAiConfig,
} from '../../types/AiTypes';

/**
 * Minimal type surface for the OpenAI SDK.
 */
interface ChatCompletion {
  model: string;
  choices: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface ChatCompletions {
  create(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
    n?: number;
  }): Promise<ChatCompletion>;
}

interface OpenAiModels {
  list(): Promise<unknown>;
}

interface OpenAiClient {
  chat: { completions: ChatCompletions };
  models: OpenAiModels;
}

interface OpenAiApiError {
  status?: number;
  message?: string;
}

interface OpenAiConstructor {
  new (params: { apiKey: string; organization?: string; baseURL?: string }): OpenAiClient;
}

// Lazy import OpenAI to avoid requiring it when not needed
let OpenAI: OpenAiConstructor | null = null;
try {
  const mod = require('openai') as { default?: OpenAiConstructor } & OpenAiConstructor;
  OpenAI = mod.default ?? mod;
} catch {
  // OpenAI not installed, will use mock mode
  OpenAI = null;
}

/**
 * OpenAI provider implementation with real API integration
 *
 * Supports both real API calls and mock mode for testing
 *
 * @example
 * ```typescript
 * // Real API mode
 * const provider = new OpenAiProvider({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4.1-turbo',
 * });
 *
 * // Mock mode (for testing)
 * const provider = new OpenAiProvider({
 *   apiKey: 'mock-key',
 *   mockMode: true,
 * });
 * ```
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
  private client: OpenAiClient | null = null;
  private mockMode: boolean;

  constructor(config: OpenAiConfig) {
    super();
    this.config = config;
    // Only enable mock mode if explicitly requested or if OpenAI SDK is not available
    this.mockMode = config.mockMode === true || !OpenAI;

    // Initialize OpenAI client if not in mock mode
    if (!this.mockMode && OpenAI && config.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: config.apiKey,
          ...(config.organization && { organization: config.organization }),
        });
      } catch {
        this.client = null;
      }
    }
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
   * Generate content using OpenAI
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
      // Real OpenAI API call
      const completion = await this.client.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert assistant helping to optimize web content.',
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
      const err = error as OpenAiApiError;
      // Handle specific OpenAI errors
      if (err.status === 401) {
        throw new Error('OpenAI API key is invalid');
      } else if (err.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (err.status === 500 || err.status === 503) {
        throw new Error('OpenAI service is temporarily unavailable');
      }

      throw new Error(`OpenAI API error: ${err.message ?? 'Unknown error'}`);
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
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
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
