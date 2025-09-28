/**
 * HTML parsing and content extraction utilities for @rumenx/seo
 */

import { parse, HTMLElement } from 'node-html-parser';
import type {
  HeadingAnalysis,
  ImageAnalysis,
  LinkAnalysis,
  SeoMetrics,
} from '../types/ContentTypes';
import type { JsonLdData } from '../types/SeoTypes';

/**
 * Extract clean text content from HTML
 */
export function extractTextContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const root = parse(html);

  // Remove script and style elements
  root.querySelectorAll('script, style, noscript').forEach((el: HTMLElement) => el.remove());

  return root.textContent.trim().replace(/\s+/g, ' ');
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(html: string): HeadingAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = parse(html);
  const headings: HeadingAnalysis[] = [];
  const headingElements = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headingElements.forEach((element: HTMLElement, index: number) => {
    const level = parseInt(element.tagName.charAt(1));
    const text = element.textContent.trim();
    const id = element.getAttribute('id') ?? undefined;

    if (text) {
      headings.push({
        level,
        text,
        id,
        position: index,
      });
    }
  });

  // Build hierarchical structure
  const stack: HeadingAnalysis[] = [];

  headings.forEach(heading => {
    // Find parent heading
    while (stack.length > 0) {
      const lastHeading = stack[stack.length - 1];
      if (lastHeading && lastHeading.level >= heading.level) {
        stack.pop();
      } else {
        break;
      }
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      if (parent) {
        heading.parent = parent;
        parent.children = parent.children ?? [];
        parent.children.push(heading);
      }
    }

    stack.push(heading);
  });

  return headings;
}

/**
 * Extract and analyze images from HTML
 */
export function extractImages(html: string, baseUrl?: string): ImageAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = parse(html);
  const images: ImageAnalysis[] = [];
  const imgElements = root.querySelectorAll('img');

  imgElements.forEach((element: HTMLElement) => {
    const src = element.getAttribute('src');
    if (!src) return;

    const url = resolveUrl(src, baseUrl);
    const currentAlt = element.getAttribute('alt') ?? undefined;
    const widthAttr = element.getAttribute('width');
    const width = widthAttr ? parseInt(widthAttr) : undefined;
    const heightAttr = element.getAttribute('height');
    const height = heightAttr ? parseInt(heightAttr) : undefined;
    const title = element.getAttribute('title') ?? undefined;

    // Extract context (surrounding text)
    const parent = element.parentNode;
    const context =
      parent && parent instanceof HTMLElement ? extractNearbyText(parent, element) : '';

    // Check if image is decorative (empty alt or role="presentation")
    const role = element.getAttribute('role');
    const isDecorative = currentAlt === '' || role === 'presentation' || role === 'none';

    images.push({
      url,
      currentAlt,
      width,
      height,
      title,
      context,
      isDecorative,
    });
  });

  return images;
}

/**
 * Extract and analyze links from HTML
 */
export function extractLinks(html: string, baseUrl?: string): LinkAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = parse(html);
  const links: LinkAnalysis[] = [];
  const linkElements = root.querySelectorAll('a[href]');

  linkElements.forEach((element: HTMLElement) => {
    const href = element.getAttribute('href');
    if (!href) return;

    const url = resolveUrl(href, baseUrl);
    const text = element.textContent.trim();
    const title = element.getAttribute('title') ?? undefined;
    const rel = element.getAttribute('rel') ?? undefined;
    const target = element.getAttribute('target') ?? undefined;

    const isInternal = baseUrl ? url.startsWith(baseUrl) || url.startsWith('/') : false;
    const isExternal = !isInternal && (url.startsWith('http://') || url.startsWith('https://'));

    if (text || title) {
      links.push({
        url,
        text,
        title,
        rel,
        target,
        isInternal,
        isExternal,
      });
    }
  });

  return links;
}

/**
 * Extract SEO-specific metrics from HTML
 */
