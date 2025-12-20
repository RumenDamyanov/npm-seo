import { BaseSchema } from './BaseSchema';
import type { JsonLdData } from '../types/SeoTypes';

/**
 * Product schema for e-commerce products
 *
 * Represents a product with pricing, availability, and review information
 *
 * @example
 * ```typescript
 * const product = new ProductSchema()
 *   .setName('Amazing Product')
 *   .setDescription('Best product ever')
 *   .setImage('https://example.com/product.jpg')
 *   .setSku('ABC123')
 *   .setPrice(29.99, 'USD')
 *   .setAvailability('InStock')
 *   .setBrand('Brand Name');
 *
 * const jsonLd = product.toJsonLd();
 * ```
 */
export class ProductSchema extends BaseSchema {
  getType(): string {
    return 'Product';
  }

  /**
   * Set the product description
   *
   * @param description - Product description
   * @returns This instance for chaining
   */
  setDescription(description: string): this {
    return this.setProperty('description', description);
  }

  /**
   * Set the product image(s)
   *
   * @param image - Single image URL or array of URLs
   * @returns This instance for chaining
   */
  setImage(image: string | string[]): this {
    return this.setProperty('image', image);
  }

  /**
   * Set the product SKU
   *
   * @param sku - Stock Keeping Unit
   * @returns This instance for chaining
   */
  setSku(sku: string): this {
    return this.setProperty('sku', sku);
  }

  /**
   * Alias for setSku() with uppercase naming
   *
   * @param sku - Stock Keeping Unit
   * @returns This instance for chaining
   */
  setSKU(sku: string): this {
    return this.setSku(sku);
  }

  /**
   * Set the product brand
   *
   * @param brand - Brand name or Brand schema
   * @returns This instance for chaining
   */
  setBrand(brand: string | JsonLdData): this {
    if (typeof brand === 'string') {
      return this.setProperty('brand', {
        '@type': 'Brand',
        name: brand,
      });
    }
    return this.setProperty('brand', brand);
  }

  /**
   * Set the product price
   *
   * @param price - Price amount
   * @param currency - Currency code (e.g., "USD", "EUR")
   * @param priceValidUntil - Optional price validity date
   * @returns This instance for chaining
   */
  setPrice(price: number, currency: string, priceValidUntil?: string | Date): this {
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
    };

    if (priceValidUntil) {
      offer.priceValidUntil = this.formatDate(priceValidUntil);
    }

    return this.setProperty('offers', offer);
  }

  /**
   * Set the full offers object
   *
   * @param offers - Complete Offer or array of Offers
   * @returns This instance for chaining
   */
  setOffers(offers: JsonLdData | JsonLdData[]): this {
    return this.setProperty('offers', offers);
  }

  /**
   * Set product availability
   *
   * @param availability - Availability status (InStock, OutOfStock, PreOrder, etc.)
   * @returns This instance for chaining
   */
  setAvailability(
    availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | 'LimitedAvailability'
  ): this {
    const offer = this.getProperty<Record<string, unknown>>('offers') || { '@type': 'Offer' };
    offer.availability = `https://schema.org/${availability}`;
    return this.setProperty('offers', offer);
  }

  /**
   * Set the seller/seller URL
   *
   * @param seller - Seller name or URL
   * @returns This instance for chaining
   */
  setSeller(seller: string): this {
    const offer = this.getProperty<Record<string, unknown>>('offers') || { '@type': 'Offer' };
    offer.seller =
      typeof seller === 'string' && seller.startsWith('http')
        ? seller
        : { '@type': 'Organization', name: seller };
    return this.setProperty('offers', offer);
  }

  /**
   * Set product URL
   *
   * @param url - Product page URL
   * @returns This instance for chaining
   */
  setUrl(url: string): this {
    this.setProperty('url', url);
    const offer = this.getProperty<Record<string, unknown>>('offers');
    if (offer) {
      offer.url = url;
      this.setProperty('offers', offer);
    }
    return this;
  }

  /**
   * Add aggregate rating
   *
   * @param ratingValue - Rating value (e.g., 4.5)
   * @param reviewCount - Number of reviews
   * @param bestRating - Best possible rating (default: 5)
   * @param worstRating - Worst possible rating (default: 1)
   * @returns This instance for chaining
   */
  setAggregateRating(
    ratingValue: number,
    reviewCount: number,
    bestRating: number = 5,
    worstRating: number = 1
  ): this {
    return this.setProperty('aggregateRating', {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
      bestRating,
      worstRating,
    });
  }

  /**
   * Add a review
   *
   * @param review - Review schema or object
   * @returns This instance for chaining
   */
  addReview(
    review:
      | JsonLdData
      | {
          author: string;
          datePublished: string | Date;
          reviewBody: string;
          ratingValue: number;
        }
  ): this {
    const reviews = this.getProperty<JsonLdData[]>('review') || [];

    if ('@type' in review) {
      reviews.push(review);
    } else {
      reviews.push({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: this.formatDate(review.datePublished),
        reviewBody: review.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.ratingValue,
        },
      } as JsonLdData);
    }

    return this.setProperty('review', reviews);
  }

  /**
   * Set product GTIN (Global Trade Item Number)
   *
   * @param gtin - GTIN, GTIN-8, GTIN-12, GTIN-13, or GTIN-14
   * @returns This instance for chaining
   */
  setGtin(gtin: string): this {
    // Auto-detect GTIN type based on length
    const gtinLength = gtin.replace(/\D/g, '').length;
    let gtinType = 'gtin';

    if (gtinLength === 8) gtinType = 'gtin8';
    else if (gtinLength === 12) gtinType = 'gtin12';
    else if (gtinLength === 13) gtinType = 'gtin13';
    else if (gtinLength === 14) gtinType = 'gtin14';

    return this.setProperty(gtinType, gtin);
  }

  /**
   * Set product MPN (Manufacturer Part Number)
   *
   * @param mpn - Manufacturer Part Number
   * @returns This instance for chaining
   */
  setMpn(mpn: string): this {
    return this.setProperty('mpn', mpn);
  }

  /**
   * Validate required fields
   * @override
   */
  protected override validate(): void {
    super.validate();

    const name = this.getProperty<string>('name');
    if (!name) {
      throw new Error('ProductSchema: name is required');
    }
  }

  /**
   * Create ProductSchema from a data object
   *
   * @param data - Product data
   * @returns New ProductSchema instance
   */
  static fromData(data: {
    name: string;
    description?: string;
    image?: string | string[];
    sku?: string;
    brand?: string;
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
    url?: string;
    gtin?: string;
    mpn?: string;
  }): ProductSchema {
    const schema = new ProductSchema().setName(data.name);

    if (data.description) schema.setDescription(data.description);
    if (data.image) schema.setImage(data.image);
    if (data.sku) schema.setSku(data.sku);
    if (data.brand) schema.setBrand(data.brand);
    if (data.price && data.currency) schema.setPrice(data.price, data.currency);
    if (data.availability) schema.setAvailability(data.availability);
    if (data.url) schema.setUrl(data.url);
    if (data.gtin) schema.setGtin(data.gtin);
    if (data.mpn) schema.setMpn(data.mpn);

    return schema;
  }
}
