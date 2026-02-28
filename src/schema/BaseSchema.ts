import type { JsonLdData } from '../types/SeoTypes';

/**
 * Base class for all Schema.org types
 *
 * Provides common functionality for building JSON-LD structured data
 * All schema classes should extend this base class
 *
 * @example
 * ```typescript
 * class CustomSchema extends BaseSchema {
 *   getType(): string {
 *     return 'Custom';
 *   }
 * }
 * ```
 */
export abstract class BaseSchema {
  protected data: Record<string, unknown> = {
    '@context': 'https://schema.org',
  };

  /**
   * Get the Schema.org type for this schema
   * Must be implemented by subclasses
   */
  abstract getType(): string;

  /**
   * Set the @id property (unique identifier for the schema)
   *
   * @param id - Unique identifier URL
   * @returns This instance for chaining
   */
  setId(id: string): this {
    return this.setProperty('@id', id);
  }

  /**
   * Set the name property
   *
   * @param name - Name/title
   * @returns This instance for chaining
   */
  setName(name: string): this {
    return this.setProperty('name', name);
  }

  /**
   * Convert schema to JSON-LD format
   *
   * @returns JSON-LD structured data object
   */
  toJsonLd(): JsonLdData {
    this.validate();

    return {
      ...this.data,
      '@type': this.getType(),
    } as JsonLdData;
  }

  /**
   * Alias for toJsonLd() for API consistency
   *
   * @returns JSON-LD structured data object
   */
  toJson(): JsonLdData {
    return this.toJsonLd();
  }

  /**
   * Convert schema to JSON string
   *
   * @param pretty - Whether to pretty-print the JSON
   * @returns JSON string representation
   */
  toString(pretty: boolean = true): string {
    return JSON.stringify(this.toJsonLd(), null, pretty ? 2 : 0);
  }

  /**
   * Convert schema to script tag for HTML embedding
   *
   * @returns HTML script tag with JSON-LD
   */
  toScriptTag(): string {
    return `<script type="application/ld+json">\n${this.toString()}\n</script>`;
  }

  /**
   * Set a property on the schema
   *
   * @param key - Property key
   * @param value - Property value
   * @returns This instance for chaining
   * @protected
   */
  protected setProperty(key: string, value: unknown): this {
    if (value !== undefined && value !== null) {
      this.data[key] = value;
    }
    return this;
  }

  /**
   * Get a property from the schema
   *
   * @param key - Property key
   * @returns Property value
   * @protected
   */
  protected getProperty<T = unknown>(key: string): T | undefined {
    return this.data[key] as T | undefined;
  }

  /**
   * Format a date to ISO 8601 string
   *
   * @param date - Date as string or Date object
   * @returns ISO 8601 formatted date string
   * @protected
   */
  protected formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date;
  }

  /**
   * Validate required fields
   * Should be overridden by subclasses to add validation
   *
   * @throws {Error} If validation fails
   * @protected
   */
  protected validate(): void {
    // Base validation - can be overridden by subclasses
  }

  /**
   * Validate that a required field is present
   *
   * @param fieldName - Name of the field
   * @param value - Value to validate
   * @throws {Error} If field is missing
   * @protected
   */
  protected validateRequired(fieldName: string, value: unknown): void {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${this.getType()}: ${fieldName} is required`);
    }
  }

  /**
   * Merge data from another object
   *
   * @param data - Data to merge
   * @returns This instance for chaining
   */
  mergeData(data: Record<string, unknown>): this {
    Object.entries(data).forEach(([key, value]) => {
      if (key !== '@context' && key !== '@type') {
        this.setProperty(key, value);
      }
    });
    return this;
  }

  /**
   * Get all data (excluding @context and @type)
   *
   * @returns Schema data
   */
  getData(): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { '@context': _context, ...rest } = this.data;
    return rest;
  }

  /**
   * Clone this schema instance
   *
   * @returns New schema instance with same data
   */
  clone(): this {
    const cloned = Object.create(Object.getPrototypeOf(this) as object) as this;
    cloned.data = { ...this.data };
    return cloned;
  }
}
