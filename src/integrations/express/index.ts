/**
 * Express.js integration for @rumenx/seo
 *
 * Basic utility class for integrating SEO analysis into Express applications
 */

import type { Request, Response } from 'express';
import { SeoManager } from '../../core/SeoManager';
import type { SeoConfig } from '../../types/SeoTypes';

/**
 * Express SEO integration helper
 */
export class ExpressSeo {
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
   * Example Express route handler for SEO analysis API
   */
  createAnalysisHandler() {
    return (req: Request, res: Response): void => {
      try {
        const { content } = req.body as { content?: string };

        if (!content || typeof content !== 'string') {
          res.status(400).json({
            success: false,
            error: 'Content is required',
          });
          return;
        }

        const analysis = this.analyzeContent(content);

        res.json({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
        });
      }
    };
  }
}
