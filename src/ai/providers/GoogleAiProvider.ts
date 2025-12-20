import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  GoogleAiConfig,
} from '../../types/AiTypes';

// Lazy import Google Generative AI to avoid requiring it when not needed
let GoogleGenerativeAI: any;
try {
  const module = require('@google/generative-ai');
  GoogleGenerativeAI = module.GoogleGenerativeAI;
} catch {
  // Google AI SDK not installed, will use mock mode
  GoogleGenerativeAI = null;
}

/**
 * Google AI provider implementation with real Gemini API integration
 *
 * Supports Gemini 1.5 Pro and other models with real API calls and mock mode for testing
 *
 * @example
 * ```typescript
 * // Real API mode
 * const provider = new GoogleAiProvider({
 *   apiKey: process.env.GOOGLE_AI_API_KEY,
 *   model: 'gemini-1.5-pro-latest',
 * });
 *
 * // Mock mode (for testing)
 * const provider = new GoogleAiProvider({
 *   apiKey: 'mock-key',
 *   mockMode: true,
 * });
 * ```
 */
export class GoogleAiProvider extends BaseAiProvider {
  public readonly name = 'google';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: true,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 1000000,
      requestsPerDay: 1500,
    },
  };

  private config: GoogleAiConfig;
  private client: any | null = null;
  private mockMode: boolean;

  constructor(config: GoogleAiConfig) {
    super();
    this.config = config;
    this.mockMode = (config as any).mockMode === true || !GoogleGenerativeAI || !config.apiKey;

    // Initialize Google AI client if not in mock mode
    if (!this.mockMode && GoogleGenerativeAI) {
      try {
        this.client = new GoogleGenerativeAI(config.apiKey);
      } catch (error) {
        console.warn('Failed to initialize Google AI client, falling back to mock mode:', error);
        this.mockMode = true;
      }
    }
  }

  /**
   * Get the model name for this provider
   * Updated to Gemini 1.5 Pro (latest stable) - massive context window
   * Alternatives: gemini-1.5-flash (faster), gemini-2.0-flash-exp (experimental)
   */
  protected getModelName(): string {
    return this.config.model ?? 'gemini-1.5-pro-latest';
  }

  /**
   * Get the provider version
   */
  protected getVersion(): string {
    return '1.0.0';
  }

  /**
   * Check if Google AI is available
   */
  async isAvailable(): Promise<boolean> {
    if (this.mockMode) {
      return true; // Mock mode is always available
    }

    if (!this.client) {
      return false;
    }

    // Google AI doesn't have a simple health check, so we just verify client exists
    return true;
  }

  /**
   * Generate content using Google Gemini
   *
   * Automatically uses mock mode if:
   * - Google AI SDK not installed
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
      // Get the generative model
      const model = this.client.getGenerativeModel({ model: this.getModelName() });

      // Generate content
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.7,
        },
      });

      const response = await result.response;
      const processingTime = Date.now() - startTime;
      const content = response.text();
      const alternatives = this.extractAlternatives(content);

      // Extract token usage if available
      const usageMetadata = response.usageMetadata || {};

      return {
        content,
        alternatives: alternatives ?? [],
        usage: {
          promptTokens: usageMetadata.promptTokenCount ?? 0,
          completionTokens: usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: usageMetadata.totalTokenCount ?? 0,
        },
        meta: {
          model: this.getModelName(),
          provider: this.name,
          generatedAt: new Date(),
          processingTime,
        },
      };
    } catch (error: any) {
      // Handle specific Google AI errors
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Google AI API key is invalid');
      } else if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error('Google AI rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('SERVICE_UNAVAILABLE')) {
        throw new Error('Google AI service is temporarily unavailable');
      }

      throw new Error(`Google AI API error: ${error.message || 'Unknown error'}`);
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
        model: this.getModelName() + ' (mock)',
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
      return 'Ultimate SEO Mastery: Proven Techniques for Top Search Rankings';
    }
    if (request.prompt.includes('description')) {
      return 'Discover the ultimate SEO mastery techniques used by top-ranking websites. Learn proven strategies for content optimization, technical SEO, and sustainable growth.';
    }
    if (request.prompt.includes('keywords')) {
      return 'SEO mastery, search rankings, content optimization, technical SEO, website growth, digital marketing';
    }
    return 'Mock Gemini-generated content for SEO optimization';
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
