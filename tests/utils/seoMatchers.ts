/**
 * Custom Jest matchers for SEO testing
 */

import type { ContentAnalysis } from '../../src/types';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidSeoTitle(): R;
      toBeValidMetaDescription(): R;
      toHaveGoodSeoScore(minScore?: number): R;
      toContainKeywords(keywords: string[]): R;
      toHaveValidStructuredData(): R;
      toBeValidSeoResult(): R;
      toHaveRequiredSeoFields(): R;
    }
  }
}

/**
 * Check if a string is a valid SEO title
 */
export const toBeValidSeoTitle = (received: string): jest.CustomMatcherResult => {
  const pass =
    typeof received === 'string' &&
    received.length >= 10 &&
    received.length <= 70 &&
    received.trim().length > 0;

  return {
    message: (): string =>
      pass
        ? `expected "${received}" not to be a valid SEO title`
        : `expected "${received}" to be a valid SEO title (10-70 characters, non-empty)`,
    pass,
  };
};

/**
 * Check if a string is a valid meta description
 */
export const toBeValidMetaDescription = (received: string): jest.CustomMatcherResult => {
  const pass =
    typeof received === 'string' &&
    received.length >= 120 &&
    received.length <= 170 &&
    received.trim().length > 0;

  return {
    message: (): string =>
      pass
        ? `expected "${received}" not to be a valid meta description`
        : `expected "${received}" to be a valid meta description (120-170 characters, non-empty)`,
    pass,
  };
};

/**
 * Check if SEO result has a good score
 */
export const toHaveGoodSeoScore = (received: any, minScore = 70): jest.CustomMatcherResult => {
  // TODO: Fix this when SeoResult interface is properly defined
  const score = 0; // Placeholder
  const pass = score >= minScore;

  return {
    message: (): string =>
      pass
        ? `expected SEO score ${score} not to be >= ${minScore}`
        : `expected SEO score ${score} to be >= ${minScore}`,
    pass,
  };
};

/**
 * Check if content contains specific keywords
 */
export const toContainKeywords = (
  received: string,
  keywords: string[]
): jest.CustomMatcherResult => {
  const lowercaseContent = received.toLowerCase();
  const foundKeywords = keywords.filter(keyword =>
    lowercaseContent.includes(keyword.toLowerCase())
  );
  const pass = foundKeywords.length === keywords.length;

  return {
    message: (): string =>
      pass
        ? `expected content not to contain all keywords: ${keywords.join(', ')}`
        : `expected content to contain all keywords: ${keywords.join(', ')}, found: ${foundKeywords.join(', ')}`,
    pass,
  };
};

/**
 * Check if object has valid structured data
 */
export const toHaveValidStructuredData = (received: any): jest.CustomMatcherResult => {
  const pass =
    typeof received === 'object' && received !== null && received['@context'] && received['@type'];

  return {
    message: (): string =>
      pass
        ? `expected object not to have valid structured data`
        : `expected object to have valid structured data (@context and @type properties)`,
    pass,
  };
};

/**
 * Check if object is a valid SEO result
 */
export const toBeValidSeoResult = (received: any): jest.CustomMatcherResult => {
  const pass =
    typeof received === 'object' &&
    received !== null &&
    received.analysis &&
    typeof received.analysis === 'object' &&
    received.suggestions &&
    Array.isArray(received.suggestions);

  return {
    message: (): string =>
      pass
        ? `expected object not to be a valid SEO result`
        : `expected object to be a valid SEO result with analysis and suggestions properties`,
    pass,
  };
};

/**
 * Check if SEO analysis has required fields
 */
export const toHaveRequiredSeoFields = (received: ContentAnalysis): jest.CustomMatcherResult => {
  const requiredFields = ['content', 'seo', 'issues', 'score'];
  const missingFields = requiredFields.filter(field => !(field in received));
  const pass = missingFields.length === 0;

  return {
    message: (): string =>
      pass
        ? `expected analysis not to have all required fields`
        : `expected analysis to have required fields, missing: ${missingFields.join(', ')}`,
    pass,
  };
};

// Export all matchers
export const seoMatchers = {
  toBeValidSeoTitle,
  toBeValidMetaDescription,
  toHaveGoodSeoScore,
  toContainKeywords,
  toHaveValidStructuredData,
  toBeValidSeoResult,
  toHaveRequiredSeoFields,
};
