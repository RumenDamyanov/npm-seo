/**
 * Next.js integration for @rumenx/seo
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { SeoManager } from '../../core/SeoManager';
import type { SeoConfig } from '../../types/SeoTypes';

/**
 * Next.js SEO integration helper
 */
export class NextSeo {
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
   * Create Next.js API route handler for SEO analysis
   */
  createApiHandler() {
    return (req: NextApiRequest, res: NextApiResponse): void => {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

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

        res.status(200).json({
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

  /**
   * Generate meta tags for Next.js Head component
   */
  generateMetaTags(analysis: ReturnType<SeoManager['analyze']>): Array<{
    name: string;
    content: string;
  }> {
    const metaTags: Array<{ name: string; content: string }> = [];

    if (analysis?.analysis?.seoMetrics?.titleTag) {
      metaTags.push({
        name: 'title',
        content: analysis.analysis.seoMetrics.titleTag,
      });
    }

    if (analysis?.analysis?.seoMetrics?.metaDescription) {
      metaTags.push({
        name: 'description',
        content: analysis.analysis.seoMetrics.metaDescription,
      });
    }

    if (analysis?.analysis?.keywords?.length > 0) {
      metaTags.push({
        name: 'keywords',
        content: analysis.analysis.keywords.slice(0, 10).join(', '),
      });
    }

    return metaTags;
  }

  /**
   * Generate structured data for SEO
   */
  generateStructuredData(
    analysis: ReturnType<SeoManager['analyze']>,
    url?: string
  ): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: url ?? '',
      name: analysis?.analysis?.seoMetrics?.titleTag ?? '',
      description: analysis?.analysis?.seoMetrics?.metaDescription ?? '',
    };

    return structuredData;
  }
}
