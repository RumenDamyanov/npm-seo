/**
 * Template Rendering Examples - How to use @rumenx/seo BEFORE rendering
 *
 * This example shows the proper workflow:
 * 1. Analyze your content data (before HTML generation)
 * 2. Get SEO recommendations and optimiz    // Analysis could be used for additional optimizations
    void this.seoManager.analyze(productHtml, {
      title: product.name,
      description: product.description,
      url: `https://mystore.com/products/${product.slug}`,
    });ements
 * 3. Use those elements in your templates
 * 4. Render the final HTML with optimized SEO
 */

import { SeoManager, ContentAnalyzer } from '../src/index';
import type { ContentAnalysis } from '../src/types/ContentTypes';

// Example: Blog Post Template Rendering
interface BlogPost {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  tags: string[];
  publishedAt: Date;
}

interface OptimizedSeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  structuredData: Record<string, unknown>;
}

class BlogPostRenderer {
  private seoManager: SeoManager;
  private analyzer: ContentAnalyzer;

  constructor() {
    this.seoManager = new SeoManager({
      baseUrl: 'https://myblog.com',
      mode: 'hybrid',
    });
    this.analyzer = new ContentAnalyzer();
  }

  /**
   * Step 1: Analyze content and generate optimized SEO data
   * This happens BEFORE rendering HTML
   */
  generateSeoData(post: BlogPost): OptimizedSeoData {
    // Create a mock HTML structure for analysis
    const mockHtml = `
      <article>
        <h1>${post.title}</h1>
        <p>${post.excerpt ?? post.content.substring(0, 200)}</p>
        <div>${post.content}</div>
      </article>
    `;

    // Analyze the content
    const analysis = this.analyzer.analyze(mockHtml);

    // Get SEO recommendations (could be used for additional optimizations)
    this.seoManager.analyze(mockHtml, {
      title: post.title,
      description: post.excerpt,
      url: `https://myblog.com/posts/${post.slug}`,
    });

    // Generate optimized SEO elements
    return {
      metaTitle: this.optimizeTitle(post.title, analysis),
      metaDescription: this.optimizeDescription(post.excerpt ?? post.content, analysis),
      keywords: [...post.tags, ...analysis.keywords.slice(0, 8)],
      ogTitle: post.title,
      ogDescription: post.excerpt ?? analysis.textContent.substring(0, 160),
      structuredData: this.generateBlogPostSchema(post, analysis),
    };
  }

  /**
   * Step 2: Use the optimized SEO data in your template
   */
  renderBlogPost(post: BlogPost, seoData: OptimizedSeoData): string {
    // Now render HTML with optimized SEO elements
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Optimized Meta Tags -->
    <title>${seoData.metaTitle}</title>
    <meta name="description" content="${seoData.metaDescription}">
    <meta name="keywords" content="${seoData.keywords.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${seoData.ogTitle}">
    <meta property="og:description" content="${seoData.ogDescription}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://myblog.com/posts/${post.slug}">
    
    <!-- Article Meta -->
    <meta property="article:published_time" content="${post.publishedAt.toISOString()}">
    <meta property="article:tag" content="${post.tags.join('", "')}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(seoData.structuredData, null, 2)}
    </script>
</head>
<body>
    <article>
        <header>
            <h1>${post.title}</h1>
            <time datetime="${post.publishedAt.toISOString()}">
                ${post.publishedAt.toLocaleDateString()}
            </time>
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </header>
        
        <div class="content">
            ${post.content}
        </div>
    </article>
</body>
</html>`;
  }

  private optimizeTitle(title: string, analysis: ContentAnalysis): string {
    // Optimize title based on analysis
    const maxLength = 60;
    if (title.length <= maxLength) return title;

    // Truncate and add main keyword if needed
    const mainKeyword = analysis.keywords[0];
    const truncated = `${title.substring(0, maxLength - 3)}...`;

    return mainKeyword && !title.toLowerCase().includes(mainKeyword.toLowerCase())
      ? `${truncated} | ${mainKeyword}`
      : truncated;
  }

  private optimizeDescription(text: string, analysis: ContentAnalysis): string {
    const maxLength = 160;
    if (!text) {
      // Generate from content if no excerpt
      text = analysis.textContent.replace(/\s+/g, ' ').trim();
    }

    if (text.length <= maxLength) return text;

    // Find last complete sentence within limit
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');

    return lastSentence > maxLength * 0.7
      ? truncated.substring(0, lastSentence + 1)
      : `${truncated.substring(0, maxLength - 3)}...`;
  }

  private generateBlogPostSchema(
    post: BlogPost,
    analysis: ContentAnalysis
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt ?? analysis.textContent.substring(0, 160),
      url: `https://myblog.com/posts/${post.slug}`,
      datePublished: post.publishedAt.toISOString(),
      wordCount: analysis.wordCount,
      keywords: post.tags.join(', '),
      author: {
        '@type': 'Person',
        name: 'Blog Author',
        url: 'https://myblog.com/about',
      },
    };
  }
}

