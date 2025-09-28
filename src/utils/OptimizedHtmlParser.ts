/**
 * Performance optimized HTML parsing utilities
 * This module provides cached and optimized versions of HTML parsing functions
 */

import { parse, HTMLElement } from 'node-html-parser';
import type {
  HeadingAnalysis,
  ImageAnalysis,
  LinkAnalysis,
  SeoMetrics,
} from '../types/ContentTypes';
import type { JsonLdData } from '../types/SeoTypes';

// Global cache for parsed HTML documents
const parseCache = new Map<string, { parsed: HTMLElement; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

/**
 * Enhanced parse function with caching
 */
function cachedParse(html: string): HTMLElement {
  if (!html || typeof html !== 'string') {
    return parse('');
  }

  // Create cache key from content hash
  const cacheKey = createContentHash(html);
  const now = Date.now();

  // Check cache
  const cached = parseCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.parsed;
  }

  // Parse and cache
  const parsed = parse(html);

  // Manage cache size
  if (parseCache.size >= MAX_CACHE_SIZE) {
    const [oldestKey] = parseCache.keys();
    if (oldestKey) {
      parseCache.delete(oldestKey);
    }
  }

  parseCache.set(cacheKey, { parsed, timestamp: now });
  return parsed;
}

/**
 * Simple hash function for content caching
 */
function createContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Optimized text content extraction with caching
 */
export function extractTextContentOptimized(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const root = cachedParse(html);

  // Remove script and style elements efficiently
  const scriptsAndStyles = root.querySelectorAll('script, style, noscript');
  scriptsAndStyles.forEach((el: HTMLElement) => el.remove());

  return root.textContent.trim().replace(/\s+/g, ' ');
}

/**
 * Optimized heading extraction with single DOM traversal
 */
export function extractHeadingsOptimized(html: string): HeadingAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = cachedParse(html);
  const headings: HeadingAnalysis[] = [];
  const headingElements = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  // Single pass extraction
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

  // Build hierarchical structure efficiently
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

    // Set parent
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
 * Optimized image extraction with batch processing
 */