export function extractSeoMetrics(html: string): SeoMetrics {
  if (!html || typeof html !== 'string') {
    return {
      titleTag: undefined,
      metaDescription: undefined,
      h1Tags: [],
      metaKeywords: undefined,
      canonicalUrl: undefined,
      robotsTag: undefined,
      openGraphTags: {},
      twitterCardTags: {},
      structuredData: [],
    };
  }

  const root = parse(html);

  // Title tag
  const titleElement = root.querySelector('title');
  const titleTag = titleElement?.textContent.trim();

  // Meta description
  const metaDescElement = root.querySelector('meta[name="description"]');
  const metaDescription = metaDescElement?.getAttribute('content')?.trim();

  // H1 tags
  const h1Elements = root.querySelectorAll('h1');
  const h1Tags = h1Elements.map((el: HTMLElement) => el.textContent.trim()).filter(Boolean);

  // Meta keywords
  const metaKeywordsElement = root.querySelector('meta[name="keywords"]');
  const metaKeywords = metaKeywordsElement
    ?.getAttribute('content')
    ?.trim()
    .split(',')
    .map((k: string) => k.trim());

  // Canonical URL
  const canonicalElement = root.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalElement?.getAttribute('href')?.trim();

  // Robots meta tag
  const robotsElement = root.querySelector('meta[name="robots"]');
  const robotsTag = robotsElement?.getAttribute('content')?.trim();

  // Open Graph tags
  const openGraphTags: Record<string, string> = {};
  const ogElements = root.querySelectorAll('meta[property^="og:"]');
  ogElements.forEach((element: HTMLElement) => {
    const property = element.getAttribute('property');
    const content = element.getAttribute('content');
    if (property && content) {
      openGraphTags[property] = content;
    }
  });

  // Twitter Card tags
  const twitterCardTags: Record<string, string> = {};
  const twitterElements = root.querySelectorAll('meta[name^="twitter:"]');
  twitterElements.forEach((element: HTMLElement) => {
    const name = element.getAttribute('name');
    const content = element.getAttribute('content');
    if (name && content) {
      twitterCardTags[name] = content;
    }
  });

  // Structured data (JSON-LD)
  const structuredData: unknown[] = [];
  const jsonLdElements = root.querySelectorAll('script[type="application/ld+json"]');
  jsonLdElements.forEach((element: HTMLElement) => {
    try {
      const data: unknown = JSON.parse(element.innerHTML);
      if (Array.isArray(data)) {
        structuredData.push(...(data as unknown[]));
      } else {
        structuredData.push(data);
      }
    } catch {
      // Ignore invalid JSON-LD
    }
  });

  return {
    titleTag,
    metaDescription,
    h1Tags,
    metaKeywords,
    canonicalUrl,
    robotsTag,
    openGraphTags,
    twitterCardTags,
    structuredData: structuredData as JsonLdData[],
  };
}

/**
 * Calculate reading time based on text content
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

/**
 * Count paragraphs in HTML
 */
export function countParagraphs(html: string): number {
  if (!html || typeof html !== 'string') {
    return 0;
  }

  const root = parse(html);
  return root.querySelectorAll('p').length;
}

/**
 * Extract keywords from text using simple frequency analysis
 */
export function extractKeywords(
  text: string,
  minLength: number = 3,
  maxCount: number = 20
): string[] {
  // Common stop words to exclude
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'must',
    'shall',
    'this',
    'that',
    'these',
    'those',
    'here',
    'there',
    'where',
    'when',
    'how',
    'what',
    'who',
    'why',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
    'not',
    'no',
    'yes',
    'all',
    'some',
    'any',
    'many',
    'much',
    'more',
    'most',
    'other',
    'such',
    'from',
    'up',
    'down',
    'out',
    'off',
    'over',
    'under',
    'again',
    'then',
    'once',
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word) && !/^\d+$/.test(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] ?? 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxCount)
    .map(([word]) => word);
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const density: Record<string, number> = {};

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = words.filter(word => word === keywordLower).length;
    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  });

  return density;
}

/**
 * Get most frequent words with counts and percentages
 */
export function getFrequentWords(
  text: string,
  maxCount: number = 20
): Array<{ word: string; count: number; percentage: number }> {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2);
  const totalWords = words.length;

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] ?? 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxCount)
    .map(([word, count]) => ({
      word,
      count,
      percentage: totalWords > 0 ? (count / totalWords) * 100 : 0,
    }));
}

/**
 * Helper function to extract nearby text from an element
 */
function extractNearbyText(
  parent: HTMLElement,
  target: HTMLElement,
  maxLength: number = 200
): string {
  const allText = parent.textContent;
  const targetIndex = parent.innerHTML.indexOf(target.outerHTML);

  if (targetIndex === -1) return '';

  const beforeText = allText.substring(Math.max(0, targetIndex - maxLength / 2), targetIndex);
  const afterText = allText.substring(
    targetIndex,
    Math.min(allText.length, targetIndex + maxLength / 2)
  );

  return (beforeText + afterText).trim();
}

/**
 * Resolve relative URLs against a base URL
 */
function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url;
  }

  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return base.origin + url;
  }

  return new URL(url, baseUrl).href;
}
