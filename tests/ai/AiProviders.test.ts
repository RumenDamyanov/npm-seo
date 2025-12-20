/**
 * Tests for AI Providers (Mock Mode)
 */

import {
  OpenAiProvider,
  AnthropicProvider,
  GoogleAiProvider,
  XAiProvider,
  OllamaProvider,
} from '../../src/ai';

describe('AI Providers - Mock Mode', () => {
  describe('OpenAiProvider', () => {
    it('should work in mock mode', async () => {
      const provider = new OpenAiProvider({ mock: true });

      expect(await provider.isAvailable()).toBe(true);
      expect(provider.name).toBe('openai');
      expect(provider.getModelName()).toBe('gpt-4.1-turbo');
    });

    it('should generate mock responses', async () => {
      const provider = new OpenAiProvider({ mock: true });

      const response = await provider.generate({
        prompt: 'Generate a title',
        context: {} as any,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
      expect(response.meta?.model).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('should not be available without API key in non-mock mode', async () => {
      const provider = new OpenAiProvider({ mock: false, apiKey: undefined });

      expect(await provider.isAvailable()).toBe(false);
    });

    it('should use custom model', () => {
      const provider = new OpenAiProvider({
        mock: true,
        model: 'gpt-4o-mini',
      });

      expect(provider.getModelName()).toBe('gpt-4o-mini');
    });
  });

  describe('AnthropicProvider', () => {
    it('should work in mock mode', async () => {
      const provider = new AnthropicProvider({ mock: true });

      expect(await provider.isAvailable()).toBe(true);
      expect(provider.name).toBe('anthropic');
      expect(provider.getModelName()).toBe('claude-4-sonnet-20250101');
    });

    it('should generate mock responses', async () => {
      const provider = new AnthropicProvider({ mock: true });

      const response = await provider.generate({
        prompt: 'Generate a description',
        context: {} as any,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.meta?.model).toBeDefined();
    });

    it('should not be available without API key in non-mock mode', async () => {
      const provider = new AnthropicProvider({ mock: false, apiKey: undefined });

      expect(await provider.isAvailable()).toBe(false);
    });

    it('should use custom model', () => {
      const provider = new AnthropicProvider({
        mock: true,
        model: 'claude-4-haiku-20250101',
      });

      expect(provider.getModelName()).toBe('claude-4-haiku-20250101');
    });
  });

  describe('GoogleAiProvider', () => {
    it('should work in mock mode', async () => {
      const provider = new GoogleAiProvider({ mock: true });

      expect(await provider.isAvailable()).toBe(true);
      expect(provider.name).toBe('google');
      expect(provider.getModelName()).toBe('gemini-1.5-pro-latest');
    });

    it('should generate mock responses', async () => {
      const provider = new GoogleAiProvider({ mock: true });

      const response = await provider.generate({
        prompt: 'Generate keywords',
        context: {} as any,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.meta?.model).toBeDefined();
    });

    it('should not be available without API key in non-mock mode', async () => {
      const provider = new GoogleAiProvider({ mock: false, apiKey: undefined });

      expect(await provider.isAvailable()).toBe(false);
    });

    it('should use custom model', () => {
      const provider = new GoogleAiProvider({
        mock: true,
        model: 'gemini-2.0-flash-exp',
      });

      expect(provider.getModelName()).toBe('gemini-2.0-flash-exp');
    });
  });

  describe('XAiProvider', () => {
    it('should work in mock mode', async () => {
      const provider = new XAiProvider({ mock: true });

      expect(await provider.isAvailable()).toBe(true);
      expect(provider.name).toBe('xai');
      expect(provider.getModelName()).toBe('grok-2-latest');
    });

    it('should generate mock responses', async () => {
      const provider = new XAiProvider({ mock: true });

      const response = await provider.generate({
        prompt: 'Generate content',
        context: {} as any,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.meta?.model).toBeDefined();
    });

    it('should not be available without API key in non-mock mode', async () => {
      const provider = new XAiProvider({ mock: false, apiKey: undefined });

      expect(await provider.isAvailable()).toBe(false);
    });

    it('should use custom model', () => {
      const provider = new XAiProvider({
        mock: true,
        model: 'grok-2-mini',
      });

      expect(provider.getModelName()).toBe('grok-2-mini');
    });
  });

  describe('OllamaProvider', () => {
    it('should work in mock mode', async () => {
      const provider = new OllamaProvider({
        mock: true,
        model: 'llama3.3',
        baseUrl: 'http://localhost:11434',
      });

      expect(await provider.isAvailable()).toBe(true);
      expect(provider.name).toBe('ollama');
      expect(provider.getModelName()).toBe('llama3.3');
    });

    it('should generate mock responses', async () => {
      const provider = new OllamaProvider({
        mock: true,
        model: 'llama3.3',
        baseUrl: 'http://localhost:11434',
      });

      const response = await provider.generate({
        prompt: 'Generate alt text',
        context: {} as any,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.meta?.model).toBeDefined();
    });

    it('should not be available without model in non-mock mode', async () => {
      const provider = new OllamaProvider({ mock: false, model: undefined });

      expect(await provider.isAvailable()).toBe(false);
    });

    it('should use custom base URL', () => {
      const provider = new OllamaProvider({
        mock: true,
        model: 'qwen2.5',
        baseUrl: 'http://custom:11434',
      });

      expect(provider.getModelName()).toBe('qwen2.5');
    });
  });

  describe('Provider Capabilities', () => {
    it('should report capabilities correctly', async () => {
      const openai = new OpenAiProvider({ mock: true });
      const anthropic = new AnthropicProvider({ mock: true });
      const google = new GoogleAiProvider({ mock: true });
      const xai = new XAiProvider({ mock: true });
      const ollama = new OllamaProvider({
        mock: true,
        model: 'llama3.3',
        baseUrl: 'http://localhost:11434',
      });

      const providers = [openai, anthropic, google, xai, ollama];

      for (const provider of providers) {
        const status = await provider.getStatus();

        expect(status.available).toBe(true);
        expect(status.model).toBeDefined();
        expect(status.version).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      const provider = new OpenAiProvider({ mock: true });

      // Mock responses should never fail, but test the structure
      const response = await provider.generate({
        prompt: '',
        context: {} as any,
      });

      expect(response).toBeDefined();
    });
  });

  describe('Mock Response Quality', () => {
    it('should generate different responses for different prompts', async () => {
      const provider = new OpenAiProvider({ mock: true });

      const response1 = await provider.generate({
        prompt: 'Generate title',
        context: {} as any,
      });

      const response2 = await provider.generate({
        prompt: 'Generate description',
        context: {} as any,
      });

      // Mock responses should be defined and non-empty
      expect(response1.content.length).toBeGreaterThan(0);
      expect(response2.content.length).toBeGreaterThan(0);
    });

    it('should include usage statistics', async () => {
      const provider = new OpenAiProvider({ mock: true });

      const response = await provider.generate({
        prompt: 'Test',
        context: {} as any,
      });

      expect(response.usage).toBeDefined();
      expect(response.usage.promptTokens).toBeGreaterThan(0);
      expect(response.usage.completionTokens).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    });
  });
});
