/**
 * Fastify integration for @rumenx/seo
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SeoManager } from '../../core/SeoManager';
import type { SeoConfig } from '../../types/SeoTypes';

/**
 * Fastify SEO plugin
 */
export class FastifySeo {
  private seoManager: SeoManager;

  constructor(config: SeoConfig) {
    this.seoManager = new SeoManager(config);
  }

  /**
   * Analyze content for SEO
   */
  analyzeContent(content: string): ReturnType<SeoManager['analyze']> {
    return this.seoManager.analyze(content);
  }

  /**
   * Create Fastify plugin
   */
  createPlugin() {
    return (fastify: FastifyInstance): void => {
      // Add SEO analysis route
      fastify.post(
        '/seo/analyze',
        async (
          request: FastifyRequest<{ Body: { content?: string } }>,
          reply: FastifyReply
        ): Promise<void> => {
          try {
            const { content } = request.body;

            if (!content || typeof content !== 'string') {
              await reply.status(400).send({
                success: false,
                error: 'Content is required',
              });
              return;
            }

            const analysis = this.analyzeContent(content);

            await reply.send({
              success: true,
              data: analysis,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            await reply.status(500).send({
              success: false,
              error: error instanceof Error ? error.message : 'Analysis failed',
            });
          }
        }
      );

      // Add health check route
      fastify.get(
        '/seo/health',
        async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
          await reply.send({
            success: true,
            service: '@rumenx/seo Fastify Plugin',
            version: '1.0.0',
            status: 'healthy',
          });
        }
      );
    };
  }
}
