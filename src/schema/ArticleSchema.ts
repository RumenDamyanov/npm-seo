import { BaseSchema } from './BaseSchema';
import type { JsonLdData } from '../types/SeoTypes';

/**
 * Article schema for blog posts, news articles, and other written content
 *
 * Supports Schema.org Article type with fluent interface
 *
 * @example
 * ```typescript
 * const article = new ArticleSchema()
 *   .setHeadline('Complete Guide to SEO')
 *   .setDescription('Learn everything about SEO optimization')
 *   .setAuthor('John Doe')
 *   .setDatePublished(new Date())
 *   .setImage('https://example.com/image.jpg');
 *
 * const jsonLd = article.toJsonLd();
 * const scriptTag = article.toScriptTag();
 * ```
 */
export class ArticleSchema extends BaseSchema {
  getType(): string {
    return 'Article';
  }

  /**
   * Set the article headline (required)
   *
   * @param headline - Article title/headline
   * @returns This instance for chaining
   */
  setHeadline(headline: string): this {
    return this.setProperty('headline', headline);
  }

  /**
   * Set the article description
   *
   * @param description - Article description/summary
   * @returns This instance for chaining
   */
  setDescription(description: string): this {
    return this.setProperty('description', description);
  }

  /**
   * Set the article author
   *
   * @param author - Author name, URL, or Person/Organization schema
   * @returns This instance for chaining
   */
  setAuthor(author: string | JsonLdData): this {
    if (typeof author === 'string') {
      return this.setProperty('author', {
        '@type': 'Person',
        name: author,
      });
    }
    return this.setProperty('author', author);
  }

  /**
   * Set multiple authors
   *
   * @param authors - Array of author names or schemas
   * @returns This instance for chaining
   */
  setAuthors(authors: Array<string | JsonLdData>): this {
    const authorSchemas = authors.map(author =>
      typeof author === 'string' ? { '@type': 'Person', name: author } : author
    );
    return this.setProperty('author', authorSchemas);
  }

  /**
   * Set the publication date
   *
   * @param date - Publication date
   * @returns This instance for chaining
   */
  setDatePublished(date: string | Date): this {
    return this.setProperty('datePublished', this.formatDate(date));
  }

  /**
   * Set the last modified date
   *
   * @param date - Modification date
   * @returns This instance for chaining
   */
  setDateModified(date: string | Date): this {
    return this.setProperty('dateModified', this.formatDate(date));
  }

  /**
   * Set the article image(s)
   *
   * @param image - Single image URL or array of URLs
   * @returns This instance for chaining
   */
  setImage(image: string | string[]): this {
    return this.setProperty('image', image);
  }

  /**
   * Set the publisher information
   *
   * @param publisher - Publisher name or Organization schema
   * @returns This instance for chaining
   */
  setPublisher(publisher: string | JsonLdData): this {
    if (typeof publisher === 'string') {
      return this.setProperty('publisher', {
        '@type': 'Organization',
        name: publisher,
      });
    }
    return this.setProperty('publisher', publisher);
  }

  /**
   * Set the article URL
   *
   * @param url - Article URL
   * @returns This instance for chaining
   */
  setUrl(url: string): this {
    return this.setProperty('url', url);
  }

  /**
   * Set the article body/content
   *
   * @param text - Article text content
   * @returns This instance for chaining
   */
  setArticleBody(text: string): this {
    return this.setProperty('articleBody', text);
  }

  /**
   * Set the word count
   *
   * @param count - Number of words
   * @returns This instance for chaining
   */
  setWordCount(count: number): this {
    return this.setProperty('wordCount', count);
  }

  /**
   * Set article keywords/tags
   *
   * @param keywords - Keywords as string or array
   * @returns This instance for chaining
   */
  setKeywords(keywords: string | string[]): this {
    return this.setProperty('keywords', keywords);
  }

  /**
   * Set the article section/category
   *
   * @param section - Section name (e.g., "Technology", "Sports")
   * @returns This instance for chaining
   */
  setArticleSection(section: string): this {
    return this.setProperty('articleSection', section);
  }

  /**
   * Set the language
   *
   * @param language - Language code (e.g., "en", "es")
   * @returns This instance for chaining
   */
  setInLanguage(language: string): this {
    return this.setProperty('inLanguage', language);
  }

  /**
   * Add a comment to the article
   *
   * @param comment - Comment schema or object
   * @returns This instance for chaining
   */
  addComment(comment: JsonLdData): this {
    const comments = this.getProperty<JsonLdData[]>('comment') ?? [];
    comments.push(comment);
    return this.setProperty('comment', comments);
  }

  /**
   * Set the main entity of the page
   *
   * @param entity - Main entity schema
   * @returns This instance for chaining
   */
  setMainEntity(entity: JsonLdData): this {
    return this.setProperty('mainEntity', entity);
  }

  /**
   * Validate required fields
   * @override
   */
  protected override validate(): void {
    super.validate();

    const headline = this.getProperty<string>('headline');
    if (!headline) {
      throw new Error('ArticleSchema: headline is required');
    }
  }

  /**
   * Create ArticleSchema from a data object
   *
   * @param data - Article data
   * @returns New ArticleSchema instance
   */
  static fromData(data: {
    headline: string;
    description?: string;
    author?: string | string[] | JsonLdData;
    datePublished?: string | Date;
    dateModified?: string | Date;
    image?: string | string[];
    publisher?: string | JsonLdData;
    url?: string;
    articleBody?: string;
    wordCount?: number;
    keywords?: string | string[];
    articleSection?: string;
    inLanguage?: string;
  }): ArticleSchema {
    const schema = new ArticleSchema().setHeadline(data.headline);

    if (data.description) schema.setDescription(data.description);

    if (data.author) {
      if (Array.isArray(data.author)) {
        schema.setAuthors(data.author);
      } else {
        schema.setAuthor(data.author);
      }
    }

    if (data.datePublished) schema.setDatePublished(data.datePublished);
    if (data.dateModified) schema.setDateModified(data.dateModified);
    if (data.image) schema.setImage(data.image);
    if (data.publisher) schema.setPublisher(data.publisher);
    if (data.url) schema.setUrl(data.url);
    if (data.articleBody) schema.setArticleBody(data.articleBody);
    if (data.wordCount) schema.setWordCount(data.wordCount);
    if (data.keywords) schema.setKeywords(data.keywords);
    if (data.articleSection) schema.setArticleSection(data.articleSection);
    if (data.inLanguage) schema.setInLanguage(data.inLanguage);

    return schema;
  }
}