export function extractImagesOptimized(html: string, baseUrl?: string): ImageAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = cachedParse(html);
  const images: ImageAnalysis[] = [];
  const imgElements = root.querySelectorAll('img');

  // Batch process images
  imgElements.forEach((element: HTMLElement) => {
    const src = element.getAttribute('src');
    if (!src) return;

    const url = resolveUrlOptimized(src, baseUrl);
    const currentAlt = element.getAttribute('alt') ?? undefined;
    const widthAttr = element.getAttribute('width');
    const width = widthAttr ? parseInt(widthAttr) : undefined;
    const heightAttr = element.getAttribute('height');
    const height = heightAttr ? parseInt(heightAttr) : undefined;
    const title = element.getAttribute('title') ?? undefined;

    // Extract context efficiently
    const parent = element.parentNode;
    const context =
      parent && parent instanceof HTMLElement ? extractNearbyTextOptimized(parent, element) : '';

    // Check if image is decorative
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
 * Optimized link extraction with efficient categorization
 */
export function extractLinksOptimized(html: string, baseUrl?: string): LinkAnalysis[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const root = cachedParse(html);
  const links: LinkAnalysis[] = [];
  const linkElements = root.querySelectorAll('a[href]');

  // Pre-compile base URL data
  const baseUrlData = baseUrl ? new URL(baseUrl) : null;

  linkElements.forEach((element: HTMLElement) => {
    const href = element.getAttribute('href');
    if (!href) return;

    const url = resolveUrlOptimized(href, baseUrl);
    const text = element.textContent.trim();
    const title = element.getAttribute('title') ?? undefined;
    const rel = element.getAttribute('rel') ?? undefined;
    const target = element.getAttribute('target') ?? undefined;

    // Efficient URL categorization
    let isInternal = false;
    let isExternal = false;

    if (href.startsWith('/') || href.startsWith('#')) {
      isInternal = true;
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      if (baseUrlData) {
        try {
          const linkUrl = new URL(url);
          isInternal = linkUrl.hostname === baseUrlData.hostname;
          isExternal = !isInternal;
        } catch {
          isExternal = true;
        }
      } else {
        isExternal = true;
      }
    }

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
 * Optimized SEO metrics extraction with single DOM query
 */
export function extractSeoMetricsOptimized(html: string): SeoMetrics {
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

  const root = cachedParse(html);

  // Batch extract all meta information
  const titleElement = root.querySelector('title');
  const titleTag = titleElement?.textContent.trim();

  const metaElements = root.querySelectorAll('meta');
  const linkElements = root.querySelectorAll('link');
  const h1Elements = root.querySelectorAll('h1');
  const scriptElements = root.querySelectorAll('script[type="application/ld+json"]');

  let metaDescription: string | undefined;
  let metaKeywords: string[] | undefined;
  let robotsTag: string | undefined;
  const openGraphTags: Record<string, string> = {};
  const twitterCardTags: Record<string, string> = {};

  // Process meta tags in single pass
  metaElements.forEach((element: HTMLElement) => {
    const name = element.getAttribute('name');
    const property = element.getAttribute('property');
    const content = element.getAttribute('content');

    if (!content) return;

    if (name === 'description') {
      metaDescription = content.trim();
    } else if (name === 'keywords') {
      metaKeywords = content
        .trim()
        .split(',')
        .map(k => k.trim());
    } else if (name === 'robots') {
      robotsTag = content.trim();
    } else if (property?.startsWith('og:')) {
      openGraphTags[property] = content;
    } else if (name?.startsWith('twitter:')) {
      twitterCardTags[name] = content;
    }
  });

  // Extract canonical URL
  let canonicalUrl: string | undefined;
  linkElements.forEach((element: HTMLElement) => {
    if (element.getAttribute('rel') === 'canonical') {
      canonicalUrl = element.getAttribute('href')?.trim();
    }
  });

  // Extract H1 tags
  const h1Tags = h1Elements.map((el: HTMLElement) => el.textContent.trim()).filter(Boolean);

  // Extract structured data
  const structuredData: JsonLdData[] = [];
  scriptElements.forEach((element: HTMLElement) => {
    try {
      const data = JSON.parse(element.textContent) as unknown;
      if (data && typeof data === 'object') {
        const dataArray = Array.isArray(data) ? (data as JsonLdData[]) : [data as JsonLdData];
        structuredData.push(...dataArray);
      }
    } catch {
      // Ignore invalid JSON
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
    structuredData,
  };
}

/**
 * Optimized keyword extraction with improved stop word filtering
 */
const STOP_WORDS = new Set([
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
]);

export function extractKeywordsOptimized(
  text: string,
  minLength: number = 3,
  maxCount: number = 20
): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Use more efficient regex and processing
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !STOP_WORDS.has(word) && !/^\d+$/.test(word));

  // Use Map for better performance
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  });

  // Sort and return top keywords
  return Array.from(frequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxCount)
    .map(([word]) => word);
}

/**
 * Optimized keyword density calculation
 */
export function calculateKeywordDensityOptimized(
  text: string,
  keywords: string[]
): Record<string, number> {
  if (!text || !keywords.length) {
    return {};
  }

  const lowerText = text.toLowerCase();
  const totalWords = lowerText.split(/\s+/).length;
  const density: Record<string, number> = {};

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  });

  return density;
}

/**
 * Optimized URL resolution with caching
 */
const urlCache = new Map<string, string>();

function resolveUrlOptimized(url: string, baseUrl?: string): string {
  const cacheKey = `${url}:${baseUrl ?? ''}`;
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;

  let resolved: string;

  if (!baseUrl || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    resolved = url;
  } else if (url.startsWith('/')) {
    try {
      const base = new URL(baseUrl);
      resolved = base.origin + url;
    } catch {
      resolved = url;
    }
  } else {
    try {
      resolved = new URL(url, baseUrl).href;
    } catch {
      resolved = url;
    }
  }

  // Cache with size limit
  if (urlCache.size >= 1000) {
    const [firstKey] = urlCache.keys();
    if (firstKey) {
      urlCache.delete(firstKey);
    }
  }

  urlCache.set(cacheKey, resolved);
  return resolved;
}

/**
 * Optimized nearby text extraction
 */
function extractNearbyTextOptimized(
  parent: HTMLElement,
  target: HTMLElement,
  maxLength: number = 200
): string {
  const allText = parent.textContent;
  const targetText = target.textContent;
  const targetIndex = allText.indexOf(targetText);

  if (targetIndex === -1) return '';

  const halfLength = maxLength / 2;
  const start = Math.max(0, targetIndex - halfLength);
  const end = Math.min(allText.length, targetIndex + targetText.length + halfLength);

  return allText.substring(start, end).trim();
}

/**
 * Clear all caches (useful for testing and memory management)
 */
export function clearOptimizedCaches(): void {
  parseCache.clear();
  urlCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  parseCache: { size: number; maxSize: number };
  urlCache: { size: number; maxSize: number };
} {
  return {
    parseCache: { size: parseCache.size, maxSize: MAX_CACHE_SIZE },
    urlCache: { size: urlCache.size, maxSize: 1000 },
  };
}
