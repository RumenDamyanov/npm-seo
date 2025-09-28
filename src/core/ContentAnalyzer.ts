/**
 * Content analyzer for extracting and analyzing content structure and metrics
 */

import {
  extractTextContent,
  extractHeadings,
  extractImages,
  extractLinks,
  extractSeoMetrics,
  calculateReadingTime,
  countSentences,
  countParagraphs,
  extractKeywords,
  calculateKeywordDensity,
  getFrequentWords,
} from '../utils/HtmlParser';
import type { ContentAnalysis, ContentMetadata, ContentStructure } from '../types/ContentTypes';

/**
 * Content analyzer for SEO optimization
 */
export class ContentAnalyzer {
  private baseUrl: string | undefined;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze HTML content and extract comprehensive metrics
   */
  analyze(content: string, metadata: ContentMetadata = {}): ContentAnalysis {
    const startTime = Date.now();

    // Extract basic content
    const textContent = extractTextContent(content);
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const characterCount = textContent.length;
    const sentenceCount = countSentences(textContent);
    const paragraphCount = countParagraphs(content);
    const readingTime = calculateReadingTime(textContent);

    // Extract structure
    const headings = extractHeadings(content);
    const images = extractImages(content, this.baseUrl);
    const links = extractLinks(content, this.baseUrl);

    // Extract SEO metrics
    const seoMetrics = extractSeoMetrics(content);

    // Extract keywords
    const keywords = extractKeywords(textContent);
    const keywordDensity = calculateKeywordDensity(textContent, keywords);
    const frequentWords = getFrequentWords(textContent);

    // Detect language (simple heuristic)
    const language = this.detectLanguage(textContent) ?? metadata.language ?? 'en';

    // Build content structure
    const structure: ContentStructure = {
      headings,
      images,
      links,
      sections: this.extractSections(content),
    };

    const processingTime = Date.now() - startTime;

    return {
      rawContent: content,
      textContent,
      language,
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      readingTime,
      keywords,
      keywordDensity,
      frequentWords,
      structure,
      seoMetrics,
      meta: {
        analyzedAt: new Date(),
        processingTime,
        version: '1.0.0',
        mode: 'full',
      },
    };
  }

  /**
   * Fast analysis with minimal processing
   */
  analyzeFast(content: string, metadata: ContentMetadata = {}): ContentAnalysis {
    const startTime = Date.now();

    // Extract basic content only
    const textContent = extractTextContent(content);
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const characterCount = textContent.length;
    const readingTime = calculateReadingTime(textContent);

    // Extract minimal structure
    const headings = extractHeadings(content);
    const seoMetrics = extractSeoMetrics(content);

    // Basic keywords extraction
    const keywords = extractKeywords(textContent, 3, 10);

    const processingTime = Date.now() - startTime;

    return {
      rawContent: content,
      textContent,
      language: metadata.language ?? 'en',
      wordCount,
      characterCount,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime,
      keywords,
      keywordDensity: {},
      frequentWords: [],
      structure: {
        headings,
        images: [],
        links: [],
        sections: [],
      },
      seoMetrics,
      meta: {
        analyzedAt: new Date(),
        processingTime,
        version: '1.0.0',
        mode: 'fast',
      },
    };
  }

  /**
   * Extract content sections
   */
  private extractSections(content: string): Array<{
    type: string;
    content: string;
    wordCount: number;
  }> {
    const sections: Array<{ type: string; content: string; wordCount: number }> = [];

    // Simple section extraction based on common HTML patterns
    const patterns = [
      { type: 'header', selector: 'header' },
      { type: 'nav', selector: 'nav' },
      { type: 'main', selector: 'main' },
      { type: 'article', selector: 'article' },
      { type: 'section', selector: 'section' },
      { type: 'aside', selector: 'aside' },
      { type: 'footer', selector: 'footer' },
    ];

    patterns.forEach(pattern => {
      const regex = new RegExp(
        `<${pattern.selector}[^>]*>([\\s\\S]*?)<\\/${pattern.selector}>`,
        'gi'
      );
      let match;

      while ((match = regex.exec(content)) !== null) {
        const matchContent = match[1];
        if (!matchContent) continue;

        const sectionContent = extractTextContent(matchContent);
        const wordCount = sectionContent.split(/\s+/).filter(Boolean).length;

        if (wordCount > 0) {
          sections.push({
            type: pattern.type,
            content: sectionContent,
            wordCount,
          });
        }
      }
    });

    return sections;
  }

  /**
   * Simple language detection based on common words
   */
  private detectLanguage(text: string): string | undefined {
    const sample = text.toLowerCase().substring(0, 1000);

    // Common words for different languages
    const languagePatterns = {
      en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo'],
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'],
      de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf'],
      it: ['il', 'di', 'che', 'e', 'la', 'per', 'in', 'un', 'è', 'non', 'con', 'da'],
    };

    let maxScore = 0;
    let detectedLanguage: string | undefined;

    Object.entries(languagePatterns).forEach(([lang, words]) => {
      let score = 0;
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = sample.match(regex);
        score += matches ? matches.length : 0;
      });

      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    });

    // Return detected language only if we have reasonable confidence
    return maxScore > 5 ? detectedLanguage : undefined;
  }
}
