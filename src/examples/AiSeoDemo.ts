/**
 * AI SEO Analyzer test and demonstration
 */

import { AiSeoAnalyzer } from '../ai/AiSeoAnalyzer';
import type { ContentAnalysis } from '../types/ContentTypes';
import type { SeoResult, SeoMode } from '../types/SeoTypes';

// Mock data for testing
const mockContentAnalysis: ContentAnalysis = {
  rawContent:
    '<html><head><title>Test</title></head><body><p>This is a short test content with only a few words.</p></body></html>',
  textContent: 'This is a short test content with only a few words.',
  language: 'en',
  wordCount: 12,
  characterCount: 52,
  sentenceCount: 1,
  paragraphCount: 1,
  readingTime: 0.1,
  readingLevel: 8,
  keywords: ['test', 'content', 'short'],
  keywordDensity: { test: 1, content: 1, short: 1 },
  frequentWords: [
    { word: 'test', count: 1, percentage: 8.3 },
    { word: 'content', count: 1, percentage: 8.3 },
  ],
  structure: {
    headings: [],
    images: [
      {
        url: 'https://example.com/image.jpg',
        currentAlt: undefined,
        generatedAlt: 'A test image',
      },
    ],
    links: [
      {
        url: 'https://external.com',
        text: 'External link',
        isInternal: false,
        isExternal: true,
      },
    ],
    sections: [],
  },
  seoMetrics: {
    titleTag: 'Test',
    metaDescription: undefined,
    h1Tags: [],
    metaKeywords: ['test'],
    canonicalUrl: undefined,
    robotsTag: undefined,
    openGraphTags: {
      title: 'Test',
    },
    twitterCardTags: {
      card: 'summary',
      title: 'Test',
    },
    structuredData: [],
  },
  sentiment: {
    score: 0.1,
    magnitude: 0.3,
    label: 'neutral',
  },
  topics: ['testing', 'content'],
  meta: {
    analyzedAt: new Date(),
    processingTime: 150,
    version: '1.0.0',
    mode: 'full',
  },
};

const mockSeoResult: SeoResult = {
  title: 'Test',
  description: '',
  keywords: ['test'],
  metaTags: [{ tag: 'title', innerHTML: 'Test' }],
  openGraph: {
    title: 'Test',
    description: '',
    type: 'website',
  },
  twitterCard: {
    card: 'summary',
    title: 'Test',
  },
  jsonLd: [],
  meta: {
    generatedAt: new Date(),
    mode: 'ai' as SeoMode,
    processingTime: 100,
    fromCache: false,
  },
};

/**
 * Demonstrate AI SEO analyzer functionality
 */
export function demonstrateAiSeoAnalyzer(): void {
  console.log('🤖 AI-Powered SEO Analyzer Demo\n');

  // Initialize analyzer
  const analyzer = new AiSeoAnalyzer({
    preferredProvider: 'rules-based',
    maxSuggestionsPerType: 3,
    includeCodeExamples: true,
  });

  // Run analysis
  const analysis = analyzer.analyzeSeo(mockContentAnalysis, mockSeoResult);

  // Display results
  console.log(`📊 Overall SEO Score: ${analysis.overallScore}/100`);
  console.log(`📝 Summary: ${analysis.summary}\n`);

  console.log('🔥 Top Recommendations:');
  analysis.topRecommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  console.log('\n📋 Detailed Suggestions by Category:');
  analysis.suggestionGroups.forEach(group => {
    console.log(`\n${group.typeName} (${group.overallPriority} priority, ${group.totalImpact}):`);
    group.suggestions.forEach(suggestion => {
      console.log(`  • ${suggestion.title}`);
      console.log(`    ${suggestion.description}`);
      console.log(
        `    Priority: ${suggestion.priority} | Impact: ${suggestion.impact} | Effort: ${suggestion.effort}`
      );
      if (suggestion.codeExample) {
        console.log(`    Code: ${suggestion.codeExample}`);
      }
    });
  });

  // Show processing stats
  const stats = analyzer.getProcessingStats();
  console.log(`\n⚡ Processing Stats:`);
  console.log(`  Analyses: ${stats.totalAnalyses}`);
  console.log(`  Total time: ${stats.totalProcessingTime}ms`);
  console.log(`  Average time: ${stats.averageProcessingTime.toFixed(2)}ms`);

  console.log('\n✨ AI SEO Analysis Complete!');
}

// Export for testing
export { mockContentAnalysis, mockSeoResult };
