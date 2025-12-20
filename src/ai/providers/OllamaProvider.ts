import { BaseAiProvider } from '../BaseAiProvider';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProviderCapabilities,
  OllamaConfig,
} from '../../types/AiTypes';

/**
 * Ollama provider implementation for local AI models
 * 
 * Connects to local Ollama instance for running models like Llama, Qwen, Mistral, etc.
 * 
 * @example
 * ```typescript
 * // Real API mode (local Ollama)
 * const provider = new OllamaProvider({
 *   apiUrl: 'http://localhost:11434',
 *   model: 'llama3.3',
 * });
 * 
 * // Mock mode (for testing)
 * const provider = new OllamaProvider({
 *   apiUrl: 'http://localhost:11434',
 *   model: 'llama3.3',
 *   mockMode: true,
 * });
 * ```
 */
export class OllamaProvider extends BaseAiProvider {
  public readonly name = 'ollama';
  public readonly capabilities: AiProviderCapabilities = {
    maxInputTokens: 8192, // Depends on model, but most support at least 8K
    maxOutputTokens: 2048,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    supportsImageAnalysis: false, // Some models support it, but not all
    supportsStreaming: true,
    supportsFunctionCalling: false,
    rateLimits: {
      requestsPerMinute: 1000, // No real rate limits for local
      tokensPerMinute: 100000,
    },
  };
  
  private config: OllamaConfig;
  private mockMode: boolean;

  constructor(config: OllamaConfig) {
    super();
    this.config = config;
    this.mockMode = (config as any).mockMode === true;
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
  async isAvailable(): Promise<boolean> {
    if (this.mockMode) {
      return true; // Mock mode is always available
    }
    
    if (!this.config.apiUrl || !this.config.model) {
      return false;
    }
    
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.config.apiUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout ?? 5000),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      // Check if the specified model is available
      const models = data.models || [];
      return models.some((m: any) => m.name.includes(this.config.model));
    } catch {
      return false;
    }
  }

  /**
   * Generate content using Ollama
   * 
   * Connects to local Ollama instance for generation
   * Automatically uses mock mode if mockMode is enabled
   * 
   * @throws {Error} If API call fails (not in mock mode)
   */
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const startTime = Date.now();

    // Use mock mode if configured
    if (this.mockMode) {
      return this.generateMock(request, startTime);
    }

    try {
      // Real Ollama API call
      const response = await fetch(`${this.config.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: request.prompt,
          stream: false, // We want the complete response
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.maxTokens ?? 1024,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 60000),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      const content = data.response || '';
      const alternatives = this.extractAlternatives(content);

      return {
        content,
        alternatives: alternatives ?? [],
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        meta: {
          model: data.model || this.config.model,
          provider: this.name,
          generatedAt: new Date(),
          processingTime,
        },
      };
    } catch (error: any) {
      // Handle Ollama-specific errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Ollama request timed out. The model may be loading or the request is too complex.');
      } else if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('Could not connect to Ollama. Make sure Ollama is running at ' + this.config.apiUrl);
      } else if (error.message?.includes('model not found')) {
        throw new Error(`Model "${this.config.model}" not found. Pull it with: ollama pull ${this.config.model}`);
      }
      
      throw new Error(`Ollama error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate mock response for testing
   * @private
   */
  private generateMock(
    request: AiGenerationRequest,
    startTime: number
  ): AiGenerationResponse {
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
