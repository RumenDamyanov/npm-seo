import { BaseSchema } from './BaseSchema';
import type { JsonLdData } from '../types/SeoTypes';

/**
 * Breadcrumb list schema for site navigation
 *
 * Represents the navigation path to the current page
 *
 * @example
 * ```typescript
 * const breadcrumb = new BreadcrumbListSchema()
 *   .addItem('Home', 'https://example.com', 1)
 *   .addItem('Blog', 'https://example.com/blog', 2)
 *   .addItem('Article', 'https://example.com/blog/article', 3);
 *
 * const jsonLd = breadcrumb.toJsonLd();
 * ```
 */
export class BreadcrumbListSchema extends BaseSchema {
  private items: Array<{
    name: string;
    url: string;
    position: number;
  }> = [];

  getType(): string {
    return 'BreadcrumbList';
  }

  /**
   * Add a breadcrumb item
   *
   * @param name - Display name of the item
   * @param url - URL of the item
   * @param position - Position in the breadcrumb trail (1-indexed)
   * @returns This instance for chaining
   */
  addItem(name: string, url: string, position?: number): this {
    const pos = position ?? this.items.length + 1;
    this.items.push({ name, url, position: pos });

    // Sort by position to ensure correct order
    this.items.sort((a, b) => a.position - b.position);

    return this;
  }

  /**
   * Add multiple breadcrumb items at once
   *
   * @param items - Array of breadcrumb items
   * @returns This instance for chaining
   */
  addItems(items: Array<{ name: string; url: string; position?: number }>): this {
    items.forEach((item, index) => {
      this.addItem(item.name, item.url, item.position ?? index + 1);
    });
    return this;
  }

  /**
   * Remove all breadcrumb items
   *
   * @returns This instance for chaining
   */
  clearItems(): this {
    this.items = [];
    return this;
  }

  /**
   * Get all breadcrumb items
   *
   * @returns Array of breadcrumb items
   */
  getItems(): Array<{ name: string; url: string; position: number }> {
    return [...this.items];
  }

  /**
   * Get the number of breadcrumb items
   *
   * @returns Number of items
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Convert to JSON-LD format
   * @override
   */
  override toJsonLd(): JsonLdData {
    this.validate();

    const itemListElement = this.items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    }));

    return {
      '@context': 'https://schema.org',
      '@type': this.getType(),
      itemListElement,
    } as JsonLdData;
  }

  /**
   * Validate required fields
   * @override
   */
  protected override validate(): void {
    super.validate();

    if (this.items.length === 0) {
      throw new Error('BreadcrumbListSchema: at least one item is required');
    }

    // Validate positions are sequential
    const positions = this.items.map(item => item.position);
    const uniquePositions = new Set(positions);

    if (uniquePositions.size !== positions.length) {
      throw new Error('BreadcrumbListSchema: duplicate positions found');
    }
  }

  /**
   * Create BreadcrumbListSchema from an array of items
   *
   * @param items - Array of breadcrumb items
   * @returns New BreadcrumbListSchema instance
   */
  static fromArray(
    items: Array<{ name: string; url: string; position?: number }>
  ): BreadcrumbListSchema {
    const schema = new BreadcrumbListSchema();
    schema.addItems(items);
    return schema;
  }

  /**
   * Create BreadcrumbListSchema from a path
   *
   * Automatically generates breadcrumbs from URL path segments
   *
   * @param baseUrl - Base URL of the site
   * @param currentPath - Current path (e.g., "/blog/category/article")
   * @param pathNames - Optional custom names for path segments
   * @returns New BreadcrumbListSchema instance
   *
   * @example
   * ```typescript
   * const breadcrumb = BreadcrumbListSchema.fromPath(
   *   'https://example.com',
   *   '/blog/category/article',
   *   { blog: 'Blog', category: 'Category', article: 'Article Title' }
   * );
   * ```
   */
  static fromPath(
    baseUrl: string,
    currentPath: string,
    pathNames?: Record<string, string>
  ): BreadcrumbListSchema {
    const schema = new BreadcrumbListSchema();

    // Add home
    schema.addItem('Home', baseUrl, 1);

    // Parse path segments
    const segments = currentPath.split('/').filter(s => s.length > 0);

    let currentUrl = baseUrl;
    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      const name =
        pathNames?.[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      schema.addItem(name, currentUrl, index + 2);
    });

    return schema;
  }
}