// Example: E-commerce Product Template
interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  images: string[];
  features: string[];
}

class ProductPageRenderer {
  private seoManager: SeoManager;

  constructor() {
    this.seoManager = new SeoManager({
      baseUrl: 'https://mystore.com',
      mode: 'hybrid',
    });
  }

  generateProductSeo(product: Product): OptimizedSeoData {
    // Create product content for analysis
    const productHtml = `
      <div class="product">
        <h1>${product.name}</h1>
        <p class="description">${product.description}</p>
        <div class="features">
          ${product.features.map(f => `<p>${f}</p>`).join('')}
        </div>
        <div class="category">${product.category}</div>
        <div class="brand">${product.brand}</div>
      </div>
    `;

    // Analysis could be used for additional optimizations
    void this.seoManager.analyze(productHtml, {
      title: product.name,
      description: product.description,
      url: `https://mystore.com/products/${product.sku}`,
    });

    return {
      metaTitle: `${product.name} - ${product.brand} | MyStore`,
      metaDescription: `${product.description.substring(0, 140)} Starting at $${product.price}. Free shipping!`,
      keywords: [product.brand, product.category, product.name, ...product.features.slice(0, 5)],
      ogTitle: product.name,
      ogDescription: product.description,
      structuredData: this.generateProductSchema(product),
    };
  }

  renderProductPage(product: Product, seoData: OptimizedSeoData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Product SEO -->
    <title>${seoData.metaTitle}</title>
    <meta name="description" content="${seoData.metaDescription}">
    <meta name="keywords" content="${seoData.keywords.join(', ')}">
    
    <!-- Open Graph for Product -->
    <meta property="og:title" content="${seoData.ogTitle}">
    <meta property="og:description" content="${seoData.ogDescription}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="https://mystore.com/products/${product.sku}">
    <meta property="og:image" content="${product.images[0]}">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="USD">
    
    <!-- Product Schema -->
    <script type="application/ld+json">
      ${JSON.stringify(seoData.structuredData, null, 2)}
    </script>
</head>
<body>
    <div class="product-page">
        <h1>${product.name}</h1>
        <p class="price">$${product.price}</p>
        <p class="description">${product.description}</p>
        
        <div class="features">
            <h3>Features:</h3>
            <ul>
                ${product.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
        
        <button class="buy-now">Add to Cart</button>
    </div>
</body>
</html>`;
  }

  private generateProductSchema(product: Product): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      category: product.category,
      image: product.images,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `https://mystore.com/products/${product.sku}`,
      },
    };
  }
}

