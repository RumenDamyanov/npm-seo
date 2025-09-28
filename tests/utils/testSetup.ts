/**
 * Jest setup for SEO tests
 */

import { seoMatchers } from './seoMatchers';

// Extend Jest with custom matchers
expect.extend(seoMatchers);

// Mock console methods in tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly testing it
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Sample test data
export const mockHtmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Test SEO Page</title>
      <meta name="description" content="This is a test page for SEO analysis with proper meta description length and content structure.">
      <meta name="keywords" content="seo, testing, analysis">
    </head>
    <body>
      <h1>Main Heading for SEO Testing</h1>
      <h2>Secondary Heading</h2>
      <p>This is the main content of the page with relevant keywords for SEO testing. The content should be substantial enough to provide meaningful analysis results.</p>
      <p>Additional paragraph with more content to ensure we have enough text for proper SEO analysis and keyword density calculations.</p>
      <img src="test.jpg" alt="Test image for SEO analysis">
      <a href="https://example.com">External link</a>
      <a href="/internal">Internal link</a>
    </body>
  </html>
`;

export const mockSeoConfig = {
  mode: 'manual' as const,
  title: {
    minLength: 10,
    maxLength: 70,
  },
  description: {
    minLength: 120,
    maxLength: 170,
  },
};
