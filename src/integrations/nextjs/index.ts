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
  analyzeContent(content: string): SeoManager {
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

        const seoManager = this.analyzeContent(content);
        const result = seoManager.getResult();

        res.status(200).json({
          success: true,
          data: result,
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
  generateMetaTags(seoManager: SeoManager): Array<{
    name: string;
    content: string;
  }> {
    const metaTags: Array<{ name: string; content: string }> = [];
    const analysis = seoManager.getAnalysis();

    if (analysis?.seoMetrics?.titleTag) {
      metaTags.push({
        name: 'title',
        content: analysis.seoMetrics.titleTag,
      });
    }

    if (analysis?.seoMetrics?.metaDescription) {
      metaTags.push({
        name: 'description',
        content: analysis.seoMetrics.metaDescription,
      });
    }

    if (analysis?.keywords && analysis.keywords.length > 0) {
      metaTags.push({
        name: 'keywords',
        content: analysis.keywords.slice(0, 10).join(', '),
      });
    }

    return metaTags;
  }

  /**
   * Generate structured data for SEO
   */
  generateStructuredData(
    seoManager: SeoManager,
    url?: string
  ): Record<string, string> {
    const analysis = seoManager.getAnalysis();
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: url ?? '',
      name: analysis?.seoMetrics?.titleTag ?? '',
      description: analysis?.seoMetrics?.metaDescription ?? '',
    };

    return structuredData;
  }
}
