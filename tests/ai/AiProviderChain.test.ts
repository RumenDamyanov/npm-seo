/**
 * Tests for AiProviderChain
 */

import { AiProviderChain } from '../../src/ai/AiProviderChain';
import type { IAiProvider, AiGenerationResponse } from '../../src/types/AiTypes';

// Mock AI Provider
class MockProvider implements IAiProvider {
  constructor(
    public name: string,
    private shouldFail: boolean = false,
    private delay: number = 0
  ) {}

  async generate(): Promise<AiGenerationResponse> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }

    return {
      content: `Response from ${this.name}`,
      model: 'mock-model',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }

  isAvailable(): boolean {
    return !this.shouldFail;
  }

  getModelName(): string {
    return 'mock-model';
  }

  getVersion(): string {
    return '1.0.0';
  }
}

describe('AiProviderChain', () => {
  describe('Basic Functionality', () => {
    it('should use first available provider', async () => {
      const providers = [
        new MockProvider('provider1'),
        new MockProvider('provider2'),
        new MockProvider('provider3'),
      ];

      const chain = new AiProviderChain({ providers });

      const response = await chain.generate('test prompt');

      expect(response.content).toBe('Response from provider1');
    });

    it('should fallback to next provider on failure', async () => {
      const providers = [
        new MockProvider('provider1', true), // Fails
        new MockProvider('provider2'), // Succeeds
        new MockProvider('provider3'),
      ];

      const chain = new AiProviderChain({ providers, maxRetries: 1 });

      const response = await chain.generate('test prompt');

      expect(response.content).toBe('Response from provider2');
    });

    it('should try all providers before failing', async () => {
      const providers = [
        new MockProvider('provider1', true),
        new MockProvider('provider2', true),
        new MockProvider('provider3', true),
      ];

      const chain = new AiProviderChain({ providers, maxRetries: 1 });

      await expect(chain.generate('test prompt')).rejects.toThrow('All AI providers failed');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed providers', async () => {
      let attempts = 0;
      const provider = {
        name: 'flaky-provider',
        generate: jest.fn(async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return {
            content: 'Success after retries',
            model: 'mock',
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          };
        }),
        isAvailable: () => true,
        getModelName: () => 'mock',
        getVersion: () => '1.0.0',
      };

      const chain = new AiProviderChain({
        providers: [provider as IAiProvider],
        maxRetries: 3,
      });

      const response = await chain.generate('test prompt');

      expect(response.content).toBe('Success after retries');
      expect(attempts).toBe(3);
    });

    it('should respect maxRetries limit', async () => {
      const provider = {
        name: 'always-fails',
        generate: jest.fn(async () => {
          throw new Error('Always fails');
        }),
        isAvailable: () => true,
        getModelName: () => 'mock',
        getVersion: () => '1.0.0',
      };

      const chain = new AiProviderChain({
        providers: [provider as IAiProvider],
        maxRetries: 2,
      });

      await expect(chain.generate('test prompt')).rejects.toThrow();

      expect(provider.generate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout slow providers', async () => {
      const providers = [
        new MockProvider('slow-provider', false, 5000), // 5 second delay
        new MockProvider('fast-provider'), // Immediate
      ];

      const chain = new AiProviderChain({
        providers,
        timeout: 1000, // 1 second timeout
        maxRetries: 1,
      });

      const response = await chain.generate('test prompt');

      expect(response.content).toBe('Response from fast-provider');
    }, 10000);
  });

  describe('Callbacks', () => {
    it('should call onProviderFailed callback', async () => {
      const onProviderFailed = jest.fn();

      const providers = [new MockProvider('provider1', true), new MockProvider('provider2')];

      const chain = new AiProviderChain({
        providers,
        maxRetries: 1,
        onProviderFailed,
      });

      await chain.generate('test prompt');

      expect(onProviderFailed).toHaveBeenCalledWith('provider1', expect.any(Error));
    });

    it('should call onProviderSuccess callback', async () => {
      const onProviderSuccess = jest.fn();

      const providers = [new MockProvider('provider1')];

      const chain = new AiProviderChain({
        providers,
        onProviderSuccess,
      });

      await chain.generate('test prompt');

      expect(onProviderSuccess).toHaveBeenCalledWith(
        'provider1',
        expect.objectContaining({
          content: 'Response from provider1',
        })
      );
    });
  });

  describe('Statistics', () => {
    it('should track statistics', async () => {
      const providers = [new MockProvider('provider1', true), new MockProvider('provider2')];

      const chain = new AiProviderChain({ providers, maxRetries: 1 });

      await chain.generate('test prompt');
      await chain.generate('test prompt');

      const stats = chain.getStats();

      expect(stats.totalRequests).toBe(2);
      expect(stats.successfulRequests).toBe(2);
      expect(stats.failedRequests).toBe(0);
      expect(stats.providerUsage.get('provider2')).toBe(2);
      expect(stats.providerFailures.get('provider1')).toBeGreaterThan(0);
    });

    it('should reset statistics', async () => {
      const providers = [new MockProvider('provider1')];
      const chain = new AiProviderChain({ providers });

      await chain.generate('test prompt');

      chain.resetStats();

      const stats = chain.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.successfulRequests).toBe(0);
    });
  });

  describe('Provider Management', () => {
    it('should add provider', () => {
      const chain = new AiProviderChain({
        providers: [new MockProvider('provider1')],
      });

      chain.addProvider(new MockProvider('provider2'));

      const available = chain.getAvailableProviders();
      expect(available).toContain('provider1');
      expect(available).toContain('provider2');
    });

    it('should add provider at specific priority', () => {
      const chain = new AiProviderChain({
        providers: [new MockProvider('provider1'), new MockProvider('provider2')],
      });

      chain.addProvider(new MockProvider('provider3'), 0);

      const available = chain.getAvailableProviders();
      expect(available[0]).toBe('provider3');
    });

    it('should remove provider', () => {
      const chain = new AiProviderChain({
        providers: [new MockProvider('provider1'), new MockProvider('provider2')],
      });

      const removed = chain.removeProvider('provider1');

      expect(removed).toBe(true);
      expect(chain.getAvailableProviders()).not.toContain('provider1');
    });

    it('should get provider by name', () => {
      const provider1 = new MockProvider('provider1');
      const chain = new AiProviderChain({ providers: [provider1] });

      const retrieved = chain.getProvider('provider1');

      expect(retrieved).toBe(provider1);
    });

    it('should set provider priority', () => {
      const chain = new AiProviderChain({
        providers: [
          new MockProvider('provider1'),
          new MockProvider('provider2'),
          new MockProvider('provider3'),
        ],
      });

      chain.setProviderPriority('provider3', 0);

      const available = chain.getAvailableProviders();
      expect(available[0]).toBe('provider3');
    });
  });

  describe('Available Providers', () => {
    it('should only use available providers', async () => {
      const providers = [
        new MockProvider('provider1', true), // Not available
        new MockProvider('provider2'), // Available
      ];

      const chain = new AiProviderChain({ providers });

      const response = await chain.generate('test prompt');

      expect(response.content).toBe('Response from provider2');
    });

    it('should throw when no providers available', async () => {
      const providers = [new MockProvider('provider1', true), new MockProvider('provider2', true)];

      const chain = new AiProviderChain({ providers });

      await expect(chain.generate('test prompt')).rejects.toThrow('No available AI providers');
    });

    it('should list available providers', () => {
      const chain = new AiProviderChain({
        providers: [
          new MockProvider('provider1'),
          new MockProvider('provider2', true),
          new MockProvider('provider3'),
        ],
      });

      const available = chain.getAvailableProviders();

      expect(available).toContain('provider1');
      expect(available).not.toContain('provider2');
      expect(available).toContain('provider3');
    });
  });
});