// Usage Examples
function demonstrateTemplateRendering(): void {
  console.log('🎯 Template Rendering with SEO Optimization\n');

  // Blog Post Example
  const blogRenderer = new BlogPostRenderer();
  const blogPost: BlogPost = {
    title: 'Complete Guide to TypeScript Best Practices',
    content: `
      <p>TypeScript has revolutionized modern web development by bringing static typing to JavaScript.</p>
      <h2>Why Use TypeScript?</h2>
      <p>TypeScript provides better tooling, error catching, and code maintainability.</p>
      <h2>Setting Up Your Project</h2>
      <p>Start with a proper tsconfig.json configuration for optimal development experience.</p>
      <h2>Best Practices</h2>
      <p>Follow these guidelines to write better TypeScript code...</p>
    `,
    excerpt:
      'Learn essential TypeScript best practices to improve your code quality and development workflow.',
    slug: 'typescript-best-practices',
    tags: ['TypeScript', 'JavaScript', 'Web Development', 'Programming'],
    publishedAt: new Date('2024-01-15'),
  };

  console.log('📝 Blog Post Example:');
  console.log('====================');

  // Step 1: Generate optimized SEO data
  const blogSeoData = blogRenderer.generateSeoData(blogPost);
  console.log('Generated SEO Data:');
  console.log(`- Meta Title: "${blogSeoData.metaTitle}"`);
  console.log(`- Meta Description: "${blogSeoData.metaDescription}"`);
  console.log(`- Keywords: ${blogSeoData.keywords.join(', ')}`);

  // Step 2: Render HTML with optimized SEO
  const blogHtml = blogRenderer.renderBlogPost(blogPost, blogSeoData);
  console.log('\n✅ Blog post rendered with optimized SEO!');
  console.log('📝 Sample HTML (first 200 chars):', `${blogHtml.substring(0, 200)}...\n`);

  // Product Example
  const productRenderer = new ProductPageRenderer();
  const product: Product = {
    name: 'Professional Wireless Headphones Pro Max',
    description:
      'Experience studio-quality sound with active noise cancellation, 40-hour battery life, and premium comfort for all-day listening.',
    price: 299.99,
    category: 'Electronics',
    brand: 'AudioTech',
    sku: 'AT-WH-PM-001',
    images: ['https://mystore.com/images/headphones-1.jpg'],
    features: [
      'Active Noise Cancellation',
      '40-hour battery life',
      'Premium leather cushions',
      'Bluetooth 5.2 connectivity',
      'Quick charge: 10 min = 5 hours playback',
    ],
  };

  console.log('🛍️ Product Page Example:');
  console.log('========================');

  // Step 1: Generate optimized SEO data
  const productSeoData = productRenderer.generateProductSeo(product);
  console.log('Generated SEO Data:');
  console.log(`- Meta Title: "${productSeoData.metaTitle}"`);
  console.log(`- Meta Description: "${productSeoData.metaDescription}"`);
  console.log(`- Keywords: ${productSeoData.keywords.join(', ')}`);

  // Step 2: Render HTML with optimized SEO
  const productHtml = productRenderer.renderProductPage(product, productSeoData);
  console.log('\n✅ Product page rendered with optimized SEO!');
  console.log('📝 Sample HTML (first 200 chars):', `${productHtml.substring(0, 200)}...\n`);

  console.log('🎯 Key Benefits of This Approach:');
  console.log('- SEO optimization happens BEFORE HTML rendering');
  console.log('- Content is analyzed and improved at the data level');
  console.log('- Templates receive optimized meta tags and structured data');
  console.log('- Final HTML is SEO-ready from the start');
  console.log('- No need to analyze already-rendered content');
}

// Example with Express.js/Next.js integration
function expressIntegrationExample(): void {
  console.log('\n🚀 Framework Integration Example:');
  console.log('==================================');

  console.log(`
// Express.js Route Example
app.get('/blog/:slug', async (req, res) => {
  const post = await getBlogPost(req.params.slug);
  const blogRenderer = new BlogPostRenderer();
  
  // Generate SEO data BEFORE rendering
  const seoData = blogRenderer.generateSeoData(post);
  
  // Render template with optimized SEO
  const html = blogRenderer.renderBlogPost(post, seoData);
  
  res.send(html);
});

// Next.js Page Example
export async function getServerSideProps({ params }) {
  const product = await getProduct(params.sku);
  const productRenderer = new ProductPageRenderer();
  
  // Generate SEO data for Next.js head
  const seoData = productRenderer.generateProductSeo(product);
  
  return {
    props: {
      product,
      seoData
    }
  };
}
  `);
}

// Run the examples
if (require.main === module) {
  try {
    demonstrateTemplateRendering();
    expressIntegrationExample();
    console.log('\n✨ Template rendering examples completed!');
    console.log('This is how you should use @rumenx/seo in real applications.');
  } catch (error: unknown) {
    console.error(error);
  }
}

export { BlogPostRenderer, ProductPageRenderer, OptimizedSeoData };
