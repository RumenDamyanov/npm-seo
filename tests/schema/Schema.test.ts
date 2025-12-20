/**
 * Tests for Schema.org classes
 */

import { ArticleSchema, BreadcrumbListSchema, ProductSchema } from '../../src/schema';

describe('ArticleSchema', () => {
  it('should create basic article schema', () => {
    const article = new ArticleSchema()
      .setHeadline('Test Article')
      .setDescription('Test description');

    const json = article.toJson();

    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('Article');
    expect(json.headline).toBe('Test Article');
    expect(json.description).toBe('Test description');
  });

  it('should support method chaining', () => {
    const article = new ArticleSchema()
      .setHeadline('Test')
      .setDescription('Description')
      .setImage('https://example.com/image.jpg')
      .setDatePublished(new Date('2024-01-01'))
      .setDateModified(new Date('2024-01-02'));

    const json = article.toJson();

    expect(json.headline).toBe('Test');
    expect(json.description).toBe('Description');
    expect(json.image).toBe('https://example.com/image.jpg');
    expect(json.datePublished).toBe('2024-01-01T00:00:00.000Z');
    expect(json.dateModified).toBe('2024-01-02T00:00:00.000Z');
  });

  it('should set author', () => {
    const article = new ArticleSchema().setAuthor({
      '@type': 'Person',
      name: 'John Doe',
      url: 'https://example.com/john',
    });

    const json = article.toJson();

    expect(json.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
      url: 'https://example.com/john',
    });
  });

  it('should set publisher', () => {
    const article = new ArticleSchema().setPublisher({
      '@type': 'Organization',
      name: 'Example Inc',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    });

    const json = article.toJson();

    expect(json.publisher).toEqual({
      '@type': 'Organization',
      name: 'Example Inc',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    });
  });

  it('should convert to JSON-LD string', () => {
    const article = new ArticleSchema().setHeadline('Test');

    const jsonString = article.toJsonLd();

    expect(jsonString).toContain('"@context"');
    expect(jsonString).toContain('"@type"');
    expect(jsonString).toContain('"headline"');
    expect(() => JSON.parse(jsonString)).not.toThrow();
  });
});

describe('BreadcrumbListSchema', () => {
  it('should create empty breadcrumb list', () => {
    const breadcrumbs = new BreadcrumbListSchema();

    const json = breadcrumbs.toJson();

    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toEqual([]);
  });

  it('should add breadcrumb items', () => {
    const breadcrumbs = new BreadcrumbListSchema()
      .addItem('Home', 'https://example.com', 1)
      .addItem('Blog', 'https://example.com/blog', 2)
      .addItem('Post', 'https://example.com/blog/post', 3);

    const json = breadcrumbs.toJson();

    expect(json.itemListElement).toHaveLength(3);
    expect(json.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    });
    expect(json.itemListElement[2].name).toBe('Post');
  });

  it('should support method chaining', () => {
    const breadcrumbs = new BreadcrumbListSchema()
      .addItem('Home', 'https://example.com', 1)
      .addItem('Blog', 'https://example.com/blog', 2);

    expect(breadcrumbs).toBeInstanceOf(BreadcrumbListSchema);

    const json = breadcrumbs.toJson();
    expect(json.itemListElement).toHaveLength(2);
  });

  it('should handle empty items', () => {
    const breadcrumbs = new BreadcrumbListSchema();

    const jsonString = breadcrumbs.toJsonLd();

    expect(() => JSON.parse(jsonString)).not.toThrow();
  });
});

describe('ProductSchema', () => {
  it('should create basic product schema', () => {
    const product = new ProductSchema()
      .setName('Test Product')
      .setDescription('Product description')
      .setSKU('PROD-001');

    const json = product.toJson();

    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('Product');
    expect(json.name).toBe('Test Product');
    expect(json.description).toBe('Product description');
    expect(json.sku).toBe('PROD-001');
  });

  it('should set product image', () => {
    const product = new ProductSchema().setImage('https://example.com/product.jpg');

    const json = product.toJson();

    expect(json.image).toBe('https://example.com/product.jpg');
  });

  it('should set brand', () => {
    const product = new ProductSchema().setBrand({
      '@type': 'Brand',
      name: 'Example Brand',
    });

    const json = product.toJson();

    expect(json.brand).toEqual({
      '@type': 'Brand',
      name: 'Example Brand',
    });
  });

  it('should set offers', () => {
    const product = new ProductSchema().setOffers({
      '@type': 'Offer',
      price: '99.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://example.com/product',
    });

    const json = product.toJson();

    expect(json.offers).toEqual({
      '@type': 'Offer',
      price: '99.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://example.com/product',
    });
  });

  it('should set aggregate rating', () => {
    const product = new ProductSchema().setAggregateRating({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      reviewCount: 100,
    });

    const json = product.toJson();

    expect(json.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      reviewCount: 100,
    });
  });

  it('should add reviews', () => {
    const product = new ProductSchema().addReview({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'John Doe',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: 5,
      },
      reviewBody: 'Great product!',
    });

    const json = product.toJson();

    expect(json.review).toHaveLength(1);
    expect(json.review[0].author.name).toBe('John Doe');
  });

  it('should add multiple reviews', () => {
    const product = new ProductSchema()
      .addReview({
        '@type': 'Review',
        author: { '@type': 'Person', name: 'User 1' },
        reviewRating: { '@type': 'Rating', ratingValue: 5 },
      })
      .addReview({
        '@type': 'Review',
        author: { '@type': 'Person', name: 'User 2' },
        reviewRating: { '@type': 'Rating', ratingValue: 4 },
      });

    const json = product.toJson();

    expect(json.review).toHaveLength(2);
  });

  it('should support complete product schema', () => {
    const product = new ProductSchema()
      .setName('Premium Widget')
      .setImage('https://example.com/widget.jpg')
      .setDescription('High-quality widget')
      .setSKU('WIDGET-001')
      .setBrand({ '@type': 'Brand', name: 'WidgetCo' })
      .setOffers({
        '@type': 'Offer',
        price: '149.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: 'https://example.com/widget',
      })
      .setAggregateRating({
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 250,
      })
      .addReview({
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Happy Customer' },
        reviewRating: { '@type': 'Rating', ratingValue: 5 },
        reviewBody: 'Excellent product!',
      });

    const json = product.toJson();

    expect(json.name).toBe('Premium Widget');
    expect(json.sku).toBe('WIDGET-001');
    expect(json.offers.price).toBe('149.99');
    expect(json.aggregateRating.ratingValue).toBe(4.8);
    expect(json.review).toHaveLength(1);
  });

  it('should convert to JSON-LD string', () => {
    const product = new ProductSchema().setName('Test Product').setSKU('TEST-001');

    const jsonString = product.toJsonLd();

    expect(jsonString).toContain('"@type":"Product"');
    expect(() => JSON.parse(jsonString)).not.toThrow();
  });
});

describe('BaseSchema', () => {
  it('should set ID', () => {
    const article = new ArticleSchema().setId('https://example.com/article#main');

    const json = article.toJson();

    expect(json['@id']).toBe('https://example.com/article#main');
  });

  it('should set name', () => {
    const article = new ArticleSchema().setName('Article Name');

    const json = article.toJson();

    expect(json.name).toBe('Article Name');
  });
});
