/**
 * Simple Template Rendering Example
 *
 * Shows how to use @rumenx/seo to optimize content BEFORE rendering templates
 * This is the most common and practical use case.
 */

import { ContentAnalyzer } from '../src/index';

// Simple blog post data (what you'd get from CMS/database)
interface PostData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
}

// Optimized SEO data for templates
interface SeoData {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * Step 1: Analyze your content data and generate optimized SEO
 */
function generateSeoForPost(postData: PostData): SeoData {
  const analyzer = new ContentAnalyzer();

  // Create mock HTML to analyze content structure
  const mockContent = `
    <article>
      <h1>${postData.title}</h1>
      <p>${postData.excerpt ?? 'No excerpt available'}</p>
      <div>${postData.content}</div>
    </article>
  `;

  // Analyze the content
  const analysis = analyzer.analyze(mockContent);

  // Generate optimized SEO elements
  return {
    title: optimizeTitle(postData.title, analysis.keywords),
    description: optimizeDescription(postData.excerpt ?? analysis.textContent),
    keywords: [...postData.tags, ...analysis.keywords.slice(0, 5)],
  };
}

/**
 * Step 2: Use the optimized SEO data in your HTML template
 */
function renderBlogPost(postData: PostData, seoData: SeoData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Optimized SEO tags -->
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}">
    <meta name="keywords" content="${seoData.keywords.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${seoData.title}">
    <meta property="og:description" content="${seoData.description}">
    <meta property="og:type" content="article">
</head>
<body>
    <article>
        <h1>${postData.title}</h1>
        <div class="content">
            ${postData.content}
        </div>
        <div class="tags">
            ${postData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </article>
</body>
</html>`;
}

// Helper functions
function optimizeTitle(title: string, keywords: string[]): string {
  const maxLength = 60;
  if (title.length <= maxLength) return title;

  // Truncate and optionally add main keyword
  const truncated = `${title.substring(0, maxLength - 3)}...`;
  const mainKeyword = keywords[0];

  if (mainKeyword && !title.toLowerCase().includes(mainKeyword.toLowerCase())) {
    return `${title.substring(0, maxLength - mainKeyword.length - 4)}... | ${mainKeyword}`;
  }

  return truncated;
}

function optimizeDescription(text: string): string {
  const maxLength = 160;
  if (text.length <= maxLength) return text;

  // Find last complete sentence within limit
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');

  return lastSentence > maxLength * 0.7
    ? truncated.substring(0, lastSentence + 1)
    : `${truncated.substring(0, maxLength - 3)}...`;
}

// Demo usage
function demonstrateTemplateWorkflow(): void {
  console.log('🎯 Template Rendering Workflow Example\n');

  // This is your content data (from CMS, database, etc.)
  const postData: PostData = {
    title: 'Complete Guide to Modern JavaScript Development',
    content: `
      <p>Modern JavaScript development has evolved significantly with ES6+ features and new tooling.</p>
      <h2>Key Features to Master</h2>
      <p>Arrow functions, destructuring, modules, and async/await are essential.</p>
      <h2>Best Practices</h2>
      <p>Use modern tools like TypeScript, ESLint, and Prettier for better code quality.</p>
    `,
    excerpt:
      'Learn essential modern JavaScript features and best practices for professional development.',
    tags: ['JavaScript', 'ES6', 'Web Development', 'Programming'],
  };

  console.log('📊 Original Content Data:');
  console.log(`Title: "${postData.title}"`);
  console.log(`Excerpt: "${postData.excerpt}"`);
  console.log(`Tags: ${postData.tags.join(', ')}\n`);

  // Step 1: Generate optimized SEO data
  console.log('⚡ Step 1: Analyzing content and generating optimized SEO...');
  const seoData = generateSeoForPost(postData);

  console.log('✅ Generated SEO Data:');
  console.log(`Optimized Title: "${seoData.title}"`);
  console.log(`Optimized Description: "${seoData.description}"`);
  console.log(`Keywords: ${seoData.keywords.join(', ')}\n`);

  // Step 2: Render template with optimized SEO
  console.log('🎨 Step 2: Rendering HTML template with optimized SEO...');
  const html = renderBlogPost(postData, seoData);

  console.log('✅ HTML rendered with optimized SEO tags!\n');

  // Show a snippet of the generated HTML
  const htmlLines = html.split('\n');
  const headSection = htmlLines.slice(0, 20).join('\n');
  console.log('📄 Generated HTML Head Section:');
  console.log(headSection);
  console.log('...\n');

  console.log('🎯 Key Benefits:');
  console.log('✓ SEO optimization happens BEFORE HTML rendering');
  console.log('✓ Templates receive pre-optimized meta tags');
  console.log('✓ No need to analyze already-rendered content');
  console.log('✓ Perfect for CMS, blogs, e-commerce, and dynamic sites');
}

// Framework integration examples
function showFrameworkExamples(): void {
  console.log('\n🚀 Framework Integration Examples:\n');

  console.log('Express.js:');
  console.log(`
app.get('/posts/:slug', async (req, res) => {
  const postData = await getPostFromDatabase(req.params.slug);
  const seoData = generateSeoForPost(postData);
  const html = renderBlogPost(postData, seoData);
  res.send(html);
});
  `);

  console.log('Next.js:');
  console.log(`
export async function getServerSideProps({ params }) {
  const postData = await getPostFromCMS(params.slug);
  const seoData = generateSeoForPost(postData);
  
  return {
    props: { postData, seoData }
  };
}

export default function BlogPost({ postData, seoData }) {
  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords.join(', ')} />
      </Head>
      <article>
        <h1>{postData.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: postData.content }} />
      </article>
    </>
  );
}
  `);

  console.log('Template Engines (Handlebars, EJS, etc.):');
  console.log(`
// In your route handler
const postData = await getPost(id);
const seoData = generateSeoForPost(postData);

res.render('blog-post', {
  post: postData,
  seo: seoData
});

// In your template (Handlebars example)
<head>
  <title>{{seo.title}}</title>
  <meta name="description" content="{{seo.description}}">
  <meta name="keywords" content="{{join seo.keywords ', '}}">
</head>
  `);
}

// Run the demo
if (require.main === module) {
  demonstrateTemplateWorkflow();
  showFrameworkExamples();
}
