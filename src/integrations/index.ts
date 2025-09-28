/**
 * Framework integrations for @rumenx/seo
 *
 * These are basic utility classes that can be used to integrate
 * SEO analysis into various web frameworks.
 */

// Re-export from sub-modules
export { ExpressSeo } from './express';
export { NextSeo } from './nextjs';
export { FastifySeo } from './fastify';

// Export shared utilities
export * from './shared';
