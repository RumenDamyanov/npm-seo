/**
 * Shared utilities for framework integrations
 */

import type { SeoConfig } from '../types/SeoTypes';

/**
 * Common utility functions for framework integrations
 */

/**
 * Create default SEO configuration for framework integrations
 */
export function createDefaultSeoConfig(): SeoConfig {
  return {
    mode: 'manual',
  };
}

/**
 * Validate content for SEO analysis
 */
export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content must be a non-empty string' };
  }

  if (content.trim().length === 0) {
    return { isValid: false, error: 'Content cannot be empty' };
  }

  if (content.length > 100000) {
    return { isValid: false, error: 'Content is too long (max 100,000 characters)' };
  }

  return { isValid: true };
}

/**
 * Format API response for consistency across frameworks
 */
export function formatApiResponse<T>(
  data: T,
  success = true,
  error?: string
): {
  success: boolean;
  data: T | undefined;
  error: string | undefined;
  timestamp: string;
} {
  return {
    success,
    data: success ? data : undefined,
    error: error ?? undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract content from HTML string
 */
export function extractTextFromHtml(html: string): string {
  // Basic HTML tag removal - in production, use a proper HTML parser
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
