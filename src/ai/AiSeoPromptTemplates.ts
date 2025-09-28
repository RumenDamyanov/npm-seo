/**
 * AI prompt templates for SEO suggestions
 */

import type { AiSeoPromptTemplate, AiSeoSuggestionType } from '../types/AiSeoTypes';

/**
 * Default AI SEO prompt templates
 */
export const DEFAULT_AI_SEO_TEMPLATES: Record<AiSeoSuggestionType, AiSeoPromptTemplate> = {
  technical: {
    name: 'Technical SEO Analysis',
    type: 'technical',
    maxTokens: 1000,
    temperature: 0.3,
    template: `You are an expert Technical SEO consultant. Analyze the following website data and provide specific technical SEO improvement suggestions.

Website Analysis:
- URL: {{url}}
- Title: {{title}}
- Meta Description: {{description}}
- Word Count: {{wordCount}}
- Headings: {{headings}}
- Images: {{imageCount}} ({{imagesWithoutAlt}} without alt text)
- Links: {{internalLinks}} internal, {{externalLinks}} external
- Schema Markup: {{hasSchema}}
- Page Load Time: {{loadTime}}ms

Current Issues Detected:
{{currentIssues}}

Provide 3-5 specific technical SEO recommendations in JSON format:
{
  "suggestions": [
    {
      "title": "Specific issue title",
      "description": "Detailed explanation of the issue and why it matters",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "impact": "Expected SEO impact",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "HTML/CSS code example if applicable",
      "confidence": 0.9
    }
  ]
}

Focus on: crawlability, indexability, site structure, robots.txt, sitemap.xml, page speed, mobile-friendliness, HTTPS, canonical tags, and technical markup issues.`,
    examples: [
      {
        input: 'Page with missing meta description and slow load time',
        output:
          '{"suggestions": [{"title": "Add Missing Meta Description", "description": "Meta descriptions help search engines understand page content and improve click-through rates", "actionSteps": ["Create unique 150-160 character description", "Include target keywords naturally", "Add description to HTML head"], "impact": "Improved SERP appearance and CTR", "effort": "low", "priority": "high", "confidence": 0.95}]}',
      },
    ],
  },

  content: {
    name: 'Content Quality Analysis',
    type: 'content',
    maxTokens: 1200,
    temperature: 0.4,
    template: `You are an expert Content SEO strategist. Analyze the following content and provide specific content optimization suggestions.

Content Analysis:
- URL: {{url}}
- Title: {{title}}
- Content Length: {{wordCount}} words
- Reading Level: {{readingLevel}}
- Keyword Density: {{keywordDensity}}%
- Primary Keywords: {{primaryKeywords}}
- Content Structure: {{contentStructure}}
- Readability Score: {{readabilityScore}}

Content Sample:
{{contentSample}}

Current Content Issues:
{{contentIssues}}

Provide 3-6 content optimization recommendations in JSON format:
{
  "suggestions": [
    {
      "title": "Content improvement title",
      "description": "Why this improvement matters for SEO and users",
      "actionSteps": ["Specific action 1", "Specific action 2"],
      "impact": "Expected improvement in rankings/engagement",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "confidence": 0.8
    }
  ]
}

Focus on: content quality, keyword optimization, readability, user intent, content freshness, topic coverage, E-A-T signals, and content structure.`,
    examples: [
      {
        input: 'Short article with keyword stuffing',
        output:
          '{"suggestions": [{"title": "Reduce Keyword Density", "description": "Current keyword density of 4.2% appears unnatural and may trigger keyword stuffing penalties", "actionSteps": ["Reduce keyword mentions to 1-2%", "Use semantic variations", "Focus on natural language"], "impact": "Better user experience and search rankings", "effort": "medium", "priority": "high", "confidence": 0.88}]}',
      },
    ],
  },

  keywords: {
    name: 'Keyword Optimization',
    type: 'keywords',
    maxTokens: 800,
    temperature: 0.3,
    template: `You are an expert Keyword Research specialist. Analyze the current keyword usage and suggest optimization strategies.

Keyword Analysis:
- Current Keywords: {{currentKeywords}}
- Keyword Density: {{keywordDensity}}
- Long-tail Keywords: {{longtailKeywords}}
- Semantic Keywords: {{semanticKeywords}}
- Title Keywords: {{titleKeywords}}
- Header Keywords: {{headerKeywords}}
- Missing Keywords: {{missingKeywords}}

Content Context:
- Topic: {{topic}}
- Target Audience: {{targetAudience}}
- Content Type: {{contentType}}
- Business Context: {{businessContext}}

Provide 3-5 keyword optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Keyword strategy improvement",
      "description": "Explanation of keyword opportunity",
      "actionSteps": ["Action step 1", "Action step 2"],
      "impact": "Expected search visibility improvement",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "confidence": 0.85
    }
  ]
}

Focus on: keyword research opportunities, semantic keyword usage, long-tail keyword targeting, keyword cannibalization, and search intent alignment.`,
    examples: [],
  },

  structure: {
    name: 'HTML Structure Analysis',
    type: 'structure',
    maxTokens: 900,
    temperature: 0.2,
    template: `You are an expert HTML/SEO specialist. Analyze the HTML structure and provide specific structural improvements.

HTML Structure Analysis:
- Title Tag: {{titleTag}}
- Heading Structure: {{headingStructure}}
- HTML5 Semantic Elements: {{semanticElements}}
- Lists and Tables: {{listsAndTables}}
- Navigation Structure: {{navigationStructure}}
- Internal Linking: {{internalLinking}}
- HTML Validation Issues: {{htmlValidationIssues}}

Current Structure Issues:
{{structureIssues}}

Provide 3-5 HTML structure optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Structure improvement",
      "description": "Why this structural change improves SEO",
      "actionSteps": ["HTML modification step 1", "HTML modification step 2"],
      "impact": "SEO and accessibility benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "<example>HTML code</example>",
      "confidence": 0.9
    }
  ]
}

Focus on: heading hierarchy, semantic HTML5, internal linking structure, navigation markup, breadcrumbs, and HTML validation.`,
    examples: [],
  },

  performance: {
    name: 'Performance SEO Analysis',
    type: 'performance',
    maxTokens: 1000,
    temperature: 0.3,
    template: `You are a Web Performance and SEO expert. Analyze performance metrics and provide SEO-focused performance optimization suggestions.

Performance Metrics:
- Page Load Time: {{loadTime}}ms
- First Contentful Paint: {{fcp}}ms
- Largest Contentful Paint: {{lcp}}ms
- Cumulative Layout Shift: {{cls}}
- First Input Delay: {{fid}}ms
- Time to Interactive: {{tti}}ms
- Image Optimization: {{imageOptimization}}
- CSS/JS Optimization: {{cssJsOptimization}}
- Caching Status: {{cachingStatus}}

Performance Issues:
{{performanceIssues}}

Provide 3-5 performance optimization suggestions that impact SEO in JSON format:
{
  "suggestions": [
    {
      "title": "Performance optimization",
      "description": "How this performance fix improves SEO rankings",
      "actionSteps": ["Technical implementation step 1", "Technical implementation step 2"],
      "impact": "SEO ranking and user experience benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "Code example if applicable",
      "confidence": 0.85
    }
  ]
}

Focus on: Core Web Vitals, page speed optimization, mobile performance, image compression, CSS/JS minification, and caching strategies.`,
    examples: [],
  },

  accessibility: {
    name: 'SEO Accessibility Analysis',
    type: 'accessibility',
    maxTokens: 900,
    temperature: 0.3,
    template: `You are an Accessibility and SEO expert. Analyze accessibility issues that impact SEO and provide specific improvements.

Accessibility Analysis:
- Alt Text Coverage: {{altTextCoverage}}%
- Heading Structure: {{headingStructure}}
- Color Contrast: {{colorContrast}}
- Keyboard Navigation: {{keyboardNavigation}}
- ARIA Labels: {{ariaLabels}}
- Form Labels: {{formLabels}}
- Skip Links: {{skipLinks}}
- Focus Management: {{focusManagement}}

Accessibility Issues:
{{accessibilityIssues}}

Provide 3-5 accessibility improvements that benefit SEO in JSON format:
{
  "suggestions": [
    {
      "title": "Accessibility improvement",
      "description": "How accessibility enhancement helps SEO",
      "actionSteps": ["Implementation step 1", "Implementation step 2"],
      "impact": "SEO and user experience benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "HTML accessibility code example",
      "confidence": 0.8
    }
  ]
}

Focus on: alt text optimization, heading hierarchy, ARIA implementation, keyboard navigation, color contrast, and semantic markup for assistive technologies.`,
    examples: [],
  },

  meta: {
    name: 'Meta Tags Optimization',
    type: 'meta',
    maxTokens: 800,
    temperature: 0.4,
    template: `You are a Meta Tags and SERP optimization expert. Analyze current meta tags and provide optimization suggestions.

Meta Tags Analysis:
- Title Tag: "{{titleTag}}" ({{titleLength}} characters)
- Meta Description: "{{metaDescription}}" ({{descriptionLength}} characters)
- Meta Keywords: {{metaKeywords}}
- Open Graph Tags: {{openGraphTags}}
- Twitter Cards: {{twitterCards}}
- Canonical Tag: {{canonicalTag}}
- Robots Meta: {{robotsMeta}}
- Viewport Meta: {{viewportMeta}}

Meta Issues:
{{metaIssues}}

Provide 3-5 meta tag optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Meta tag improvement",
      "description": "How this meta optimization improves SERP performance",
      "actionSteps": ["Meta tag modification 1", "Meta tag modification 2"],
      "impact": "SERP appearance and CTR improvements",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "<meta> tag examples",
      "confidence": 0.9
    }
  ]
}

Focus on: title tag optimization, meta description improvements, Open Graph optimization, Twitter Cards, canonical tags, and robots meta directives.`,
    examples: [],
  },

  schema: {
    name: 'Schema Markup Analysis',
    type: 'schema',
    maxTokens: 1000,
    temperature: 0.2,
    template: `You are a Schema Markup and Structured Data expert. Analyze current schema implementation and suggest improvements.

Schema Analysis:
- Current Schema Types: {{currentSchemaTypes}}
- JSON-LD Implementation: {{jsonLdImplementation}}
- Microdata: {{microdata}}
- RDFa: {{rdfa}}
- Schema Validation Issues: {{schemaValidationIssues}}
- Rich Snippets Eligibility: {{richSnippetsEligibility}}

Content Type: {{contentType}}
Business Type: {{businessType}}
Schema Opportunities: {{schemaOpportunities}}

Provide 3-5 schema markup suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Schema markup improvement",
      "description": "How this schema enhancement improves rich snippets",
      "actionSteps": ["Schema implementation step 1", "Schema implementation step 2"],
      "impact": "Rich snippets and search visibility benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "JSON-LD schema example",
      "confidence": 0.85
    }
  ]
}

Focus on: JSON-LD implementation, schema.org types, rich snippets optimization, business schema, article schema, and FAQ schema.`,
    examples: [],
  },

  links: {
    name: 'Link Optimization Analysis',
    type: 'links',
    maxTokens: 900,
    temperature: 0.3,
    template: `You are an Internal Linking and Link Building expert. Analyze current linking strategy and provide optimization suggestions.

Link Analysis:
- Internal Links: {{internalLinkCount}}
- External Links: {{externalLinkCount}}
- Broken Links: {{brokenLinks}}
- Link Anchor Text: {{anchorTextAnalysis}}
- Link Context: {{linkContext}}
- NoFollow Links: {{nofollowLinks}}
- Link Depth: {{linkDepth}}
- Related Content Links: {{relatedContentLinks}}

Link Issues:
{{linkIssues}}

Provide 3-5 link optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Link strategy improvement",
      "description": "How this linking improvement helps SEO",
      "actionSteps": ["Link optimization step 1", "Link optimization step 2"],
      "impact": "Link equity and user experience benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "HTML link examples",
      "confidence": 0.8
    }
  ]
}

Focus on: internal linking strategy, anchor text optimization, link equity distribution, related content linking, external link quality, and broken link fixes.`,
    examples: [],
  },

  images: {
    name: 'Image SEO Optimization',
    type: 'images',
    maxTokens: 800,
    temperature: 0.3,
    template: `You are an Image SEO and Web Performance expert. Analyze image optimization and provide specific improvements.

Image Analysis:
- Total Images: {{totalImages}}
- Images Without Alt Text: {{imagesWithoutAlt}}
- Image Formats: {{imageFormats}}
- Image Sizes: {{imageSizes}}
- Lazy Loading: {{lazyLoading}}
- Image Compression: {{imageCompression}}
- Next-gen Formats: {{nextGenFormats}}
- Image Sitemap: {{imageSitemap}}

Image Issues:
{{imageIssues}}

Provide 3-5 image optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Image optimization improvement",
      "description": "How this image optimization helps SEO and performance",
      "actionSteps": ["Image optimization step 1", "Image optimization step 2"],
      "impact": "SEO visibility and page speed benefits",
      "effort": "low|medium|high",
      "priority": "critical|high|medium|low",
      "codeExample": "HTML image optimization example",
      "confidence": 0.85
    }
  ]
}

Focus on: alt text optimization, image compression, next-gen formats (WebP, AVIF), lazy loading, responsive images, and image SEO best practices.`,
    examples: [],
  },
};

/**
 * Helper function to replace template variables
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | boolean | string[]>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    let replacement: string;

    if (Array.isArray(value)) {
      replacement = value.join(', ');
    } else if (typeof value === 'boolean') {
      replacement = value ? 'Yes' : 'No';
    } else {
      replacement = String(value);
    }

    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }

  return result;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: string,
  variables: Record<string, unknown>
): { valid: boolean; missingVariables: string[] } {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const requiredVariables = new Set<string>();
  let match;

  while ((match = variablePattern.exec(template)) !== null) {
    if (match[1]) {
      requiredVariables.add(match[1]);
    }
  }

  const missingVariables = Array.from(requiredVariables).filter(
    variable => !(variable in variables)
  );

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Get template by type
 */
export function getTemplateByType(type: AiSeoSuggestionType): AiSeoPromptTemplate {
  return DEFAULT_AI_SEO_TEMPLATES[type];
}

/**
 * Get all available template types
 */
export function getAvailableTemplateTypes(): AiSeoSuggestionType[] {
  return Object.keys(DEFAULT_AI_SEO_TEMPLATES) as AiSeoSuggestionType[];
}
