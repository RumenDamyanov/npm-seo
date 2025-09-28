/**
 * Example usage of @rumenx/seo
 */

import { SeoManager, ContentAnalyzer } from '../src/index';

// Example HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Complete Guide to TypeScript SEO Optimization</title>
    <meta name="description" content="Learn how to optimize your TypeScript applications for search engines with comprehensive SEO strategies and best practices.">
    <meta name="keywords" content="TypeScript, SEO, optimization, search engines">
</head>
<body>
    <header>
        <h1>TypeScript SEO Optimization Guide</h1>
        <nav>
            <a href="#basics">SEO Basics</a>
            <a href="#advanced">Advanced Techniques</a>
        </nav>
    </header>
    
    <main>
        <article>
            <h2 id="basics">SEO Basics for TypeScript Applications</h2>
            <p>Search Engine Optimization (SEO) is crucial for making your TypeScript applications discoverable. 
            This comprehensive guide covers everything you need to know about implementing effective SEO strategies.</p>
            
            <img src="/images/seo-chart.jpg" alt="SEO performance chart showing improvement over time" width="800" height="400">
            
            <h3>Understanding Search Engine Crawlers</h3>
            <p>Search engines use automated crawlers to discover and index content. When building TypeScript applications,
            it's important to ensure your content is accessible to these crawlers.</p>
            
            <h2 id="advanced">Advanced SEO Techniques</h2>
            <p>Beyond basic optimization, there are advanced techniques that can significantly improve your search rankings.
            These include structured data, performance optimization, and content quality improvements.</p>
            
            <h3>Structured Data Implementation</h3>
            <p>Implementing structured data helps search engines understand your content better. Use JSON-LD format
            for the best compatibility and ease of implementation.</p>
            
            <img src="/images/structured-data.png" alt="Example of structured data markup in JSON-LD format">
        </article>
        
        <aside>
            <h3>Related Topics</h3>
            <ul>
                <li><a href="/typescript-performance">TypeScript Performance</a></li>
                <li><a href="/web-vitals">Core Web Vitals</a></li>
                <li><a href="/accessibility">Web Accessibility</a></li>
            </ul>
        </aside>
    </main>
    
    <footer>
        <p>© 2024 TypeScript SEO Guide. All rights reserved.</p>
    </footer>
</body>
</html>
`;

function runExample() {
  console.log('🔍 Running @rumenx/seo Example\n');

  // 1. Basic content analysis
  console.log('1. Basic Content Analysis:');
  console.log('='.repeat(50));

  const analyzer = new ContentAnalyzer('https://example.com');
  const analysis = analyzer.analyze(htmlContent, {
    title: 'TypeScript SEO Guide',
    description: 'Complete guide to SEO optimization',
    language: 'en',
    author: 'SEO Expert',
    publishedAt: new Date('2024-01-01'),
  });

  console.log(`📄 Word Count: ${analysis.wordCount}`);
  console.log(`⏱️  Reading Time: ${analysis.readingTime} minutes`);
  console.log(`🔤 Language: ${analysis.language}`);
  console.log(`📏 Character Count: ${analysis.characterCount}`);
  console.log(`📝 Sentences: ${analysis.sentenceCount}`);
  console.log(`📚 Paragraphs: ${analysis.paragraphCount}`);

  console.log('\n🏷️  Top Keywords:');
  analysis.keywords.slice(0, 5).forEach((keyword, index) => {
    console.log(`  ${index + 1}. ${keyword}`);
  });

  console.log('\n📋 Headings Structure:');
  analysis.structure.headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    console.log(`${indent}H${heading.level}: ${heading.text}`);
  });

  console.log('\n🖼️  Images:');
  analysis.structure.images.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.url}`);
    console.log(`     Alt: ${img.currentAlt ?? 'Missing alt text'}`);
  });

  console.log('\n📊 SEO Metrics:');
  console.log(`  Title: ${analysis.seoMetrics.titleTag ?? 'Not found'}`);
  console.log(`  Description: ${analysis.seoMetrics.metaDescription ?? 'Not found'}`);
  console.log(`  H1 Tags: ${analysis.seoMetrics.h1Tags.length}`);

  // 2. Full SEO analysis with recommendations
  console.log('\n\n2. SEO Analysis with Recommendations:');
  console.log('='.repeat(50));

  const seoManager = new SeoManager({
    baseUrl: 'https://example.com',
    mode: 'hybrid',
    language: 'en',
    debug: true,
  });

  const result = seoManager.analyze(htmlContent, {
    title: 'TypeScript SEO Guide',
    description: 'Complete guide to SEO optimization',
    url: 'https://example.com/typescript-seo-guide',
    language: 'en',
  });

  console.log('\n📋 SEO Recommendations:');
  result.recommendations.forEach((rec, index) => {
    const severityIcon = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
    console.log(`\n  ${index + 1}. ${severityIcon} ${rec.type.toUpperCase()}: ${rec.message}`);
    console.log(`     💡 ${rec.suggestion}`);
    if (rec.currentValue) {
      console.log(`     📊 Current: ${rec.currentValue}`);
    }
    console.log(`     ✅ Recommended: ${rec.recommendedValue}`);
  });

  console.log('\n🎯 SEO Score:');
  console.log(`  Overall Score: ${result.score.overall}/100`);
  console.log('  Breakdown:');
  Object.entries(result.score.breakdown).forEach(([category, score]) => {
    const percentage = Math.round((score / 25) * 100); // Assuming max 25 per category
    console.log(`    ${category}: ${score}/25 (${percentage}%)`);
  });

  console.log('\n⚡ Performance:');
  console.log(`  Analysis Time: ${result.meta.processingTime}ms`);
  console.log(`  Analyzed At: ${result.meta.analyzedAt.toISOString()}`);
  console.log(`  Version: ${result.meta.version}`);

  console.log('\n✅ Example completed successfully!');
}

// Run the example
try {
  runExample();
} catch (error: unknown) {
  console.error('❌ Example failed:', error);
  process.exit(1);
}
